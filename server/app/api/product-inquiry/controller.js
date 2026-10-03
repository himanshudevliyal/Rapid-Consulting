"use strict";
import table from "../../db/models.js";
import { StatusCodes } from "http-status-codes";
import { productInquirySchema } from "../../validation-schema/product-inquiry-schema.js";

const create = async (req, res) => {
  try {
    const validateData = productInquirySchema.parse(req.body);
    req.body = validateData;

    // Make sure every referenced product actually exists.
    const uniqueProductIds = [
      ...new Set(validateData.products.map((p) => p.product_id)),
    ];

    const products = await Promise.all(
      uniqueProductIds.map((id) => table.ProductModel.getById(0, id)),
    );

    const missingIndex = products.findIndex((p) => !p);
    if (missingIndex !== -1) {
      return res.code(StatusCodes.BAD_REQUEST).send({
        status: false,
        message: `Product not found: ${uniqueProductIds[missingIndex]}`,
      });
    }

    const record = await table.ProductInquiryModel.create(req);

    res
      .code(StatusCodes.CREATED)
      .send({ status: true, message: "Inquiry submitted.", data: record });
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.ProductInquiryModel.get(req);
    res.code(StatusCodes.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.ProductInquiryModel.getById(req);
    if (!record) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Inquiry not found!" });
    }

    // Enrich each {product_id, quantity} line with the product's current
    // title/thumbnail so the admin panel doesn't need extra round-trips.
    const enrichedProducts = await Promise.all(
      (record.products || []).map(async (item) => {
        const product = await table.ProductModel.getById(0, item.product_id);
        return {
          ...item,
          title: product?.title ?? null,
          slug: product?.slug ?? null,
          thumbnail: product?.thumbnail ?? null,
        };
      }),
    );

    res
      .code(StatusCodes.OK)
      .send({ status: true, data: { ...record, products: enrichedProducts } });
  } catch (error) {
    throw error;
  }
};

const updateStatus = async (req, res) => {
  try {
    const record = await table.ProductInquiryModel.getById(req);
    if (!record) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Inquiry not found!" });
    }

    const allowedStatuses = ["pending", "contacted", "closed"];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.code(StatusCodes.BAD_REQUEST).send({
        status: false,
        message: `status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    await table.ProductInquiryModel.update(req);
    res.code(StatusCodes.OK).send({ status: true, message: "Status updated." });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.ProductInquiryModel.getById(req);
    if (!record) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Inquiry not found!" });
    }

    await table.ProductInquiryModel.deleteById(req);
    res.code(StatusCodes.OK).send({ status: true, message: "Inquiry deleted." });
  } catch (error) {
    throw error;
  }
};

export default {
  create: create,
  get: get,
  getById: getById,
  updateStatus: updateStatus,
  deleteById: deleteById,
};
