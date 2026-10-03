"use strict";

import { sequelize } from "../../db/postgres.js";
import hash from "../../lib/encryption/index.js";
import table from "../../db/models.js";
import { baseUserSchema } from "../../validation-schema/user.schema.js";

const create = async (req, res) => {
  const transaction = await sequelize.transaction();

  const validatedData = baseUserSchema.parse(req.body);

  try {
    const { role } = req.user_data;
    const existingUser = await table.UserModel.getByUsername(req.body.username);

    if (existingUser) {
      await transaction.rollback();
      return res.code(409).send({
        message:
          "User already exists with username. Please try with different username",
      });
    }

    const user = await table.UserModel.create(req, transaction);

    await transaction.commit();
    return res.send(user);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const update = async (req, res) => {
  const transaction = await sequelize.transaction();
  const auditLogsList = [];
  const { role } = req.user_data;
  try {
    const record = await table.UserModel.getById(req);
    if (!record) {
      return res.code(404).send({ message: "User not exists" });
    }

    const updatedUser = await table.UserModel.update(req, 0, transaction);

    await transaction.commit();
    return res.send({
      status: true,
      message: "User updated successfully!",
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const transaction = await sequelize.transaction();

    const record = await table.UserModel.deleteById(req, 0, transaction);
    if (!record)
      return res.code(404).send({ status: false, message: "User not exists" });

    await transaction.commit();

    return res.send(record);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.UserModel.get(req);
    return res.send({ status: true, data });
  } catch (error) {
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.UserModel.getById(req);
    if (!record) {
      return res.code(404).send({ message: "User not exists" });
    }

    delete record.password;

    return res.send(record);
  } catch (error) {
    throw error;
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.params.id;

    const record = await table.UserModel.getById(userId);

    if (!record) {
      return res.code(404).send({ message: "User not exists" });
    }

    const isValid = await hash.verify(req.body.old_password, record.password);

    if (!isValid) {
      return res.code(400).send({
        message: "Incorrect password. Please enter a valid password",
      });
    }

    await table.UserModel.updatePassword(userId, req.body.password);

    return res.send({
      message: "Password changed successfully!",
    });
  } catch (error) {
    throw error;
  }
};

const checkUsername = async (req, res) => {
  try {
    const user = await table.UserModel.getByUsername(req.body.username);

    if (user) {
      return res.code(409).send({
        status: false,
        message: "Username already exists try with different username",
      });
    }

    return res.send({ exist: false, message: "Username available." });
  } catch (error) {
    throw error;
  }
};

const getUser = async (req, res) => {
  try {
    const record = await table.UserModel.getById(0, req.user_data.id);
    if (!record)
      return res.code(401).send({ status: false, message: "unauthorized!" });

    return res.send(req.user_data);
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = await table.UserModel.getByResetToken(req);
    if (!token) {
      return res.code(401).send({ message: "invalid url" });
    }

    await table.UserModel.updatePassword(req, token.id);
    return res.send({
      message: "Password reset successfully!",
    });
  } catch (error) {
    throw error;
  }
};

const resetUsername = async (req, res) => {
  try {
    const token = await table.UserModel.getByResetToken(req);
    if (!token) {
      return res.code(401).send({ message: "invalid url" });
    }

    await table.UserModel.updateUsername(req, token.id);
    return res.send({
      message: "Username reset successfully!",
    });
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  update: update,
  deleteById: deleteById,
  get: get,
  getById: getById,
  checkUsername: checkUsername,
  updatePassword: updatePassword,
  getUser: getUser,
  resetPassword: resetPassword,
  resetUsername: resetUsername,
};
