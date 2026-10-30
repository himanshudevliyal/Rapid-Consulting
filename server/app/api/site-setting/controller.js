"use strict";
import table from "../../db/models.js";
import { notifyWebsite } from "../../helpers/notify-website.js";
import { defaultNavigation } from "../../helpers/site-navigation.js";
import { StatusCodes } from "http-status-codes";
import { settingSchemas } from "../../validation-schema/site-setting-schema.js";

// What the website reads when nothing has been saved yet.
const defaults = { navigation: defaultNavigation };

const unknownKey = (res) =>
  res.code(StatusCodes.NOT_FOUND).send({ status: false, error: "Not found", message: "Unknown setting." });

const shape = (key, row) => ({
  key,
  value: row ? row.value : defaults[key](),
  is_default: !row,
  updated_by: row?.updated_by ?? null,
  updated_at: row?.updated_at ?? null,
});

// Admin: one setting. Before anything is saved the built-in default is returned
// (is_default: true), so a form can always start from a full value.
const get = async (req, res) => {
  const { key } = req.params;
  if (!settingSchemas[key]) return unknownKey(res);
  return res.send(shape(key, await table.SiteSettingModel.get(key)));
};

// Admin: save a setting. Body: { value: {...} } (or the value itself).
const put = async (req, res) => {
  const { key } = req.params;
  const schema = settingSchemas[key];
  if (!schema) return unknownKey(res);

  const body = req.body ?? {};
  const input = body.value !== undefined && typeof body.value === "object" ? body.value : body;
  const value = schema.parse(input);

  const row = await table.SiteSettingModel.set(key, value, req.user_data?.id ?? null);
  notifyWebsite(key);
  return res.send({ status: true, data: shape(key, row) });
};

// Public: the saved value, or {} when nothing is saved (the website then uses
// its built-in default).
const getPublic = async (req, res) => {
  const { key } = req.params;
  if (!settingSchemas[key]) return unknownKey(res);
  const row = await table.SiteSettingModel.get(key);
  return res.send(row?.value ?? {});
};

export default { get, put, getPublic };
