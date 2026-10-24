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

const create = async (req, res) => {
  const data = sent(adviserCreateSchema.parse(req.body));
  const item = await table.AdviserModel.create(data);
  notifyWebsite("advisers");
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

// Admin: one adviser by id.
const getById = async (req, res) => {
  const item = await table.AdviserModel.getById(req.params.id);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(item);
};

const update = async (req, res) => {
  const data = sent(adviserUpdateSchema.parse(req.body));
  const previous = await table.AdviserModel.getById(req.params.id);
  const item = await table.AdviserModel.updateById(req.params.id, data);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  if ("photo" in data) await removeReplacedImage(previous?.photo, data.photo);
  notifyWebsite("advisers");
  return res.send({ status: true, data: item });
};

const destroy = async (req, res) => {
  const previous = await table.AdviserModel.getById(req.params.id);
  const ok = await table.AdviserModel.deleteById(req.params.id);
  if (!ok) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  await removeReplacedImage(previous?.photo, null);
  notifyWebsite("advisers");
  return res.code(StatusCodes.NO_CONTENT).send();
};

export default { create, getAll, getAllPublic, getById, update, destroy };
