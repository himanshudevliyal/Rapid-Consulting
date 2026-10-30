"use strict";
import { randomUUID } from "node:crypto";
import table from "../../db/models.js";
import { notifyWebsite } from "../../helpers/notify-website.js";
import { createPreviewToken, verifyPreviewToken } from "../../helpers/preview-token.js";
import { refreshRecordRefs } from "../../helpers/site-page-records.js";
import {
  LOCALES,
  MANAGED_TEMPLATE,
  STATUSES,
  TEMPLATE_KEYS,
  checkTemplatePath,
  cloneSections,
  describeErrors,
  getRegistry,
  isUuid,
  normaliseSections,
  starterSections,
  visibleSections,
} from "../../helpers/site-page-registry.js";
import { StatusCodes } from "http-status-codes";
import {
  sitePageCreateSchema,
  sitePageNoteSchema,
  sitePageTranslationSchema,
  sitePageUpdateSchema,
} from "../../validation-schema/site-page-schema.js";

// Keep only the fields the request actually sent.
const sent = (data) =>
  Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

// ── Replies ───────────────────────────────────────────────────────────────
// (409 / 403 / 401 are sent directly: the shared error handler only maps 400,
// 401 and 404.)

const fail = (res, code, message, extra = {}) =>
  res.code(code).send({ status: false, message, ...extra });

const notFound = (res) =>
  res.code(StatusCodes.NOT_FOUND).send({ status: false, error: "Not found", message: "Page not found." });

// 400 with the list of section problems the editor needs to fix.
const invalidSections = (res, errors) =>
  res.code(StatusCodes.BAD_REQUEST).send({
    status: false,
    error: "Bad Request",
    message: describeErrors(errors).slice(0, 5).join("; ") + (errors.length > 5 ? `; and ${errors.length - 5} more` : ""),
    errors,
  });

const isAdmin = (req) => req.user_data?.role === "admin";

const actor = (req) => ({
  id: req.user_data?.id ?? null,
  name: req.user_data?.fullname || req.user_data?.username || null,
});

const isUniqueViolation = (error) => error?.name === "SequelizeUniqueConstraintError";

const pathConflict = (res) =>
  fail(res, StatusCodes.CONFLICT, "Another page in this language already uses this path.", { field: "path" });

// ── Shapes ────────────────────────────────────────────────────────────────

// A page for the admin: every field, plus the other-language versions.
const detail = async (instance) => {
  const row = table.SitePageModel.present(instance);
  const others = await table.SitePageModel.getCounterparts(row.group_id, row.id);
  return {
    ...row,
    counterparts: others.map((other) => ({
      id: other.id,
      locale: other.locale,
      status: other.status,
      translation_status: other.translation_status,
      path: other.path,
      is_live: !!other.published_sections,
    })),
  };
};

// What a revision keeps of the page.
const snapshotOf = (page) => ({
  template: page.template,
  locale: page.locale,
  path: page.path,
  title: page.title,
  h1: page.h1,
  meta_title: page.meta_title,
  meta_description: page.meta_description,
  translation_status: page.translation_status,
  sections: page.sections,
});

const recordRevision = (page, action, req, note) => {
  const who = actor(req);
  return table.SitePageRevisionModel.add({
    site_page_id: page.id,
    version: page.version,
    action,
    note: note || null,
    snapshot: snapshotOf(page),
    created_by: who.id,
    created_by_name: who.name,
  });
};

// Live counterparts, as { locale, path }, for hreflang-style alternates.
const alternatesOf = async (page) =>
  (await table.SitePageModel.getCounterparts(page.group_id, page.id))
    .filter((other) => other.published_sections && other.status !== "archived")
    .map((other) => ({ locale: other.locale, path: other.path }));

