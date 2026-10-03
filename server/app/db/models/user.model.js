"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, QueryTypes } from "sequelize";
import { sequelize } from "../postgres.js";
import hash from "../../lib/encryption/index.js";

let UserModel = null;

const init = (sequelize) => {
  UserModel = sequelize.define(
    constants.models.USER_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fullname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "Email address already in use.",
        },
      },
      mobile_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "Mobile number already in use.",
        },
      },
      role: {
        type: DataTypes.ENUM({
          values: ["admin", "user"],
        }),
        defaultValue: "user",
        allowNull: false,
      },
      gstin: {
        type: DataTypes.STRING,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return UserModel;
};

const create = async (req, transaction = null) => {
  const options = transaction ? { transaction } : {};

  const hashed_password = await hash.encrypt(req.body.password);

  const record = await UserModel.create(
    {
      username: req.body.username,
      password: hashed_password,
      role: req.body.role,
      fullname: req.body.fullname,
      email: req.body.email,
      mobile_number: req.body.mobile_number,
    },
    options,
  );
  return record.dataValues;
};

const get = async (req) => {
  const { role, id } = req.user_data;
  const whereConditions = ["usr.id != :curr_user_id"];
  const queryParams = { curr_user_id: id };

  const q = req.query.q ? req.query.q : null;
  const isActive =
    req.query.is_active === "true"
      ? true
      : req.query.is_active === "false"
        ? false
        : null;
  const isBlocked =
    req.query.blocked === "true"
      ? true
      : req.query.blocked === "false"
        ? false
        : null;
  const roles = req.query.role ? req.query.role.split(".") : null;
  const onlyRoles = req.query.ol ? req.query.ol.split(".") : null;

  if (q) {
    whereConditions.push(
      `(usr.fullname ILIKE :query OR usr.email ILIKE :query OR usr.username ILIKE :query)`,
    );
    queryParams.query = `%${q}%`;
  }

  if (roles?.length) {
    whereConditions.push(`usr.role = any(:roles)`);
    queryParams.roles = `{${roles.join(",")}}`;
  }

  if (onlyRoles?.length) {
    whereConditions.push(`usr.role = any(:only_roles)`);
    queryParams.only_roles = `{${onlyRoles.join(",")}}`;
  }

  if (isActive !== null) {
    whereConditions.push("usr.is_active = :isActive");
    queryParams.isActive = isActive;
  }
  if (isBlocked !== null) {
    whereConditions.push("usr.blocked = :isBlocked");
    queryParams.isBlocked = isBlocked;
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
        usr.id, usr.username, usr.role, usr.fullname, 
        usr.email, usr.mobile_number, usr.created_at
      FROM ${constants.models.USER_TABLE} usr
      ${whereClause}
      ORDER BY usr.created_at DESC
      LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
    SELECT COUNT(*)::integer as total
    FROM ${constants.models.USER_TABLE} usr
    ${whereClause}
  `;

  const users = await sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
  });

  const count = await sequelize.query(countQuery, {
    replacements: queryParams,
    type: QueryTypes.SELECT,
    plain: true,
  });

  return {
    users,
    total: count?.total || 0,
  };
};

const getById = async (req, id) => {
  return await UserModel.findOne({
    where: { id: req.params?.id || id },
    raw: true,
  });
};

const getByUsername = async (username) => {
  return await UserModel.findOne({
    where: { username },
    raw: true,
  });
};

const isUsernameExist = async (username) => {
  const user = await UserModel.findOne({ where: { username } });
  return !!user;
};

const update = async (req, id, transaction = null) => {
  const [, data] = await UserModel.update(
    {
      username: req.body.username,
      fullname: req.body.fullname,
      email: req.body.email,
      mobile_number: req.body.mobile_number,
      role: req.body.role,
      gstin: req.body.gstin,
    },
    {
      where: { id: req.params?.id || id },
      returning: true,
      plain: true,
      raw: true,
      transaction,
    },
  );

  return data;
};

const updatePassword = async (id, hashedPassword) => {
  return await UserModel.update(
    { password: hashedPassword },
    { where: { id } },
  );
};

const updateUsername = async (id, username) => {
  return await UserModel.update({ username }, { where: { id } });
};

const deleteById = async (req, id, transaction) => {
  return await UserModel.destroy({
    where: { id: req.params?.id ?? id },
    transaction,
  });
};

const getByResetToken = async (req) => {
  return await UserModel.findOne({
    where: {
      reset_password_token: req.body.token,
    },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  getByUsername: getByUsername,
  isUsernameExist: isUsernameExist,
  update: update,
  updatePassword: updatePassword,
  updateUsername: updateUsername,
  deleteById: deleteById,
  getByResetToken: getByResetToken,
};
