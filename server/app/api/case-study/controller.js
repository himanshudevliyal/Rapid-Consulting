"use strict";
import table from "../../db/models.js";
import { StatusCodes } from "http-status-codes";

const create = async (req, res) => {
  const item = await table.CaseStudyModel.create(req.body);
  return res.code(StatusCodes.CREATED).send({ status: true, data: item });
};

const getAll = async (req, res) => {
  const { q, page, limit } = req.query;
  const result = await table.CaseStudyModel.getAll({ q, page: Number(page) || 1, limit: Number(limit) || 20 });
  return res.send(result);
};

const getAllPublic = async (req, res) => {
  const { q, page, limit } = req.query;
  const result = await table.CaseStudyModel.getAll({ published_only: true, q, page: Number(page) || 1, limit: Number(limit) || 20 });
  return res.send(result);
};

const getBySlug = async (req, res) => {
  const item = await table.CaseStudyModel.getBySlug(req.params.slug);
  if (!item || !item.is_published) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(item);
};

const getById = async (req, res) => {
  const item = await table.CaseStudyModel.getById(req.params.id);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(item);
};

const update = async (req, res) => {
  const item = await table.CaseStudyModel.updateById(req.params.id, req.body);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send({ status: true, data: item });
};

const destroy = async (req, res) => {
  const ok = await table.CaseStudyModel.deleteById(req.params.id);
  if (!ok) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.code(StatusCodes.NO_CONTENT).send();
};

export default { create, getAll, getAllPublic, getBySlug, getById, update, destroy };