// What the public website receives: visible sections only.
const publicShape = async (page, { draft = false } = {}) => {
  const meta = draft ? page : (page.published_meta ?? page);
  return {
    id: page.id,
    page_key: page.page_key,
    group_id: page.group_id,
    template: page.template,
    locale: page.locale,
    path: page.path,
    title: meta.title ?? page.title,
    h1: meta.h1 ?? null,
    meta_title: meta.meta_title ?? null,
    meta_description: meta.meta_description ?? null,
    published_at: page.published_at,
    updated_at: page.updated_at,
    sections: visibleSections(draft ? page.sections : page.published_sections),
    alternates: await alternatesOf(page),
  };
};

const jsonEqual = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

// ── Admin: registry and list ──────────────────────────────────────────────

const registry = async (req, res) => res.send(getRegistry());

// ?q=&template=&locale=&status=&page=&limit=
const getAll = async (req, res) => {
  const { q, template, locale, status, page, limit } = req.query;
  const result = await table.SitePageModel.getAll({
    q: q || undefined,
    template: TEMPLATE_KEYS.includes(template) ? template : undefined,
    locale: LOCALES.includes(locale) ? locale : undefined,
    status: STATUSES.includes(status) ? status : undefined,
    page: Math.max(Number(page) || 1, 1),
    limit: Math.min(Math.max(Number(limit) || 20, 1), 100),
  });
  return res.send(result);
};

const getById = async (req, res) => {
  const page = isUuid(req.params.id) ? await table.SitePageModel.getById(req.params.id) : null;
  if (!page) return notFound(res);
  return res.send(await detail(page));
};

// ── Admin: create / save ──────────────────────────────────────────────────

const create = async (req, res) => {
  const data = sent(sitePageCreateSchema.parse(req.body));
  const templatePathError = checkTemplatePath(data.template, data.path);
  if (templatePathError) return fail(res, StatusCodes.BAD_REQUEST, templatePathError, { field: "path" });
  if (await table.SitePageModel.pathTaken(data.path, data.locale)) return pathConflict(res);

  const { sections, errors } = normaliseSections(
    data.sections === undefined ? starterSections(data.title) : data.sections,
    { template: data.template },
  );
  if (errors.length) return invalidSections(res, errors);
  await refreshRecordRefs(sections);

  const who = actor(req);
  const { note, ...fields } = data;
  let page;
  try {
    page = await table.SitePageModel.create({
      ...fields,
      sections,
      group_id: randomUUID(),
      status: "draft",
      translation_status: "missing",
      version: 1,
      has_unpublished_changes: false,
      created_by: who.id,
      updated_by: who.id,
    });
  } catch (error) {
    if (isUniqueViolation(error)) return pathConflict(res);
    throw error;
  }
  await recordRevision(page, "save", req, note || "Page created");
  return res.code(StatusCodes.CREATED).send({ status: true, data: await detail(page) });
};

