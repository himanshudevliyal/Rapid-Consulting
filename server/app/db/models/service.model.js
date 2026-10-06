"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Op, QueryTypes } from "sequelize";
import { toPgArray } from "../../helpers/to-pg-array.js";
import { categoryFilter, withCategory } from "../../helpers/category-link.js";

let ServiceModel = null;

const SERVICE = constants.models.SERVICE_TABLE;
const TRANSLATION = constants.models.SERVICE_TRANSLATION_TABLE;

// "service-index" is the /services landing page record. It is only fetched by
// code and is left out of service lists on the website; every other Format is
// listed. (Formats are managed in the dashboard: /v1/service/format.)
const INDEX_TYPE = "service-index";

const init = async (sequelize) => {
  ServiceModel = sequelize.define(
    SERVICE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: { args: true, msg: "Service exist with this code." },
      },
      slug: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: { args: true, msg: "Service exist with this slug." },
      },
      type: {
        type: DataTypes.STRING(40),
        allowNull: false,
        defaultValue: "service",
      },
      family_code: { type: DataTypes.STRING(32), allowNull: true },
      category_id: { type: DataTypes.UUID, allowNull: true },
      icon: { type: DataTypes.STRING(80), allowNull: true },
      pictures: { type: DataTypes.JSONB, defaultValue: [] },
      related_codes: { type: DataTypes.JSONB, defaultValue: [] },
      legacy_urls: { type: DataTypes.JSONB, defaultValue: [] },
      sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["type"] }, { fields: ["family_code"] }, { fields: ["category_id"] }],
    },
  );

  return ServiceModel;
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await ServiceModel.create(
    {
      code: req.body.code,
      slug: req.body.slug,
      type: req.body.type,
      family_code: req.body.family_code || null,
      category_id: req.body.category_id || null,
      icon: req.body.icon,
      pictures: req.body.pictures,
      related_codes: req.body.related_codes,
      legacy_urls: req.body.legacy_urls,
      sort_order: req.body.sort_order,
      is_active: req.body.is_active,
    },
    options,
  );

  return data.dataValues;
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: req?.params?.id || id },
    returning: true,
    raw: true,
  };
  if (transaction) options.transaction = transaction;

  // Only keys present in the body are written, so a partial update such as
  // `{ is_active: false }` never clears the other columns.
  const keys = [
    "code",
    "slug",
    "type",
    "family_code",
    "category_id",
    "icon",
    "pictures",
    "related_codes",
    "legacy_urls",
    "sort_order",
    "is_active",
  ];
  const values = Object.fromEntries(
    keys.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]),
  );

  return await ServiceModel.update(values, options);
};

// One summary row per service in the requested locale. Missing translations
// fall back to the default locale and `has_locale` tells the client so.
const summaryQuery = (whereClause, pagination = "") => `
  SELECT
      srv.id, srv.code, srv.slug, srv.type, srv.family_code, srv.icon,
      srv.pictures, srv.sort_order, srv.related_codes, srv.updated_at,
      srv.is_active, srv.category_id,
      CASE WHEN cat.id IS NULL THEN NULL
           ELSE JSON_BUILD_OBJECT('id', cat.id, 'title', cat.title, 'slug', cat.slug)
      END AS category,
      COALESCE(tr.status, def.status) AS status,
      COALESCE(tr.locale, def.locale) AS locale,
      (tr.id IS NOT NULL) AS has_locale,
      COALESCE(tr.title, def.title) AS title,
      COALESCE(tr.h1, def.h1) AS h1,
      COALESCE(tr.short_description, def.short_description) AS short_description,
      (
        SELECT COALESCE(JSON_AGG(av.locale ORDER BY av.locale), '[]'::json)
        FROM ${TRANSLATION} av
        WHERE av.service_id = srv.id
      ) AS available_locales
    FROM ${SERVICE} srv
    JOIN ${TRANSLATION} def ON def.service_id = srv.id AND def.locale = :defaultLocale
    LEFT JOIN ${TRANSLATION} tr ON tr.service_id = srv.id AND tr.locale = :locale
    LEFT JOIN ${constants.models.CATEGORY_TABLE} cat ON cat.id = srv.category_id
    ${whereClause}
    ORDER BY srv.sort_order ASC, srv.code ASC
    ${pagination}
`;

