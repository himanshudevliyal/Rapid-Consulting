"use strict";
import table from "../../db/models.js";
import slugify from "slugify";
import { StatusCodes } from "http-status-codes";
import { sequelize } from "../../db/postgres.js";
import { categorySchema } from "../../validation-schema/category.schema.js";
import { cleanupFiles } from "../../helpers/cleanup-files.js";
import { getItemsToDelete } from "../../helpers/filter.js";

const create = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const validateData = categorySchema.parse(req.body);
    let slug = slugify(req.body.title, { lower: true });
    req.body.slug = slug;

    await table.CategoryModel.create(req, transaction);
    await transaction.commit();
    res
      .code(StatusCodes.CREATED)
      .send({ status: true, message: "Category created." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateById = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const record = await table.CategoryModel.getById(req);
    if (!record) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Category not found!" });
    }
    if (req.body.title) {
      let slug = slugify(req.body.title, { lower: true, strict: true });
      req.body.slug = slug;
    }

    const documentsToDelete = [];
    const existingPictures = record.pictures;
    const updatedPictures = req.body.picture_urls;
    if (updatedPictures) {
      req.body.pictures = [...(req.body?.pictures ?? []), ...updatedPictures];
      documentsToDelete.push(
        ...getItemsToDelete(existingPictures, updatedPictures),
      );
    }

    await table.CategoryModel.update(req, 0, transaction);
    await cleanupFiles(documentsToDelete);

    await transaction.commit();

    res
      .code(StatusCodes.OK)
      .send({ status: true, message: "Category updated." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.CategoryModel.getById(req, req.params.id);
    if (!record) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Category not found!" });
    }

    const data = await table.CategoryModel.getById(req);

    res.code(StatusCodes.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.CategoryModel.get(req);

    res.code(StatusCodes.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const record = await table.CategoryModel.getById(req);
    if (!record) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Category not found!" });
    }

    const documentsToDelete = [];
    record.pictures?.forEach((image) => documentsToDelete.push(image));
    await cleanupFiles(documentsToDelete);

    await table.CategoryModel.deleteById(req, 0, transaction);

    await transaction.commit();
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
  get: get,
  deleteById: deleteById,
};
