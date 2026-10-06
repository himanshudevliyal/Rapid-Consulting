"use strict";
import table from "../../db/models.js";
import { assertCategory, categoryFilter, withCategory } from "../../helpers/category-link.js";
import { removeReplacedImage } from "../../helpers/image-files.js";
import { notifyWebsite } from "../../helpers/notify-website.js";
import { StatusCodes } from "http-status-codes";
import {
  schemeCreateSchema,
  schemeUpdateSchema,
} from "../../validation-schema/scheme-schema.js";

// Keep only the fields the request actually sent.
const sent = (data) =>
  Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

const slugConflict = (res) =>
  res
    .code(StatusCodes.CONFLICT)
    .send({ status: false, message: "Another scheme already uses this slug." });

const create = async (req, res) => {
  const data = sent(schemeCreateSchema.parse(req.body));
  if (data.slug && (await table.SchemeModel.slugTaken(data.slug))) {
    return slugConflict(res);
  }
  await assertCategory(data.category_id);
  const item = await table.SchemeModel.create(data);
  notifyWebsite("schemes", [item.slug]);
  return res.code(StatusCodes.CREATED).send({ status: true, data: await withCategory(item) });
};

// Admin: every scheme, drafts included. ?q=&is_published=true|false&tag=&page=&limit=
const getAll = async (req, res) => {
  const { q, page, limit, is_published, tag, category_id } = req.query;
  const result = await table.SchemeModel.getAll({
    q,
    is_published,
    tag,
    category_id: categoryFilter(category_id),
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
  return res.send({ ...result, data: await withCategory(result.data) });
};

// Public: published schemes only.
const getAllPublic = async (req, res) => {
  const { q, page, limit, tag, category_id } = req.query;
  const result = await table.SchemeModel.getAll({
    published_only: true,
    q,
    tag,
    category_id: categoryFilter(category_id),
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
  return res.send({ ...result, data: await withCategory(result.data) });
};

const getBySlug = async (req, res) => {
  const item = await table.SchemeModel.getBySlug(req.params.slug);
  if (!item || !item.is_published) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(await withCategory(item));
};

// Admin: one scheme by id, published or not.
const getById = async (req, res) => {
  const item = await table.SchemeModel.getById(req.params.id);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(await withCategory(item));
};

const update = async (req, res) => {
  const data = sent(schemeUpdateSchema.parse(req.body));
  if (data.slug && (await table.SchemeModel.slugTaken(data.slug, req.params.id))) {
    return slugConflict(res);
  }
  await assertCategory(data.category_id);
  const previous = await table.SchemeModel.getById(req.params.id);
  const item = await table.SchemeModel.updateById(req.params.id, data);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  if ("cover_image" in data) await removeReplacedImage(previous?.cover_image, data.cover_image);
  notifyWebsite("schemes", [previous?.slug, item.slug]);
  return res.send({ status: true, data: await withCategory(item) });
};

const destroy = async (req, res) => {
  const previous = await table.SchemeModel.getById(req.params.id);
  const ok = await table.SchemeModel.deleteById(req.params.id);
  if (!ok) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  await removeReplacedImage(previous?.cover_image, null);
  notifyWebsite("schemes", [previous?.slug]);
  return res.code(StatusCodes.NO_CONTENT).send();
};

export default { create, getAll, getAllPublic, getBySlug, getById, update, destroy };
