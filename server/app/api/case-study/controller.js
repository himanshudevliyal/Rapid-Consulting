"use strict";
import table from "../../db/models.js";
import { applyReviewRule, assertPeople, withPeople } from "../../helpers/people-link.js";
import { removeReplacedImage } from "../../helpers/image-files.js";
import { notifyWebsite } from "../../helpers/notify-website.js";
import { StatusCodes } from "http-status-codes";
import {
  caseStudyCreateSchema,
  caseStudyUpdateSchema,
} from "../../validation-schema/case-study-schema.js";

// Keep only the fields the request actually sent.
const sent = (data) =>
  Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

const slugConflict = (res) =>
  res
    .code(StatusCodes.CONFLICT)
    .send({ status: false, message: "Another case study already uses this slug." });

const create = async (req, res) => {
  const data = sent(caseStudyCreateSchema.parse(req.body));
  if (data.slug && (await table.CaseStudyModel.slugTaken(data.slug))) {
    return slugConflict(res);
  }
  await assertPeople(data);
  applyReviewRule(data);
  const item = await table.CaseStudyModel.create(data);
  notifyWebsite("case-studies", [item.slug]);
  return res.code(StatusCodes.CREATED).send({ status: true, data: await withPeople(item) });
};

// Admin: every case study, drafts included. ?q=&is_published=true|false&tag=&page=&limit=
const getAll = async (req, res) => {
  const { q, page, limit, is_published, tag } = req.query;
  const result = await table.CaseStudyModel.getAll({
    q,
    is_published,
    tag,
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
  return res.send({ ...result, data: await withPeople(result.data) });
};

// Public: published case studies only.
const getAllPublic = async (req, res) => {
  const { q, page, limit, tag } = req.query;
  const result = await table.CaseStudyModel.getAll({
    published_only: true,
    q,
    tag,
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
  return res.send({ ...result, data: await withPeople(result.data) });
};

const getBySlug = async (req, res) => {
  const item = await table.CaseStudyModel.getBySlug(req.params.slug);
  if (!item || !item.is_published) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(await withPeople(item));
};

// Admin: one case study by id, published or not.
const getById = async (req, res) => {
  const item = await table.CaseStudyModel.getById(req.params.id);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(await withPeople(item));
};

const update = async (req, res) => {
  const data = sent(caseStudyUpdateSchema.parse(req.body));
  if (data.slug && (await table.CaseStudyModel.slugTaken(data.slug, req.params.id))) {
    return slugConflict(res);
  }
  await assertPeople(data);
  const previous = await table.CaseStudyModel.getById(req.params.id);
  applyReviewRule(data, previous);
  const item = await table.CaseStudyModel.updateById(req.params.id, data);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  if ("cover_image" in data) await removeReplacedImage(previous?.cover_image, data.cover_image);
  if ("proof_image" in data) await removeReplacedImage(previous?.proof_image, data.proof_image);
  notifyWebsite("case-studies", [previous?.slug, item.slug]);
  return res.send({ status: true, data: await withPeople(item) });
};

const destroy = async (req, res) => {
  const previous = await table.CaseStudyModel.getById(req.params.id);
  const ok = await table.CaseStudyModel.deleteById(req.params.id);
  if (!ok) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  await removeReplacedImage(previous?.cover_image, null);
  await removeReplacedImage(previous?.proof_image, null);
  notifyWebsite("case-studies", [previous?.slug]);
  return res.code(StatusCodes.NO_CONTENT).send();
};

export default { create, getAll, getAllPublic, getBySlug, getById, update, destroy };
