"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, QueryTypes } from "sequelize";

let BlogModel = null;

const init = async (sequelize) => {
  BlogModel = sequelize.define(
    constants.models.BLOG_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      slug: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: {
          args: true,
          msg: "Blog exist with this title.",
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pictures: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Optional - a blog post doesn't need to belong to a category.
      category_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: constants.models.CATEGORY_TABLE,
          key: "id",
        },
        onDelete: "CASCADE",
      },
      date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      content: { type: DataTypes.TEXT },
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
  return BlogModel;
};

const bulkCreate = async (bulkData, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await BlogModel.bulkCreate(bulkData, options);

  return data.dataValues;
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await BlogModel.create(
    {
      slug: req.body.slug,
      pictures: req.body.pictures,
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      content: req.body.content,
      category_id: req.body.category_id || null,
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
      meta_keywords: req.body.meta_keywords,
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

  return await BlogModel.update(
    {
      slug: req.body.slug,
      pictures: req.body.pictures,
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      content: req.body.content,
      category_id: req.body.category_id || null,
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
      meta_keywords: req.body.meta_keywords,
    },
    options,
  );
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};
  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(`(blg.title ILIKE :query)`);
    queryParams.query = `%${q}%`;
  }

  const categories = req.query.categories
    ? req.query.categories.split(".")
    : null;
  if (categories?.length) {
    whereConditions.push(`blg.category_id = ANY(:categories)`);
    queryParams.categories = `{${categories.join(",")}}`;
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
      blg.id, blg.slug, blg.title, blg.pictures, blg.description, blg.date, blg.created_at,
      cat.title AS category_title
    FROM ${constants.models.BLOG_TABLE} blg
    LEFT JOIN ${constants.models.CATEGORY_TABLE} cat ON cat.id = blg.category_id
    ${whereClause}
    ORDER BY blg.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
     COUNT(blg.id) OVER()::integer as total
    FROM ${constants.models.BLOG_TABLE} blg
    LEFT JOIN ${constants.models.CATEGORY_TABLE} cat ON cat.id = blg.category_id
    ${whereClause}
  `;

  const blogs = await BlogModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await BlogModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { blogs, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await BlogModel.findOne({
    where: { id: req.params?.id || id },
    order: [["created_at", "DESC"]],
    limit: 1,
    raw: true,
    plain: true,
  });
};

const getBySlug = async (req, slug) => {
  let query = `
  SELECT
      blg.*,
      cat.title as category_title
    FROM ${constants.models.BLOG_TABLE} blg
    LEFT JOIN ${constants.models.CATEGORY_TABLE} cat ON cat.id = blg.category_id
    WHERE blg.slug = :slug
  `;

  return await BlogModel.sequelize.query(query, {
    replacements: {
      slug: req.params?.slug || slug,
    },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });
};

const deleteById = async (req, id, transaction) => {
  const options = { where: { id: req.params?.id || id } };
  if (transaction) options.transaction = transaction;

  return await BlogModel.destroy(options);
};

export default {
  init: init,
  bulkCreate: bulkCreate,
  create: create,
  update: update,
  getById: getById,
  getBySlug: getBySlug,
  get: get,
  deleteById: deleteById,
};