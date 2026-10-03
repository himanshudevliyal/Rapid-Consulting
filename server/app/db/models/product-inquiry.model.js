"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, QueryTypes } from "sequelize";

let ProductInquiryModel = null;

const init = async (sequelize) => {
  ProductInquiryModel = sequelize.define(
    constants.models.PRODUCT_INQUIRY_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      company_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contact_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // [{ product_id, quantity }]
      products: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending", // pending | contacted | closed
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["email"] }, { fields: ["status"] }],
    },
  );

  return ProductInquiryModel;
};

const create = async (req) => {
  const data = await ProductInquiryModel.create({
    full_name: req.body.full_name,
    company_name: req.body.company_name,
    email: req.body.email,
    contact_number: req.body.contact_number,
    city: req.body.city,
    state: req.body.state,
    message: req.body.message,
    products: req.body.products,
  });

  return data.dataValues;
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};

  const search = req.query.search || req.query.q;
  if (search) {
    whereConditions.push(`
      (
        pi.full_name ILIKE :search
        OR pi.company_name ILIKE :search
        OR pi.email ILIKE :search
        OR pi.contact_number ILIKE :search
        OR pi.city ILIKE :search
        OR pi.state ILIKE :search
      )
    `);
    queryParams.search = `%${search}%`;
  }

  if (req.query.status) {
    whereConditions.push(`pi.status = :status`);
    queryParams.status = req.query.status;
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const whereClause = whereConditions.length
    ? `WHERE ${whereConditions.join(" AND ")}`
    : "";

  const query = `
    SELECT pi.*
    FROM ${constants.models.PRODUCT_INQUIRY_TABLE} pi
    ${whereClause}
    ORDER BY pi.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
    SELECT COUNT(pi.id)::integer AS total
    FROM ${constants.models.PRODUCT_INQUIRY_TABLE} pi
    ${whereClause}
  `;

  const inquiries = await ProductInquiryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await ProductInquiryModel.sequelize.query(countQuery, {
    replacements: queryParams,
    type: QueryTypes.SELECT,
    plain: true,
  });

  return {
    product_inquiries: inquiries,
    total: count?.total || 0,
    page,
    limit,
  };
};

const getById = async (req, id) => {
  return await ProductInquiryModel.findOne({
    where: { id: req?.params?.id || id },
    raw: true,
  });
};

const update = async (req, id) => {
  return await ProductInquiryModel.update(
    { status: req.body.status },
    { where: { id: req?.params?.id || id } },
  );
};

const deleteById = async (req, id) => {
  return await ProductInquiryModel.destroy({
    where: { id: req?.params?.id || id },
  });
};

// Day-by-day inquiry count for the last 7 days (for a dashboard trend chart).
// Missing days are filled in with 0 so the chart always has 7 points.
const getInquiriesTrend = async () => {
  const query = `
    SELECT TO_CHAR(created_at::date, 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
    FROM ${constants.models.PRODUCT_INQUIRY_TABLE}
    WHERE created_at >= NOW() - INTERVAL '6 days'
    GROUP BY day
    ORDER BY day ASC
  `;

  const rows = await ProductInquiryModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
  });

  const byDay = Object.fromEntries(rows.map((r) => [r.day, r.count]));

  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const day = date.toISOString().slice(0, 10);
    trend.push({ day, count: byDay[day] || 0 });
  }

  return trend;
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  update: update,
  deleteById: deleteById,
  getInquiriesTrend: getInquiriesTrend,
};
