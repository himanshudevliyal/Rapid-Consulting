"use strict";
import table from "../../db/models.js";
import slugify from "slugify";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { sequelize } from "../../db/postgres.js";
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
  get: get,
  deleteTranslation: deleteTranslation,
  deleteById: deleteById,
};
