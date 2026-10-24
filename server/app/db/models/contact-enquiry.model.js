"use strict";
import { DataTypes, Op } from "sequelize";

let ContactEnquiryModel = null;

const TABLE = "contact_enquiries";

const init = async (sequelize) => {
  ContactEnquiryModel = sequelize.define(
    TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: { type: DataTypes.STRING(120), allowNull: false },
      email: { type: DataTypes.STRING(200), allowNull: false },
      phone: { type: DataTypes.STRING(20), allowNull: false },
      location: { type: DataTypes.STRING(200), allowNull: true },
      subject: { type: DataTypes.STRING(255), allowNull: true },
      message: { type: DataTypes.TEXT, allowNull: false },
      // Where the form was submitted from.
      page_title: { type: DataTypes.STRING(255), allowNull: true },
      page_url: { type: DataTypes.STRING(500), allowNull: true },
      page_id: { type: DataTypes.STRING(100), allowNull: true },
      source: { type: DataTypes.STRING(60), allowNull: false, defaultValue: "contact-page" },
      status: {
        type: DataTypes.ENUM("new", "in-progress", "resolved", "spam"),
        allowNull: false,
        defaultValue: "new",
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: TABLE,
      timestamps: true,
      underscored: true,
    },
  );

  await ContactEnquiryModel.sync({ alter: false, force: false });
};

const createRecord = async (data) => ContactEnquiryModel.create(data);

const getAll = async ({ status, source, q, page = 1, limit = 20, from, to } = {}) => {
  const where = {};
  if (status) where.status = status;
  if (source) where.source = source;
  if (q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { email: { [Op.iLike]: `%${q}%` } },
      { phone: { [Op.iLike]: `%${q}%` } },
      { subject: { [Op.iLike]: `%${q}%` } },
      { message: { [Op.iLike]: `%${q}%` } },
      { page_title: { [Op.iLike]: `%${q}%` } },
    ];
  }
  if (from || to) {
    where.created_at = {};
    if (from) where.created_at[Op.gte] = new Date(from);
    if (to) where.created_at[Op.lte] = new Date(to);
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await ContactEnquiryModel.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  return { total: count, page, limit, totalPages: Math.ceil(count / limit), data: rows };
};

const getById = async (id) => ContactEnquiryModel.findByPk(id);

const updateById = async (id, fields) => {
  const [updated, rows] = await ContactEnquiryModel.update(fields, {
    where: { id },
    returning: true,
  });
  return updated ? rows[0] : null;
};

const deleteById = async (id) => ContactEnquiryModel.destroy({ where: { id } });

export default { init, createRecord, getAll, getById, updateById, deleteById };
