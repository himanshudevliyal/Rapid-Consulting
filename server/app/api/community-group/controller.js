"use strict";
import table from "../../db/models.js";
import { notifyWebsite } from "../../helpers/notify-website.js";
import { StatusCodes } from "http-status-codes";
import {
  communityGroupCreateSchema,
  communityGroupUpdateSchema,
} from "../../validation-schema/community-group-schema.js";

// Keep only the fields the request actually sent.
const sent = (data) =>
  Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

const flag = (value) => (value === "true" ? true : value === "false" ? false : undefined);

const create = async (req, res) => {
  const data = sent(communityGroupCreateSchema.parse(req.body));
  const item = await table.CommunityGroupModel.create(data);
  notifyWebsite("community-groups");
  return res.code(StatusCodes.CREATED).send({ status: true, data: item });
};

// Admin: every group, hidden ones included. ?q=&is_active=true|false&page=&limit=
const getAll = async (req, res) => {
  const { q, page, limit, is_active } = req.query;
  const result = await table.CommunityGroupModel.getAll({
    q,
    is_active: flag(is_active),
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
  return res.send(result);
};

// Public: active groups, plain array. ?placement=home|industries|resources|advisers|schemes
// (all active groups when no placement is given).
const getAllPublic = async (req, res) => {
  const groups = await table.CommunityGroupModel.getPublic({
    placement: req.query.placement || undefined,
  });
  // No invite link yet is an empty string, never null.
  return res.send(groups.map((group) => ({ ...group, join_url: group.join_url ?? "" })));
};

// Admin: one group by id.
const getById = async (req, res) => {
  const item = await table.CommunityGroupModel.getById(req.params.id);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(item);
};

const update = async (req, res) => {
  const data = sent(communityGroupUpdateSchema.parse(req.body));
  const item = await table.CommunityGroupModel.updateById(req.params.id, data);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  notifyWebsite("community-groups");
  return res.send({ status: true, data: item });
};

const destroy = async (req, res) => {
  const ok = await table.CommunityGroupModel.deleteById(req.params.id);
  if (!ok) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  notifyWebsite("community-groups");
  return res.code(StatusCodes.NO_CONTENT).send();
};

export default { create, getAll, getAllPublic, getById, update, destroy };
