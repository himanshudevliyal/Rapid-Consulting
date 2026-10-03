"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, QueryTypes } from "sequelize";
import { toPgArray } from "../../helpers/to-pg-array.js";

let ServiceModel = null;

const SERVICE = constants.models.SERVICE_TABLE;
const TRANSLATION = constants.models.SERVICE_TRANSLATION_TABLE;

// Page types listed as services on the website. "service-index" is the
// /services landing page record and is only fetched by code.
const LISTED_TYPES = ["service", "service-family", "additional-service"];

const init = async (sequelize) => {
  ServiceModel = sequelize.define(
    SERVICE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: { args: true, msg: "Service exist with this code." },
      },
      slug: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: { args: true, msg: "Service exist with this slug." },
      },
      type: {
        type: DataTypes.STRING(40),
        allowNull: false,
        defaultValue: "service",
      },
      family_code: { type: DataTypes.STRING(32), allowNull: true },
      icon: { type: DataTypes.STRING(80), allowNull: true },
      pictures: { type: DataTypes.JSONB, defaultValue: [] },
      related_codes: { type: DataTypes.JSONB, defaultValue: [] },
      legacy_urls: { type: DataTypes.JSONB, defaultValue: [] },
      sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["type"] }, { fields: ["family_code"] }],
    },
  );

  return ServiceModel;
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await ServiceModel.create(
    {
      code: req.body.code,
      slug: req.body.slug,
      type: req.body.type,
      family_code: req.body.family_code || null,
      icon: req.body.icon,
      pictures: req.body.pictures,
      related_codes: req.body.related_codes,
      legacy_urls: req.body.legacy_urls,
      sort_order: req.body.sort_order,
      is_active: req.body.is_active,
    },
    options,
  );

  return data.dataValues;
};

const update = async (req, id, transaction) => {
  const options = {
    where: { id: req?.params?.id || id },
    returning: true,
    raw: true,
  };
  if (transaction) options.transaction = transaction;

  // Only keys present in the body are written, so a partial update such as
  // `{ is_active: false }` never clears the other columns.
  const keys = [
    "code",
    "slug",
    "type",
    "family_code",
    "icon",
    "pictures",
    "related_codes",
    "legacy_urls",
    "sort_order",
    "is_active",
  ];
  const values = Object.fromEntries(
    keys.filter((key) => key in req.body).map((key) => [key, req.body[key]]),
  );

  return await ServiceModel.update(values, options);
};

// One summary row per service in the requested locale. Missing translations
// fall back to the default locale and `has_locale` tells the client so.
const summaryQuery = (whereClause, pagination = "") => `
  SELECT
      srv.id, srv.code, srv.slug, srv.type, srv.family_code, srv.icon,
      srv.pictures, srv.sort_order, srv.related_codes, srv.updated_at,
      COALESCE(tr.locale, def.locale) AS locale,
      (tr.id IS NOT NULL) AS has_locale,
      COALESCE(tr.title, def.title) AS title,
      COALESCE(tr.h1, def.h1) AS h1,
      COALESCE(tr.short_description, def.short_description) AS short_description,
      (
        SELECT COALESCE(JSON_AGG(av.locale ORDER BY av.locale), '[]'::json)
        FROM ${TRANSLATION} av
        WHERE av.service_id = srv.id
      ) AS available_locales
    FROM ${SERVICE} srv
    JOIN ${TRANSLATION} def ON def.service_id = srv.id AND def.locale = :defaultLocale
    LEFT JOIN ${TRANSLATION} tr ON tr.service_id = srv.id AND tr.locale = :locale
    ${whereClause}
    ORDER BY srv.sort_order ASC, srv.code ASC
    ${pagination}
`;

const resolveLocale = (value) =>
  constants.locales.includes(value) ? value : constants.defaultLocale;

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {
    locale: resolveLocale(req.query.locale),
    defaultLocale: constants.defaultLocale,
  };

  // The admin panel passes include_inactive=true to manage hidden services.
  if (req.query.include_inactive !== "true") {
    whereConditions.push("srv.is_active = true");
  }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(
      `(def.title ILIKE :query OR tr.title ILIKE :query OR srv.code ILIKE :query)`,
    );
    queryParams.query = `%${q}%`;
  }

  const types = req.query.type ? req.query.type.split(".") : LISTED_TYPES;
  whereConditions.push("srv.type = ANY(:types)");
  queryParams.types = toPgArray(types);

  const families = req.query.family ? req.query.family.split(".") : null;
  if (families?.length) {
    whereConditions.push("srv.family_code = ANY(:families)");
    queryParams.families = toPgArray(families);
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = limit ? (page - 1) * limit : 0;

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  const services = await ServiceModel.sequelize.query(
    summaryQuery(whereClause, "LIMIT :limit OFFSET :offset"),
    {
      replacements: { ...queryParams, limit, offset },
      type: QueryTypes.SELECT,
      raw: true,
    },
  );

  const count = await ServiceModel.sequelize.query(
    `
    SELECT COUNT(srv.id)::integer AS total
      FROM ${SERVICE} srv
      JOIN ${TRANSLATION} def ON def.service_id = srv.id AND def.locale = :defaultLocale
      LEFT JOIN ${TRANSLATION} tr ON tr.service_id = srv.id AND tr.locale = :locale
      ${whereClause}
  `,
    {
      replacements: { ...queryParams },
      type: QueryTypes.SELECT,
      raw: true,
      plain: true,
    },
  );

  return { services, total: count?.total ?? 0 };
};