const resolveLocale = (value) =>
  constants.locales.includes(value) ? value : constants.defaultLocale;

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {
    locale: resolveLocale(req.query.locale),
    defaultLocale: constants.defaultLocale,
  };

  // The admin panel passes include_inactive=true to manage hidden services.
  if (req.query.include_inactive !== "true") {
    whereConditions.push("srv.is_active = true");
  }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(
      `(def.title ILIKE :query OR tr.title ILIKE :query OR srv.code ILIKE :query)`,
    );
    queryParams.query = `%${q}%`;
  }

  // ?type=service.service-family filters by Format. Without it the website
  // gets every Format except the /services index page; the admin view
  // (include_inactive=true) gets all of them, so the index page can be edited.
  if (req.query.type) {
    whereConditions.push("srv.type = ANY(:types)");
    queryParams.types = toPgArray(req.query.type.split("."));
  } else if (req.query.include_inactive !== "true") {
    whereConditions.push("srv.type <> :indexType");
    queryParams.indexType = INDEX_TYPE;
  }

  const families = req.query.family ? req.query.family.split(".") : null;
  if (families?.length) {
    whereConditions.push("srv.family_code = ANY(:families)");
    queryParams.families = toPgArray(families);
  }

  // ?category_id= filters by category (a malformed id matches nothing).
  if (req.query.category_id) {
    whereConditions.push("srv.category_id = :categoryId");
    queryParams.categoryId = categoryFilter(req.query.category_id);
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = limit ? (page - 1) * limit : 0;

  // The admin view (include_inactive=true, no filters) has no conditions;
  // an empty "WHERE" would be a SQL syntax error.
  const whereClause = whereConditions.length
    ? `WHERE ${whereConditions.join(" AND ")}`
    : "";

  const services = await ServiceModel.sequelize.query(
    summaryQuery(whereClause, "LIMIT :limit OFFSET :offset"),
    {
      replacements: { ...queryParams, limit, offset },
      type: QueryTypes.SELECT,
      raw: true,
    },
  );

  const count = await ServiceModel.sequelize.query(
    `
    SELECT COUNT(srv.id)::integer AS total
      FROM ${SERVICE} srv
      JOIN ${TRANSLATION} def ON def.service_id = srv.id AND def.locale = :defaultLocale
      LEFT JOIN ${TRANSLATION} tr ON tr.service_id = srv.id AND tr.locale = :locale
      ${whereClause}
  `,
    {
      replacements: { ...queryParams },
      type: QueryTypes.SELECT,
      raw: true,
      plain: true,
    },
  );

  return { services, total: count?.total ?? 0 };
};

const getSummariesByCodes = async (codes, locale) => {
  if (!codes?.length) return [];
  return await ServiceModel.sequelize.query(
    summaryQuery(
      "WHERE srv.is_active = true AND srv.code = ANY(:codes) AND srv.type <> :indexType",
    ),
    {
      replacements: {
        codes: toPgArray(codes),
        indexType: INDEX_TYPE,
        locale,
        defaultLocale: constants.defaultLocale,
      },
      type: QueryTypes.SELECT,
      raw: true,
    },
  );
};

// Related services = the other active services of the same Family / topic.
// A service in family S05 gets its S05 siblings plus the S05 family page; a
// family page gets the services inside it. Services without a family get none.
const getRelatedServices = async (service, locale, limit = 12) => {
  const family = service.family_code || service.code;
  const rows = await ServiceModel.sequelize.query(
    summaryQuery(
      `WHERE srv.is_active = true
         AND srv.id <> :id
         AND srv.type <> :indexType
         AND (srv.family_code = :family OR srv.code = :family)`,
      "LIMIT :limit",
    ),
    {
      replacements: {
        id: service.id,
        family,
        indexType: INDEX_TYPE,
        locale,
        defaultLocale: constants.defaultLocale,
        limit: Math.min(Math.max(Number(limit) || 12, 1), 100),
      },
      type: QueryTypes.SELECT,
      raw: true,
    },
  );
  return rows.map(({ related_codes, ...item }) => item);
};

