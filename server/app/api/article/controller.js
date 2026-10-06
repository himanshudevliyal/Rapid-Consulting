"use strict";
import table from "../../db/models.js";
import { assertCategory, categoryFilter, withCategory } from "../../helpers/category-link.js";
import { removeReplacedImage } from "../../helpers/image-files.js";
import { notifyWebsite } from "../../helpers/notify-website.js";
import { StatusCodes } from "http-status-codes";
import {
  articleCreateSchema,
  articleUpdateSchema,
} from "../../validation-schema/article-schema.js";

// Keep only the fields the request actually sent.
const sent = (data) =>
  Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

const slugConflict = (res) =>
  res
    .code(StatusCodes.CONFLICT)
    .send({ status: false, message: "Another article already uses this slug." });

const create = async (req, res) => {
  const data = sent(articleCreateSchema.parse(req.body));
  if (data.slug && (await table.ArticleModel.slugTaken(data.slug))) {
    return slugConflict(res);
  }
  await assertCategory(data.category_id);
  const article = await table.ArticleModel.create(data);
  notifyWebsite("articles", [article.slug]);
  return res.code(StatusCodes.CREATED).send({ status: true, data: await withCategory(article) });
};

// Admin: every article, drafts included. ?q=&is_published=true|false&tag=&page=&limit=
const getAll = async (req, res) => {
  const { q, page, limit, is_published, tag, category_id } = req.query;
  const result = await table.ArticleModel.getAll({
    q,
    is_published,
    tag,
    category_id: categoryFilter(category_id),
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
  return res.send({ ...result, data: await withCategory(result.data) });
};

// Public: published articles only.
const getAllPublic = async (req, res) => {
  const { q, page, limit, tag, category_id } = req.query;
  const result = await table.ArticleModel.getAll({
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
  const article = await table.ArticleModel.getBySlug(req.params.slug);
  if (!article || !article.is_published) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(await withCategory(article));
};

// Admin: one article by id, published or not.
const getById = async (req, res) => {
  const article = await table.ArticleModel.getById(req.params.id);
  if (!article) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(await withCategory(article));
};

const update = async (req, res) => {
  const data = sent(articleUpdateSchema.parse(req.body));
  if (data.slug && (await table.ArticleModel.slugTaken(data.slug, req.params.id))) {
    return slugConflict(res);
  }
  await assertCategory(data.category_id);
  const previous = await table.ArticleModel.getById(req.params.id);
  const article = await table.ArticleModel.updateById(req.params.id, data);
  if (!article) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  if ("cover_image" in data) await removeReplacedImage(previous?.cover_image, data.cover_image);
  notifyWebsite("articles", [previous?.slug, article.slug]);
  return res.send({ status: true, data: await withCategory(article) });
};

const destroy = async (req, res) => {
  const previous = await table.ArticleModel.getById(req.params.id);
  const ok = await table.ArticleModel.deleteById(req.params.id);
  if (!ok) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  await removeReplacedImage(previous?.cover_image, null);
  notifyWebsite("articles", [previous?.slug]);
  return res.code(StatusCodes.NO_CONTENT).send();
};

export default { create, getAll, getAllPublic, getBySlug, getById, update, destroy };