const update = async (req, res) => {
  const page = isUuid(req.params.id) ? await table.SitePageModel.getById(req.params.id) : null;
  if (!page) return notFound(res);

  const data = sent(sitePageUpdateSchema.parse(req.body));
  const { note, expected_version, translation_status, ...fields } = data;

  if (expected_version !== undefined && expected_version !== page.version) {
    return fail(
      res,
      StatusCodes.CONFLICT,
      "This page was saved by someone else since you opened it. Reload it to see their changes.",
      { current_version: page.version },
    );
  }
  if (translation_status === "reviewed" && translation_status !== page.translation_status && !isAdmin(req)) {
    return fail(
      res,
      StatusCodes.FORBIDDEN,
      "Only an admin can mark a translation as reviewed.",
    );
  }
  if (page.template === MANAGED_TEMPLATE && fields.path && fields.path !== page.path) {
    return fail(res, StatusCodes.BAD_REQUEST, "The path of a Managed page cannot be changed.", { field: "path" });
  }
  const templatePathError = fields.path ? checkTemplatePath(page.template, fields.path) : null;
  if (templatePathError) return fail(res, StatusCodes.BAD_REQUEST, templatePathError, { field: "path" });
  if (fields.path && fields.path !== page.path && (await table.SitePageModel.pathTaken(fields.path, page.locale, page.id))) {
    return pathConflict(res);
  }

  if (fields.sections !== undefined) {
    const result = normaliseSections(fields.sections, { template: page.template });
    if (result.errors.length) return invalidSections(res, result.errors);
    fields.sections = await refreshRecordRefs(result.sections);
  }

  // Only what really changed counts as a new version.
  const changed = Object.fromEntries(
    Object.entries(fields).filter(([key, value]) => !jsonEqual(value, page[key])),
  );
  const contentChanged = Object.keys(changed).length > 0;
  const statusChange = translation_status !== undefined && translation_status !== page.translation_status;

  let saved = page;
  if (contentChanged) {
    const live = !!page.published_sections;
    const who = actor(req);
    try {
      saved = await table.SitePageModel.updateById(page.id, {
        ...changed,
        version: page.version + 1,
        updated_by: who.id,
        has_unpublished_changes: live ? true : page.has_unpublished_changes,
        // Edits to a page that was sent for review put it back to draft, so the
        // change is not approved by accident.
        status: page.status === "review" ? "draft" : page.status,
      });
    } catch (error) {
      if (isUniqueViolation(error)) return pathConflict(res);
      throw error;
    }
    await recordRevision(saved, "save", req, note);

    // A reviewed translation is no longer reviewed once the content changed.
    // (A client that re-sends the unchanged status on every save counts as not setting it.)
    if (page.translation_status === "reviewed" && (translation_status === undefined || !statusChange)) {
      const group = await table.SitePageModel.getGroup(page.group_id);
      if (group.length > 1) {
        await table.SitePageModel.setGroupTranslationStatus(page.group_id, "needs_review");
        saved = await table.SitePageModel.getById(page.id);
      }
    }
    if (live && changed.path) notifyWebsite("site-pages", [page.path, saved.path]);
  }

  if (statusChange) {
    await table.SitePageModel.setGroupTranslationStatus(page.group_id, translation_status);
    saved = await table.SitePageModel.getById(page.id);
  }

  return res.send({ status: true, data: await detail(saved) });
};

// ── Admin: review / publish workflow ──────────────────────────────────────

// Re-checks the stored draft as a complete page (masthead visible, required
// fields filled). Returns { sections } or sends the 400 itself.
const completeDraft = (page, res) => {
  const result = normaliseSections(page.sections, { template: page.template, strict: true });
  if (result.errors.length) {
    invalidSections(res, result.errors);
    return null;
  }
  return result.sections;
};

const submitReview = async (req, res) => {
  const page = isUuid(req.params.id) ? await table.SitePageModel.getById(req.params.id) : null;
  if (!page) return notFound(res);
  const { note } = sitePageNoteSchema.parse(req.body ?? {});

  if (page.status === "archived") {
    return fail(res, StatusCodes.CONFLICT, "An archived page cannot be sent for review.");
  }
  if (page.status === "review") return res.send({ status: true, data: await detail(page) });
  if (page.status === "published" && !page.has_unpublished_changes) {
    return fail(res, StatusCodes.CONFLICT, "This page is published and has no changes waiting for review.");
  }
  if (!completeDraft(page, res)) return;

  const saved = await table.SitePageModel.updateById(page.id, { status: "review", updated_by: actor(req).id });
  await recordRevision(saved, "submit", req, note);
  return res.send({ status: true, data: await detail(saved) });
};

const publish = async (req, res) => {
  const page = isUuid(req.params.id) ? await table.SitePageModel.getById(req.params.id) : null;
  if (!page) return notFound(res);
  const { note } = sitePageNoteSchema.parse(req.body ?? {});

  if (page.status === "archived") {
    return fail(res, StatusCodes.CONFLICT, "An archived page cannot be published.");
  }
  const sections = completeDraft(page, res);
  if (!sections) return;
  await refreshRecordRefs(sections);

  const saved = await table.SitePageModel.updateById(page.id, {
    sections,
    published_sections: sections,
    published_meta: {
      title: page.title,
      h1: page.h1,
      meta_title: page.meta_title,
      meta_description: page.meta_description,
    },
    published_at: new Date(),
    status: "published",
    has_unpublished_changes: false,
    updated_by: actor(req).id,
  });
  await recordRevision(saved, "publish", req, note);
  notifyWebsite("site-pages", [saved.path]);
  return res.send({ status: true, data: await detail(saved) });
};

