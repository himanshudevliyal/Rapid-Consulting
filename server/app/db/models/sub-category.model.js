"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let SubCategoryModel = null;

const init = async (sequelize) => {
  SubCategoryModel = sequelize.define(
    constants.models.SUB_CATEGORY_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "Sub category exist with this name",
        },
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: constants.models.CATEGORY_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },
      featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pictures: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      meta_title: { type: DataTypes.TEXT },
      meta_description: { type: DataTypes.TEXT },
      meta_keywords: { type: DataTypes.TEXT },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["title"] }, { fields: ["category_id"] }],
    },
  );

  return SubCategoryModel;
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await SubCategoryModel.create(
    {
      title: req.body.title,
      slug: req.body.slug,
      category_id: req.body.category_id,
      featured: req.body.featured,
      pictures: req.body.pictures,
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
      meta_keywords: req.body.meta_keywords,
    },
    options,
  );

  return data.dataValues;
};

const update = async (req, id) => {
  return await SubCategoryModel.update(
    {
      title: req.body.title,
      slug: req.body.slug,
      category_id: req.body.category_id,
      featured: req.body.featured,
      pictures: req.body.pictures,
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
      meta_keywords: req.body.meta_keywords,
    },
    {
      where: { id: req?.params?.id || id },
      returning: true,
      raw: true,
    },
  );
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(`(sc.title ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  // ?category_id=<uuid> -> only subcategories of that category
  if (req.query.category_id) {
    whereConditions.push(`sc.category_id = :categoryId`);
    queryParams.categoryId = req.query.category_id;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  let whereClause = "";
  if (whereConditions.length) {
    whereClause = `WHERE ${whereConditions.join(" AND ")}`;
  }

  const query = `
  SELECT
      sc.*,
      cat.title AS category_title,
      cat.slug AS category_slug
    FROM ${constants.models.SUB_CATEGORY_TABLE} sc
    LEFT JOIN ${constants.models.CATEGORY_TABLE} cat ON cat.id = sc.category_id
    ${whereClause}
    ORDER BY sc.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(sc.id) OVER()::integer as total
    FROM ${constants.models.SUB_CATEGORY_TABLE} sc
    ${whereClause}
  `;

  const subCategories = await SubCategoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await SubCategoryModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { sub_categories: subCategories, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await SubCategoryModel.findOne({
    where: { id: req?.params?.id || id },
    raw: true,
  });
};

const deleteById = async (req, id, transaction) => {
  const options = { where: { id: req.params?.id || id } };
  if (transaction) options.transaction = transaction;

  return await SubCategoryModel.destroy(options);
};

export default {
  init: init,
  create: create,
  update: update,
  get: get,
  getById: getById,
  deleteById: deleteById,
};