const withContent = async (service, requestedLocale) => {
  if (!service) return null;

  const locale = resolveLocale(requestedLocale);
  const translations = await ServiceModel.sequelize.query(
    `SELECT * FROM ${TRANSLATION} WHERE service_id = :id`,
    { replacements: { id: service.id }, type: QueryTypes.SELECT, raw: true },
  );

  const content =
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === constants.defaultLocale);
  if (!content) return null;

  const [related, familyRows] = await Promise.all([
    getRelatedServices(service, locale),
    getSummariesByCodes(service.family_code ? [service.family_code] : [], locale),
  ]);

  const { id: _translationId, service_id, created_at, ...fields } = content;

  const full = {
    ...service,
    ...fields,
    updated_at:
      new Date(content.updated_at) > new Date(service.updated_at)
        ? content.updated_at
        : service.updated_at,
    requested_locale: locale,
    is_fallback: content.locale !== locale,
    available_locales: translations.map((t) => t.locale).sort(),
    family: familyRows[0] ?? null,
    related,
  };

  return withCategory(full);
};

const getBySlug = async (req, slug) => {
  const service = await ServiceModel.findOne({
    where: { slug: req.params?.slug || slug, is_active: true },
    raw: true,
  });
  return await withContent(service, req.query?.locale);
};

const getByCode = async (req, code) => {
  const service = await ServiceModel.findOne({
    where: { code: req.params?.code || code, is_active: true },
    raw: true,
  });
  return await withContent(service, req.query?.locale);
};

// Public: related services of one service, by slug (?locale=hi&limit=12).
const getRelated = async (req, slug) => {
  const service = await ServiceModel.findOne({
    where: { slug: req.params?.slug || slug, is_active: true },
    raw: true,
  });
  if (!service) return null;
  return await getRelatedServices(
    service,
    resolveLocale(req.query?.locale),
    req.query?.limit,
  );
};

const getById = async (req, id) => {
  return await ServiceModel.findOne({
    where: { id: req.params?.id || id },
    raw: true,
    plain: true,
  });
};

// Which unique field ("code" or "slug") is already taken by another service,
// or null. Lets the API answer 409 with a clear message instead of a 500.
const findConflict = async ({ code, slug, excludeId }) => {
  const taken = [];
  if (code) taken.push({ code });
  if (slug) taken.push({ slug });
  if (!taken.length) return null;

  const where = { [Op.or]: taken };
  if (excludeId) where.id = { [Op.ne]: excludeId };

  const row = await ServiceModel.findOne({ where, raw: true });
  if (!row) return null;
  return code && row.code === code ? "code" : "slug";
};

// Next free code for a prefix: D096, X03, ... The admin never types one.
const nextCode = async (prefix, width = 3) => {
  const [row] = await ServiceModel.sequelize.query(
    `SELECT COALESCE(MAX(SUBSTRING(code FROM ${prefix.length + 1})::integer), 0) + 1 AS next
       FROM ${SERVICE}
      WHERE code ~ :pattern`,
    { replacements: { pattern: `^${prefix}[0-9]+$` }, type: QueryTypes.SELECT },
  );
  return `${prefix}${String(row.next).padStart(width, "0")}`;
};

const deleteById = async (req, id, transaction) => {
  const options = { where: { id: req.params?.id || id } };
  if (transaction) options.transaction = transaction;
  return await ServiceModel.destroy(options);
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  getById: getById,
  getBySlug: getBySlug,
  getByCode: getByCode,
  getRelated: getRelated,
  findConflict: findConflict,
  nextCode: nextCode,
  deleteById: deleteById,
};