const unpublish = async (req, res) => {
  const page = isUuid(req.params.id) ? await table.SitePageModel.getById(req.params.id) : null;
  if (!page) return notFound(res);
  const { note } = sitePageNoteSchema.parse(req.body ?? {});

  if (!page.published_sections) {
    return fail(res, StatusCodes.CONFLICT, "This page is not published.");
  }
  const saved = await table.SitePageModel.updateById(page.id, {
    published_sections: null,
    published_meta: null,
    published_at: null,
    status: "draft",
    has_unpublished_changes: false,
    updated_by: actor(req).id,
  });
  await recordRevision(saved, "unpublish", req, note);
  notifyWebsite("site-pages", [saved.path]);
  return res.send({ status: true, data: await detail(saved) });
};

// ── Admin: translation counterpart ────────────────────────────────────────

// POST /:id/translation { locale, path? } - copies the draft into the other
// language as a new draft (same group, needs review). The existing versions
// are never overwritten.
const createTranslation = async (req, res) => {
  const source = isUuid(req.params.id) ? await table.SitePageModel.getById(req.params.id) : null;
  if (!source) return notFound(res);
  const data = sent(sitePageTranslationSchema.parse(req.body));

  if (data.locale === source.locale) {
    return fail(res, StatusCodes.BAD_REQUEST, "Choose the other language for the counterpart.", { field: "locale" });
  }
  const group = await table.SitePageModel.getGroup(source.group_id);
  const existing = group.find((entry) => entry.locale === data.locale);
  if (existing) {
    return fail(res, StatusCodes.CONFLICT, "This page already has a version in that language.", {
      counterpart_id: existing.id,
    });
  }
  const path = data.path ?? source.path;
  const templatePathError = checkTemplatePath(source.template, path);
  if (templatePathError) return fail(res, StatusCodes.BAD_REQUEST, templatePathError, { field: "path" });
  if (await table.SitePageModel.pathTaken(path, data.locale)) return pathConflict(res);

  const who = actor(req);
  let page;
  try {
    page = await table.SitePageModel.create({
      group_id: source.group_id,
      template: source.template,
      locale: data.locale,
      path,
      title: source.title,
      h1: source.h1,
      meta_title: source.meta_title,
      meta_description: source.meta_description,
      status: "draft",
      translation_status: "needs_review",
      sections: cloneSections(source.sections),
      version: 1,
      has_unpublished_changes: false,
      created_by: who.id,
      updated_by: who.id,
    });
  } catch (error) {
    if (isUniqueViolation(error)) return pathConflict(res);
    throw error;
  }
  await table.SitePageModel.setGroupTranslationStatus(source.group_id, "needs_review");
  await recordRevision(
    page,
    "translate",
    req,
    data.note || `Created from the ${source.locale.toUpperCase()} version (copy of its content, to be translated)`,
  );
  return res
    .code(StatusCodes.CREATED)
    .send({ status: true, data: await detail(await table.SitePageModel.getById(page.id)) });
};

// ── Admin: revisions ──────────────────────────────────────────────────────

const listRevisions = async (req, res) => {
  const page = isUuid(req.params.id) ? await table.SitePageModel.getById(req.params.id) : null;
  if (!page) return notFound(res);
  const revisions = await table.SitePageRevisionModel.list(page.id);
  return res.send({ data: revisions.map((revision) => revision.toJSON()) });
};

const getRevision = async (req, res) => {
  const { id, rid } = req.params;
  const revision = isUuid(id) && isUuid(rid) ? await table.SitePageRevisionModel.getOne(id, rid) : null;
  if (!revision) return notFound(res);
  return res.send(revision.toJSON());
};