const getSummariesByCodes = async (codes, locale) => {
  if (!codes?.length) return [];
  return await ServiceModel.sequelize.query(
    summaryQuery(
      "WHERE srv.is_active = true AND srv.code = ANY(:codes) AND srv.type = ANY(:types)",
    ),
    {
      replacements: {
        codes: toPgArray(codes),
        types: toPgArray(LISTED_TYPES),
        locale,
        defaultLocale: constants.defaultLocale,
      },
      type: QueryTypes.SELECT,
      raw: true,
    },
  );
};

const getRelatedCandidates = async (service, locale) => {
  // Services that link to this one (inbound editorial links) and peers in
  // the same family, in addition to this service's own related codes.
  return await ServiceModel.sequelize.query(
    summaryQuery(`
      WHERE srv.is_active = true
        AND srv.id <> :id
        AND srv.type = ANY(:types)
        AND (
          srv.related_codes @> to_jsonb(ARRAY[:code]::text[])
          OR (:familyCode IS NOT NULL AND (srv.family_code = :familyCode OR srv.code = :familyCode))
          OR srv.family_code = :code
        )
    `),
    {
      replacements: {
        id: service.id,
        code: service.code,
        familyCode: service.family_code ?? null,
        types: toPgArray(LISTED_TYPES),
        locale,
        defaultLocale: constants.defaultLocale,
      },
      type: QueryTypes.SELECT,
      raw: true,
    },
  );
};

// Explicit outgoing links first, then incoming links, then family peers.
// Self and duplicates are excluded.
const buildRelated = (service, explicit, candidates, limit = 6) => {
  const byCode = new Map(
    [...explicit, ...candidates].map((item) => [item.code, item]),
  );
  const outgoing = (service.related_codes ?? [])
    .map((code) => byCode.get(code))
    .filter(Boolean);
  const inbound = candidates.filter((item) =>
    (item.related_codes ?? []).includes(service.code),
  );
  const peers = candidates.filter(
    (item) =>
      item.family_code === service.family_code ||
      item.code === service.family_code ||
      item.family_code === service.code,
  );

  const seen = new Set([service.code]);
  return [...outgoing, ...inbound, ...peers]
    .filter((item) => {
      if (seen.has(item.code)) return false;
      seen.add(item.code);
      return true;
    })
    .slice(0, limit)
    .map(({ related_codes, ...item }) => item);
};

const withContent = async (service, requestedLocale) => {
  if (!service) return null;

  const locale = resolveLocale(requestedLocale);
  const translations = await ServiceModel.sequelize.query(
    `SELECT * FROM ${TRANSLATION} WHERE service_id = :id`,
    { replacements: { id: service.id }, type: QueryTypes.SELECT, raw: true },
  );

  const content =
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === constants.defaultLocale);
  if (!content) return null;

  const [explicit, candidates, familyRows] = await Promise.all([
    getSummariesByCodes(service.related_codes, locale),
    getRelatedCandidates(service, locale),
    getSummariesByCodes(service.family_code ? [service.family_code] : [], locale),
  ]);

  const { id: _translationId, service_id, created_at, ...fields } = content;

  return {
    ...service,
    ...fields,
    updated_at:
      new Date(content.updated_at) > new Date(service.updated_at)
        ? content.updated_at
        : service.updated_at,
    requested_locale: locale,
    is_fallback: content.locale !== locale,
    available_locales: translations.map((t) => t.locale).sort(),
    family: familyRows[0] ?? null,
    related: buildRelated(service, explicit, candidates),
  };
};

const getBySlug = async (req, slug) => {
  const service = await ServiceModel.findOne({
    where: { slug: req.params?.slug || slug, is_active: true },
    raw: true,
  });
  return await withContent(service, req.query?.locale);
};

const getByCode = async (req, code) => {
  const service = await ServiceModel.findOne({
    where: { code: req.params?.code || code, is_active: true },
    raw: true,
  });
  return await withContent(service, req.query?.locale);
};

const getById = async (req, id) => {
  return await ServiceModel.findOne({
    where: { id: req.params?.id || id },
    raw: true,
    plain: true,
  });
};

const deleteById = async (req, id, transaction) => {
  const options = { where: { id: req.params?.id || id } };
  if (transaction) options.transaction = transaction;
  return await ServiceModel.destroy(options);
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  getById: getById,
  getBySlug: getBySlug,
  getByCode: getByCode,
  deleteById: deleteById,
};
