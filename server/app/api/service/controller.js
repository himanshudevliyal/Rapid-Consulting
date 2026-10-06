"use strict";
import table from "../../db/models.js";
import slugify from "slugify";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { sequelize } from "../../db/postgres.js";
import { assertCategory } from "../../helpers/category-link.js";
import config from "../../config/index.js";
import constants from "../../lib/constants/index.js";
import {
  serviceSchema,
  serviceUpdateSchema,
} from "../../validation-schema/service-schema.js";
import { cleanupFiles } from "../../helpers/cleanup-files.js";
import { getItemsToDelete } from "../../helpers/filter.js";

const makeSlug = (value) => slugify(value, { lower: true, strict: true });

// Tell the website to refresh its cached service pages. Failure must never
// fail the admin request; pages also refresh on their revalidate interval.
const notifyWebsite = (slugs = []) => {
  if (!config.website_revalidate_url) return;
  axios
    .post(
      config.website_revalidate_url,
      { tag: "services", slugs },
      { headers: { "x-revalidate-secret": config.website_revalidate_secret } },
    )
    .catch((error) =>
      console.error("Website revalidation failed:", error.message),
    );
};

// The Format (type) and Family / topic (family_code) must be options an admin
// has set up under /v1/service/format and /v1/service/family-topic. On update
// a value that did not change is not re-checked, so a service keeps working
// if its option is later marked inactive.
const assertLookupValues = async (data, current = {}) => {
  const problems = [];

  if (data.type && data.type !== current.type) {
    if (!(await table.ServiceFormatModel.isActive(data.type))) {
      problems.push(`type - "${data.type}" is not an active Format`);
    }
  }
  if (data.family_code && data.family_code !== current.family_code) {
    if (!(await table.ServiceFamilyTopicModel.isActive(data.family_code))) {
      problems.push(
        `family_code - "${data.family_code}" is not an active Family / topic`,
      );
    }
  }

  if (data.category_id && data.category_id !== current.category_id) {
    try {
      await assertCategory(data.category_id);
    } catch {
      problems.push("category_id - this category does not exist");
    }
  }

  if (problems.length) {
    const error = new Error(problems.join(", "));
    error.statusCode = StatusCodes.BAD_REQUEST;
    error.validation = true;
    throw error;
  }
};

// A service's code is made here, not typed by the admin. A Service family
// page takes the code of the Family / topic it is the landing page of (picked
// by name in the form); every other service gets the next free D/X number.
const CODE_PREFIX = { service: "D", "additional-service": "X" };

const assignCode = async (data) => {
  if (data.type === "service-family") {
    const topic = data.code && (await table.ServiceFamilyTopicModel.getByCode(data.code));
    if (!topic) {
      const error = new Error("code - choose the Family / topic this page is the landing page of");
      error.statusCode = StatusCodes.BAD_REQUEST;
      error.validation = true;
      throw error;
    }
    return;
  }
  if (!data.code) {
    data.code = await table.ServiceModel.nextCode(CODE_PREFIX[data.type] ?? "D");
  }
};

const conflictMessage = (field) =>
  field === "code"
    ? "A service with this code already exists."
    : "A service with this slug already exists.";

