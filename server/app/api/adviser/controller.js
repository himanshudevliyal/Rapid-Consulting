"use strict";
import table from "../../db/models.js";
import { StatusCodes } from "http-status-codes";

const create = async (req, res) => {
  const item = await table.AdviserModel.create(req.body);
  return res.code(StatusCodes.CREATED).send({ status: true, data: item });
};

const getAll = async (req, res) => {
  const result = await table.AdviserModel.getAll();
  return res.send(result);
};

const getAllPublic = async (req, res) => {
  const result = await table.AdviserModel.getAll({ active_only: true });
  return res.send(result);
};

const getById = async (req, res) => {
  const item = await table.AdviserModel.getById(req.params.id);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(item);
};

const update = async (req, res) => {
  const item = await table.AdviserModel.updateById(req.params.id, req.body);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send({ status: true, data: item });
};

const destroy = async (req, res) => {
  const ok = await table.AdviserModel.deleteById(req.params.id);
  if (!ok) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.code(StatusCodes.NO_CONTENT).send();
};

export default { create, getAll, getAllPublic, getById, update, destroy };
