"use strict";
import table from "../../db/models.js";
import { removeReplacedImage } from "../../helpers/image-files.js";
import { notifyWebsite } from "../../helpers/notify-website.js";
import { StatusCodes } from "http-status-codes";
import {
  sessionCreateSchema,
  sessionUpdateSchema,
} from "../../validation-schema/session-schema.js";

// Keep only the fields the request actually sent.
const sent = (data) =>
  Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

const slugConflict = (res) =>
  res
    .code(StatusCodes.CONFLICT)
    .send({ status: false, message: "Another session already uses this slug." });

const flag = (value) => (value === "true" ? true : value === "false" ? false : undefined);

const STATES = ["upcoming", "past", "recording", "closed"];
const stateFilter = (state) => (STATES.includes(state) ? state : undefined);

const create = async (req, res) => {
  const data = sent(sessionCreateSchema.parse(req.body));
  if (data.slug && (await table.SessionModel.slugTaken(data.slug))) return slugConflict(res);
  const item = await table.SessionModel.create(data);
  notifyWebsite("sessions", [item.slug]);
  return res.code(StatusCodes.CREATED).send({ status: true, data: table.SessionModel.withState(item) });
};

// Admin: every session, hidden ones included. ?q=&state=&is_active=true|false&page=&limit=
const getAll = async (req, res) => {
  const { q, page, limit, is_active, state } = req.query;
  const result = await table.SessionModel.getAll({
    q,
    is_active: flag(is_active),
    state: stateFilter(state),
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
  return res.send(result);
};

// Public: active sessions. ?q=&state=upcoming|past&page=&limit=
const getAllPublic = async (req, res) => {
  const { q, page, limit, state } = req.query;
  const result = await table.SessionModel.getAll({
    active_only: true,
    q,
    state: stateFilter(state),
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
  return res.send(result);
};

// Public: one active session.
const getBySlug = async (req, res) => {
  const item = await table.SessionModel.getBySlug(req.params.slug);
  if (!item || !item.is_active) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(table.SessionModel.withState(item));
};

// Admin: one session by id, active or not.
const getById = async (req, res) => {
  const item = await table.SessionModel.getById(req.params.id);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(table.SessionModel.withState(item));
};

const update = async (req, res) => {
  const data = sent(sessionUpdateSchema.parse(req.body));
  if (data.slug && (await table.SessionModel.slugTaken(data.slug, req.params.id))) {
    return slugConflict(res);
  }
  const previous = await table.SessionModel.getById(req.params.id);
  const item = await table.SessionModel.updateById(req.params.id, data);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  if ("cover_image" in data) await removeReplacedImage(previous?.cover_image, data.cover_image);
  notifyWebsite("sessions", [previous?.slug, item.slug]);
  return res.send({ status: true, data: table.SessionModel.withState(item) });
};

const destroy = async (req, res) => {
  const previous = await table.SessionModel.getById(req.params.id);
  const ok = await table.SessionModel.deleteById(req.params.id);
  if (!ok) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  await removeReplacedImage(previous?.cover_image, null);
  notifyWebsite("sessions", [previous?.slug]);
  return res.code(StatusCodes.NO_CONTENT).send();
};

export default { create, getAll, getAllPublic, getBySlug, getById, update, destroy };
