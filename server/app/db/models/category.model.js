"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, QueryTypes } from "sequelize";

let CategoryModel = null;

const init = async (sequelize) => {
  CategoryModel = sequelize.define(
    constants.models.CATEGORY_TABLE,
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
          msg: "Category exist with this name",
        },
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
      indexes: [{ fields: ["title"] }],
    },
  );

  return CategoryModel;
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await CategoryModel.create(
    {
      title: req.body.title,
      slug: req.body.slug,
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
  return await CategoryModel.update(
    {
      title: req.body.title,
      slug: req.body.slug,
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
    whereConditions.push(`(cat.title ILIKE :query)`);
    queryParams.query = `%${q}%`;
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
      cat.*,
      (
        SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('id', sc.id, 'title', sc.title, 'slug', sc.slug, 'pictures', sc.pictures)), '[]')
        FROM ${constants.models.SUB_CATEGORY_TABLE} sc
        WHERE sc.category_id = cat.id
      ) AS sub_categories
    FROM ${constants.models.CATEGORY_TABLE} cat
    ${whereClause}
    ORDER BY cat.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(cat.id) OVER()::integer as total
    FROM ${constants.models.CATEGORY_TABLE} cat
    ${whereClause}
  `;

  const categories = await CategoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await CategoryModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { categories, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await CategoryModel.findOne({
    where: {
      id: req?.params?.id || id,
    },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const deleteById = async (req, id, transaction) => {
  return await CategoryModel.destroy({
    where: { id: req?.params?.id || id },
    transaction,
  });
};

export default {
  init: init,
  create: create,
  update: update,
  getById: getById,
  deleteById: deleteById,
  get: get,
};
