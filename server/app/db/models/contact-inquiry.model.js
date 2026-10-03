"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, QueryTypes } from "sequelize";

let ContactInquiryModel = null;

const init = async (sequelize) => {
  ContactInquiryModel = sequelize.define(
    constants.models.CONTACT_INQUIRY_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["email"] }, { fields: ["phone"] }],
    },
  );

  return ContactInquiryModel;
};

const create = async (req) => {
  const data = await ContactInquiryModel.create({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    message: req.body.message,
  });

  return data.dataValues;
};

const get = async (req) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const offset = (page - 1) * limit;

  const query = `
    SELECT *
    FROM ${constants.models.CONTACT_INQUIRY_TABLE}
    ORDER BY created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
    SELECT COUNT(id)::integer AS total
    FROM ${constants.models.CONTACT_INQUIRY_TABLE}
  `;

  const inquiries = await ContactInquiryModel.sequelize.query(query, {
    replacements: { limit, offset },
    type: QueryTypes.SELECT,
  });

  const count = await ContactInquiryModel.sequelize.query(countQuery, {
    type: QueryTypes.SELECT,
    plain: true,
  });

  return { inquiries, total: count.total };
};

const getById = async (req) => {
  return await ContactInquiryModel.findOne({
    where: { id: req.params.id },
    raw: true,
  });
};

const deleteById = async (req) => {
  return await ContactInquiryModel.destroy({
    where: { id: req.params.id },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  deleteById: deleteById,
};
