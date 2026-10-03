"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";

const { BAD_REQUEST } = constants.http.status;

const create = async (req, res) => {
  try {
    const record = await table.CartModel.getByUserAndProductId(req);
    if (record) {
      await table.CartModel.update(
        { body: { quantity: record.quantity + 1 } },
        record.id,
      );
      return res.send({ status: true, message: "Added to cart." });
    }

    await table.CartModel.create(req);

    res.send({ status: true, message: "Added to cart." });
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.CartModel.get(req);
    res.send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const update = async (req, res) => {
  try {
    const record = await table.CartModel.getById(req);
    await table.CartModel.update(req);
    res.send({ status: true, message: "Item updated" });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.CartModel.getById(req);
    await table.CartModel.deleteById(req);
    res.send({ status: true, message: "Item removed", data: record });
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  get: get,
  deleteById: deleteById,
  update: update,
};
