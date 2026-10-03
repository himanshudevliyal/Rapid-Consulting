"use strict";

import table from "../../db/models.js";
import { StatusCodes } from "http-status-codes";
import { contactInquirySchema } from "../../validation-schema/contact-inquiry.schema.js";
import { mailer } from "../../services/mailer.js";
import config from "../../config/index.js";

const create = async (req, res) => {
  try {
    const validatedData = contactInquirySchema.parse(req.body);
    req.body = validatedData;

    await table.ContactInquiryModel.create(req);

    await mailer.sendContactInquiryEmail("sales@bdseducation.in", {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      message: validatedData.message,
    });

    res.code(StatusCodes.CREATED).send({
      status: true,
      message: "Inquiry submitted successfully.",
    });
  } catch (error) {
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.ContactInquiryModel.get(req);
    res.code(StatusCodes.OK).send({ status: true, data });
  } catch (error) {
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.ContactInquiryModel.getById(req);
    if (!record) {
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ message: "Inquiry not found" });
    }

    res.code(StatusCodes.OK).send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    await table.ContactInquiryModel.deleteById(req);
    res.code(StatusCodes.OK).send({ status: true, message: "Inquiry deleted" });
  } catch (error) {
    throw error;
  }
};

export default { create, get, getById, deleteById };