// POST /:id/restore/:rid - puts that revision's content into the draft. Path,
// template and language are not restored; the live version is not touched
// until the page is published again.
const restore = async (req, res) => {
  const { id, rid } = req.params;
  const page = isUuid(id) ? await table.SitePageModel.getById(id) : null;
  if (!page) return notFound(res);
  const revision = isUuid(rid) ? await table.SitePageRevisionModel.getOne(page.id, rid) : null;
  if (!revision) return notFound(res);
  const { note } = sitePageNoteSchema.parse(req.body ?? {});

  const snapshot = revision.snapshot ?? {};
  const result = normaliseSections(snapshot.sections ?? [], { template: page.template });
  if (result.errors.length) return invalidSections(res, result.errors);
  await refreshRecordRefs(result.sections);

  const live = !!page.published_sections;
  const saved = await table.SitePageModel.updateById(page.id, {
    title: snapshot.title || page.title,
    h1: snapshot.h1 ?? null,
    meta_title: snapshot.meta_title ?? null,
    meta_description: snapshot.meta_description ?? null,
    sections: result.sections,
    version: page.version + 1,
    updated_by: actor(req).id,
    has_unpublished_changes: live ? true : page.has_unpublished_changes,
    status: page.status === "review" ? "draft" : page.status,
  });
  await recordRevision(saved, "restore", req, note || `Restored version ${revision.version}`);
  return res.send({ status: true, data: await detail(saved) });
};

// ── Admin: preview link, delete ───────────────────────────────────────────

const previewToken = async (req, res) => {
  const page = isUuid(req.params.id) ? await table.SitePageModel.getById(req.params.id) : null;
  if (!page) return notFound(res);
  const { token, expires_at } = createPreviewToken(page.id);
  return res.send({ token, expires_at, url_path: `/${page.locale}/preview/${page.id}` });
};

const destroy = async (req, res) => {
  const page = isUuid(req.params.id) ? await table.SitePageModel.getById(req.params.id) : null;
  if (!page) return notFound(res);
  const wasLive = !!page.published_sections;
  await table.SitePageRevisionModel.removeForPage(page.id);
  await table.SitePageModel.deleteById(page.id);
  if (wasLive) notifyWebsite("site-pages", [page.path]);
  return res.code(StatusCodes.NO_CONTENT).send();
};

// ── Public ────────────────────────────────────────────────────────────────

// Published pages: [{ id, page_key, group_id, template, locale, path, title, updated_at }]
const getAllPublic = async (req, res) => {
  const { locale, template } = req.query;
  const rows = await table.SitePageModel.getLiveList({
    locale: LOCALES.includes(locale) ? locale : undefined,
    template: TEMPLATE_KEYS.includes(template) ? template : undefined,
  });
  return res.send(
    rows.map((row) => ({
      id: row.id,
      page_key: row.page_key,
      group_id: row.group_id,
      template: row.template,
      locale: row.locale,
      path: row.path,
      title: row.published_meta?.title ?? row.title,
      updated_at: row.published_at ?? row.updated_at,
    })),
  );
};

// ?path=your-project/setting-up&locale=en
const getByPath = async (req, res) => {
  const path = String(req.query.path ?? "")
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
  const locale = req.query.locale || "en";
  if (!path || !LOCALES.includes(locale)) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });

  const page = await table.SitePageModel.getLiveByPath(path, locale);
  if (!page) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(await publicShape(page));
};

// GET /preview/:id?token= - the DRAFT of a page, for the preview link only.
const getPreview = async (req, res) => {
  res.header("Cache-Control", "no-store");
  const { id } = req.params;
  if (!isUuid(id) || !verifyPreviewToken(req.query.token, id)) {
    return res
      .code(StatusCodes.UNAUTHORIZED)
      .send({ status: false, error: "Unauthorized", message: "This preview link is invalid or has expired." });
  }
  const page = await table.SitePageModel.getById(id);
  if (!page) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(await publicShape(page, { draft: true }));
};

export default {
  registry,
  getAll,
  getById,
  create,
  update,
  submitReview,
  publish,
  unpublish,
  createTranslation,
  listRevisions,
  getRevision,
  restore,
  previewToken,
  destroy,
  getAllPublic,
  getByPath,
  getPreview,
};
