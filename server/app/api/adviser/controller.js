"use strict";
import table from "../../db/models.js";
import { removeReplacedImage } from "../../helpers/image-files.js";
import { notifyWebsite } from "../../helpers/notify-website.js";
import { StatusCodes } from "http-status-codes";
import {
  adviserCreateSchema,
  adviserUpdateSchema,
} from "../../validation-schema/adviser-schema.js";

// Keep only the fields the request actually sent.
const sent = (data) =>
  Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

const slugConflict = (res) =>
  res
    .code(StatusCodes.CONFLICT)
    .send({ status: false, message: "Another team member already uses this slug." });

// Articles, schemes and case studies show their author / reviewer, so they
// are refreshed too when a person changes or is removed.
const notifyContent = () => {
  notifyWebsite("articles");
  notifyWebsite("schemes");
  notifyWebsite("case-studies");
};

const create = async (req, res) => {
  const data = sent(adviserCreateSchema.parse(req.body));
  if (data.slug && (await table.AdviserModel.slugTaken(data.slug))) return slugConflict(res);
  const item = await table.AdviserModel.create(data);
  notifyWebsite("advisers", [item.slug]);
  return res.code(StatusCodes.CREATED).send({ status: true, data: item });
};

// Admin: every adviser, hidden ones included.
const getAll = async (req, res) => {
  return res.send(await table.AdviserModel.getAll({ q: req.query.q }));
};

// Public: active advisers, plain array.
const getAllPublic = async (req, res) => {
  return res.send(await table.AdviserModel.getAll({ active_only: true }));
};

// Public: one active adviser (team profile page).
const getBySlug = async (req, res) => {
  const item = await table.AdviserModel.getBySlug(req.params.slug);
  if (!item || !item.is_active) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(item);
};

// Admin: one adviser by id.
const getById = async (req, res) => {
  const item = await table.AdviserModel.getById(req.params.id);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(item);
};

const update = async (req, res) => {
  const data = sent(adviserUpdateSchema.parse(req.body));
  if (data.slug && (await table.AdviserModel.slugTaken(data.slug, req.params.id))) {
    return slugConflict(res);
  }
  const previous = await table.AdviserModel.getById(req.params.id);
  const item = await table.AdviserModel.updateById(req.params.id, data);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  if ("photo" in data) await removeReplacedImage(previous?.photo, data.photo);
  notifyWebsite("advisers", [previous?.slug, item.slug]);
  notifyContent();
  return res.send({ status: true, data: item });
};

const destroy = async (req, res) => {
  const previous = await table.AdviserModel.getById(req.params.id);
  const ok = await table.AdviserModel.deleteById(req.params.id);
  if (!ok) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  await removeReplacedImage(previous?.photo, null);
  notifyWebsite("advisers", [previous?.slug]);
  notifyContent();
  return res.code(StatusCodes.NO_CONTENT).send();
};

export default { create, getAll, getAllPublic, getBySlug, getById, update, destroy };
