"use strict";
import table from "../../db/models.js";
import constants from "../../lib/constants/index.js";
import { removeReplacedImage } from "../../helpers/image-files.js";
import { notifyWebsite } from "../../helpers/notify-website.js";
import { StatusCodes } from "http-status-codes";
import {
  industryCreateSchema,
  industryUpdateSchema,
} from "../../validation-schema/industry-schema.js";

// Keep only the fields the request actually sent.
const sent = (data) =>
  Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

const slugConflict = (res) =>
  res
    .code(StatusCodes.CONFLICT)
    .send({ status: false, message: "Another industry already uses this slug." });

const create = async (req, res) => {
  const data = sent(industryCreateSchema.parse(req.body));
  if (data.slug && (await table.IndustryModel.slugTaken(data.slug))) {
    return slugConflict(res);
  }
  const item = await table.IndustryModel.create(data);
  notifyWebsite("industries", [item.slug]);
  return res.code(StatusCodes.CREATED).send({ status: true, data: item });
};

// Admin: every industry, hidden ones included.
const getAll = async (req, res) => {
  return res.send(await table.IndustryModel.getAll());
};

// Public: active industries for cards and menus (without the long body).
const getAllPublic = async (req, res) => {
  return res.send(await table.IndustryModel.getAll({ active_only: true, full: false }));
};

// Public: one industry with the services and schemes chosen for its page.
const getBySlug = async (req, res) => {
  const item = await table.IndustryModel.getBySlug(req.params.slug);
  if (!item || !item.is_active) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });

  const locale = constants.locales.includes(req.query.locale)
    ? req.query.locale
    : constants.defaultLocale;
  const [services, schemes] = await Promise.all([
    table.ServiceModel.getSummariesBySlugs(item.service_slugs, locale),
    table.SchemeModel.getPublishedBySlugs(item.scheme_slugs),
  ]);
  return res.send({ ...item.toJSON(), services, schemes });
};

// Admin: one industry by id.
const getById = async (req, res) => {
  const item = await table.IndustryModel.getById(req.params.id);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(item);
};

const update = async (req, res) => {
  const data = sent(industryUpdateSchema.parse(req.body));
  if (data.slug && (await table.IndustryModel.slugTaken(data.slug, req.params.id))) {
    return slugConflict(res);
  }
  const previous = await table.IndustryModel.getById(req.params.id);
  const item = await table.IndustryModel.updateById(req.params.id, data);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  if ("image" in data) await removeReplacedImage(previous?.image, data.image);
  notifyWebsite("industries", [previous?.slug, item.slug]);
  return res.send({ status: true, data: item });
};

const destroy = async (req, res) => {
  const previous = await table.IndustryModel.getById(req.params.id);
  const ok = await table.IndustryModel.deleteById(req.params.id);
  if (!ok) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  await removeReplacedImage(previous?.image, null);
  notifyWebsite("industries", [previous?.slug]);
  return res.code(StatusCodes.NO_CONTENT).send();
};

export default { create, getAll, getAllPublic, getBySlug, getById, update, destroy };
