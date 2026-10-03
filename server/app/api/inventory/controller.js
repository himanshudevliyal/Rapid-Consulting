"use strict";
import table from "../../db/models.js";
import { StatusCodes } from "http-status-codes";
import { sequelize } from "../../db/postgres.js";

const create = async (req, res) => {
  try {
    await table.InventoryModel.create(req);

    res
      .code(StatusCodes.CREATED)
      .send({ status: true, message: "Inventory created." });
  } catch (error) {
    throw error;
  }
};

const updateById = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const record = await table.InventoryModel.getById(req);
    if (!record) {
      await table.InventoryModel.create(req, transaction);

      await transaction.commit();
      return res
        .code(StatusCodes.CREATED)
        .send({ message: "Inventory created!" });
    }

    await table.InventoryModel.update(req, 0, transaction);
    await transaction.commit();

    res
      .code(StatusCodes.OK)
      .send({ status: true, message: "Inventory updated." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.InventoryModel.getById(req, req.params.id);
    if (!record) {
      return res.code(StatusCodes.OK).send({ data: { stock: 0 } });
    }

    res.code(StatusCodes.OK).send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.InventoryModel.get(req);

    res.code(StatusCodes.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const record = await table.InventoryModel.getById(req);
    if (!record) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Inventory not found!" });
    }

    await table.InventoryModel.deleteById(req, 0, transaction);

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
};
