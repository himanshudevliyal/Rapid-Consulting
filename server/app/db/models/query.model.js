"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, QueryTypes } from "sequelize";

let UserQueryModel = null;

const init = async (sequelize) => {
  UserQueryModel = sequelize.define(
    constants.models.QUERY_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // domestic_sales_enquiry | export_sales_enquiry | after_sales_services | career | become_a_vendor
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Optional reference image/PDF for custom requests.
      attachment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["email"] }, { fields: ["reason"] }],
    },
  );

  return UserQueryModel;
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await UserQueryModel.create(
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      subject: req.body.subject,
      message: req.body.message,
      reason: req.body.reason,
      attachment: req.body.attachment || null,
    },
    options,
  );

  return data.dataValues;
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};

  const search = req.query.search || req.query.q;
  if (search) {
    whereConditions.push(`
      (
        uq.name ILIKE :search
        OR uq.email ILIKE :search
        OR uq.phone ILIKE :search
        OR uq.subject ILIKE :search
      )
    `);
    queryParams.search = `%${search}%`;
  }

  if (req.query.reason) {
    whereConditions.push(`uq.reason = :reason`);
    queryParams.reason = req.query.reason;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  const whereClause = whereConditions.length
    ? `WHERE ${whereConditions.join(" AND ")}`
    : "";

  const query = `
    SELECT uq.*
    FROM ${constants.models.QUERY_TABLE} uq
    ${whereClause}
    ORDER BY uq.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
    SELECT COUNT(uq.id)::integer AS total
    FROM ${constants.models.QUERY_TABLE} uq
    ${whereClause}
  `;

  const queries = await UserQueryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await UserQueryModel.sequelize.query(countQuery, {
    replacements: queryParams,
    type: QueryTypes.SELECT,
    plain: true,
  });

  return {
    queries,
    total: count?.total || 0,
    page,
    limit,
  };
};

const getById = async (req, id) => {
  return await UserQueryModel.findOne({
    where: { id: req?.params?.id || id },
    raw: true,
  });
};

const deleteById = async (req, id) => {
  return await UserQueryModel.destroy({
    where: { id: req?.params?.id || id },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  deleteById: deleteById,
};