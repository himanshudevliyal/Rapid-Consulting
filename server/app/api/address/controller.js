"use strict";
import table from "../../db/models.js";
import slugify from "slugify";
import { StatusCodes } from "http-status-codes";
import { sequelize } from "../../db/postgres.js";
import { addressSchema } from "../../validation-schema/order-schema.js";
import { z } from "zod";
import { QueryTypes } from "sequelize";

const schema = z.object({
  address: addressSchema,
});

const create = async (req, res) => {
  try {
    const validateData = schema.parse(req.body);
    await table.UserAddressModel.create(req);
    res
      .code(StatusCodes.CREATED)
      .send({ status: true, message: "Address created." });
  } catch (error) {
    throw error;
  }
};

const updateById = async (req, res) => {
  try {
    const record = await table.UserAddressModel.getById(req);
    if (!record) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Address not found!" });
    }

    await table.UserAddressModel.update(req);

    res
      .code(StatusCodes.OK)
      .send({ status: true, message: "Address updated." });
  } catch (error) {
    throw error;
  }
};

const setPrimaryAddress = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    await sequelize.query(
      `UPDATE user_addresses SET is_primary TRUE WHERE user_id = :user_id`,
      {
        replacements: { user_id: req.user_data.id },
        type: QueryTypes.UPDATE,
        transaction,
      }
    );

    await table.UserAddressModel.update(req, 0, transaction);

    res
      .code(StatusCodes.OK)
      .send({ status: true, message: "Address updated." });
  } catch (error) {
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.UserAddressModel.getById(req);
    if (!record) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Address not found!" });
    }

    const data = await table.UserAddressModel.getById(req);

    res.code(StatusCodes.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.UserAddressModel.get(req);

    res.code(StatusCodes.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const record = await table.UserAddressModel.getById(req);
    if (!record) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Address not found!" });
    }

    await table.UserAddressModel.deleteById(req, 0, transaction);

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
  setPrimaryAddress: setPrimaryAddress,
};
