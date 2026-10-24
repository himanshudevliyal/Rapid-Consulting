"use strict";
import table from "../../db/models.js";
import { notifyWebsite } from "../../helpers/notify-website.js";
import { StatusCodes } from "http-status-codes";
import { jobCreateSchema, jobUpdateSchema } from "../../validation-schema/job-schema.js";

// Keep only the fields the request actually sent.
const sent = (data) =>
  Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

const slugConflict = (res) =>
  res
    .code(StatusCodes.CONFLICT)
    .send({ status: false, message: "Another job already uses this slug." });

const flag = (value) => (value === "true" ? true : value === "false" ? false : undefined);

const create = async (req, res) => {
  const data = sent(jobCreateSchema.parse(req.body));
  if (data.slug && (await table.JobModel.slugTaken(data.slug))) return slugConflict(res);
  const item = await table.JobModel.create(data);
  notifyWebsite("jobs", [item.slug]);
  return res.code(StatusCodes.CREATED).send({ status: true, data: item });
};

// Admin: every job, closed ones included.
const getAll = async (req, res) => {
  const { q, page, limit, is_active } = req.query;
  const result = await table.JobModel.getAll({
    q,
    is_active: flag(is_active),
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
  return res.send(result);
};

// Public: open jobs.
const getAllPublic = async (req, res) => {
  const { q, page, limit } = req.query;
  const result = await table.JobModel.getAll({
    active_only: true,
    q,
    page: Number(page) || 1,
    limit: Number(limit) || 100,
  });
  return res.send(result);
};

// Public: one open job.
const getBySlug = async (req, res) => {
  const item = await table.JobModel.getBySlug(req.params.slug);
  const today = new Date().toISOString().slice(0, 10);
  const closed = item?.closing_date && item.closing_date < today;
  if (!item || !item.is_active || closed) {
    return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  }
  return res.send(item);
};

// Admin: one job by id.
const getById = async (req, res) => {
  const item = await table.JobModel.getById(req.params.id);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(item);
};

const update = async (req, res) => {
  const data = sent(jobUpdateSchema.parse(req.body));
  if (data.slug && (await table.JobModel.slugTaken(data.slug, req.params.id))) {
    return slugConflict(res);
  }
  const previous = await table.JobModel.getById(req.params.id);
  const item = await table.JobModel.updateById(req.params.id, data);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  notifyWebsite("jobs", [previous?.slug, item.slug]);
  return res.send({ status: true, data: item });
};

const destroy = async (req, res) => {
  const previous = await table.JobModel.getById(req.params.id);
  const ok = await table.JobModel.deleteById(req.params.id);
  if (!ok) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  notifyWebsite("jobs", [previous?.slug]);
  return res.code(StatusCodes.NO_CONTENT).send();
};

export default { create, getAll, getAllPublic, getBySlug, getById, update, destroy };