const create = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const validateData = serviceSchema.parse(req.body);
    const english = validateData.translations.find(
      (t) => t.locale === constants.defaultLocale,
    );
    // The slug is the public URL. It is generated once and then only changes
    // when an editor sets it explicitly, so existing links keep working.
    validateData.slug = validateData.slug || makeSlug(english.title);
    req.body = validateData;

    await assertLookupValues(validateData);
    await assignCode(validateData);
    req.body = validateData;
    const conflict = await table.ServiceModel.findConflict({
      code: validateData.code,
      slug: validateData.slug,
    });
    if (conflict) {
      await transaction.rollback();
      return res
        .code(StatusCodes.CONFLICT)
        .send({ status: false, message: conflictMessage(conflict) });
    }

    const service = await table.ServiceModel.create(req, transaction);
    await table.ServiceTranslationModel.upsertMany(
      service.id,
      validateData.translations,
      transaction,
    );

    await transaction.commit();
    notifyWebsite([service.slug]);

    res
      .code(StatusCodes.CREATED)
      .send({ status: true, message: "Service created.", data: service });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateById = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const record = await table.ServiceModel.getById(req);
    if (!record) {
      await transaction.rollback();
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Service not found!" });
    }

    const validateData = serviceUpdateSchema.parse(req.body);

    await assertLookupValues(validateData, record);
    const conflict = await table.ServiceModel.findConflict({
      code: validateData.code !== record.code ? validateData.code : null,
      slug: validateData.slug !== record.slug ? validateData.slug : null,
      excludeId: record.id,
    });
    if (conflict) {
      await transaction.rollback();
      return res
        .code(StatusCodes.CONFLICT)
        .send({ status: false, message: conflictMessage(conflict) });
    }

    const documentsToDelete = [];
    if (validateData.pictures) {
      documentsToDelete.push(
        ...getItemsToDelete(record.pictures, validateData.pictures),
      );
    }

    const { translations, ...serviceFields } = validateData;
    req.body = serviceFields;

    await table.ServiceModel.update(req, 0, transaction);
    if (translations?.length) {
      await table.ServiceTranslationModel.upsertMany(
        record.id,
        translations,
        transaction,
      );
    }

    await transaction.commit();
    await cleanupFiles(documentsToDelete);
    notifyWebsite([record.slug, serviceFields.slug].filter(Boolean));

    res.code(StatusCodes.OK).send({ status: true, message: "Service updated." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Admin: the service with every translation, for the edit form.
const getById = async (req, res) => {
  const record = await table.ServiceModel.getById(req);
  if (!record) {
    return res
      .code(StatusCodes.NOT_FOUND)
      .send({ message: "Service not found!" });
  }

  const translations = await table.ServiceTranslationModel.getByServiceId(
    record.id,
  );
  res
    .code(StatusCodes.OK)
    .send({ status: true, data: { ...record, translations } });
};

// Public: one service in the requested locale (?locale=hi), falling back to
// the default locale. `is_fallback` and `available_locales` describe that.
const getBySlug = async (req, res) => {
  const record = await table.ServiceModel.getBySlug(req);
  if (!record) {
    return res
      .code(StatusCodes.NOT_FOUND)
      .send({ message: "Service not found!" });
  }

  res.code(StatusCodes.OK).send({ status: true, data: record });
};

// Public: a service record by its stable code, e.g. the "S00" services index.
const getByCode = async (req, res) => {
  const record = await table.ServiceModel.getByCode(req);
  if (!record) {
    return res
      .code(StatusCodes.NOT_FOUND)
      .send({ message: "Service not found!" });
  }

  res.code(StatusCodes.OK).send({ status: true, data: record });
};

// Public: related services of one service = the other services of the same
// Family / topic. ?locale=hi&limit=12
const getRelated = async (req, res) => {
  const data = await table.ServiceModel.getRelated(req);
  if (!data) {
    return res
      .code(StatusCodes.NOT_FOUND)
      .send({ message: "Service not found!" });
  }
  res.code(StatusCodes.OK).send({ status: true, data });
};

// Public: listed services in the requested locale.
// Filters: ?locale=hi&type=service.service-family&family=S02&q=fire
const get = async (req, res) => {
  const data = await table.ServiceModel.get(req);
  res.code(StatusCodes.OK).send({ status: true, data: data });
};

const deleteTranslation = async (req, res) => {
  const { locale } = req.params;
  if (locale === constants.defaultLocale) {
    return res.code(StatusCodes.BAD_REQUEST).send({
      status: false,
      message: `The ${constants.defaultLocale} version cannot be deleted.`,
    });
  }

  const record = await table.ServiceModel.getById(req);
  if (!record) {
    return res
      .code(StatusCodes.NOT_FOUND)
      .send({ message: "Service not found!" });
  }

  await table.ServiceTranslationModel.deleteByLocale(record.id, locale);
  notifyWebsite([record.slug]);
  res
    .code(StatusCodes.OK)
    .send({ status: true, message: "Translation deleted." });
};

const deleteById = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const record = await table.ServiceModel.getById(req);
    if (!record) {
      await transaction.rollback();
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Service not found!" });
    }

    // Translations are removed by the ON DELETE CASCADE foreign key.
    await table.ServiceModel.deleteById(req, 0, transaction);
    await transaction.commit();
    await cleanupFiles(record.pictures ?? []);
    notifyWebsite([record.slug]);

    res.status(StatusCodes.OK).send(record);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default {
  create: create,
  updateById: updateById,
  getById: getById,
  getBySlug: getBySlug,
  getByCode: getByCode,
  getRelated: getRelated,
  get: get,
  deleteTranslation: deleteTranslation,
  deleteById: deleteById,
};
