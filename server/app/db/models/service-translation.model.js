"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable } from "sequelize";

let ServiceTranslationModel = null;

const init = async (sequelize) => {
  ServiceTranslationModel = sequelize.define(
    constants.models.SERVICE_TRANSLATION_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      service_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.SERVICE_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      locale: { type: DataTypes.STRING(10), allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      h1: { type: DataTypes.TEXT },
      eyebrow: { type: DataTypes.STRING },
      short_description: { type: DataTypes.TEXT },
      intro_html: { type: DataTypes.TEXT },
      sections: { type: DataTypes.JSONB, defaultValue: [] },
      source_urls: { type: DataTypes.JSONB, defaultValue: [] },
      status: { type: DataTypes.STRING(40), defaultValue: "draft" },
      review_label: { type: DataTypes.STRING(80) },
      meta_title: { type: DataTypes.TEXT },
      meta_description: { type: DataTypes.TEXT },
      meta_keywords: { type: DataTypes.TEXT },
      og_image: { type: DataTypes.TEXT },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ unique: true, fields: ["service_id", "locale"] }],
    },
  );

  return ServiceTranslationModel;
};

const EDITABLE = [
  "title",
  "h1",
  "eyebrow",
  "short_description",
  "intro_html",
  "sections",
  "source_urls",
  "status",
  "review_label",
  "meta_title",
  "meta_description",
  "meta_keywords",
  "og_image",
];

// Insert a new locale, or update an existing one with only the fields that
// were sent. Locales not in the payload are left untouched, so saving the
// English form never deletes or blanks the Hindi version.
const upsertMany = async (serviceId, translations = [], transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  for (const translation of translations) {
    const values = Object.fromEntries(
      EDITABLE.filter((key) => translation[key] !== undefined).map((key) => [
        key,
        translation[key],
      ]),
    );

    const existing = await ServiceTranslationModel.findOne({
      where: { service_id: serviceId, locale: translation.locale },
      ...options,
    });

    if (existing) {
      await existing.update(values, options);
      continue;
    }

    if (!values.title) {
      const error = new Error(
        `translations - A title is required to add the "${translation.locale}" version`,
      );
      error.statusCode = 400;
      error.validation = true;
      throw error;
    }

    await ServiceTranslationModel.create(
      { service_id: serviceId, locale: translation.locale, ...values },
      options,
    );
  }
};

const getByServiceId = async (serviceId) => {
  return await ServiceTranslationModel.findAll({
    where: { service_id: serviceId },
    order: [["locale", "ASC"]],
    raw: true,
  });
};

const deleteByLocale = async (serviceId, locale, transaction) => {
  const options = { where: { service_id: serviceId, locale } };
  if (transaction) options.transaction = transaction;
  return await ServiceTranslationModel.destroy(options);
};

export default {
  init: init,
  upsertMany: upsertMany,
  getByServiceId: getByServiceId,
  deleteByLocale: deleteByLocale,
};
