"use strict";
import { ZodError } from "zod";
import table from "../../db/models.js";
import { sendEnquiryEmail, sendEnquiryConfirmation } from "../../services/mailer.js";
import { sendValidationError } from "../../helpers/zod-errors.js";
import {
  enquiryAdminUpdateSchema,
  enquiryCreateSchema,
} from "../../validation-schema/enquiry-schema.js";
import { StatusCodes } from "http-status-codes";

/** POST /v1/public/enquiries — public (service / callback enquiry form) */
const create = async (req, res) => {
  let data;
  try {
    data = enquiryCreateSchema.parse(req.body ?? {});
  } catch (error) {
    if (error instanceof ZodError) return sendValidationError(res, error);
    throw error;
  }

  // A bot filled the hidden field: answer as if it worked, save nothing.
  if (data.website) {
    return res.code(StatusCodes.CREATED).send({ success: true, status: true });
  }

  const { website, ...fields } = data;
  const enquiry = await table.EnquiryModel.createRecord({
    ...fields,
    source: fields.source || "contact-form",
  });

  // Fire-and-forget — emails must never block the API response.
  const plain = enquiry.toJSON();
  sendEnquiryEmail(plain).catch(() => {});
  sendEnquiryConfirmation(plain).catch(() => {});

  return res.code(StatusCodes.CREATED).send({
    success: true,
    status: true,
    id: enquiry.id,
    message: "Your enquiry has been received.",
  });
};

/** GET /v1/enquiries — admin */
const list = async (req, res) => {
  const { status, source, q, page, limit, from, to } = req.query;
  const result = await table.EnquiryModel.getAll({
    status,
    source,
    q,
    page: Number(page) || 1,
    limit: Number(limit) || 50,
    from,
    to,
  });
  return res.send(result);
};

/** GET /v1/enquiries/:id — admin */
const getById = async (req, res) => {
  const enquiry = await table.EnquiryModel.getById(req.params.id);
  if (!enquiry) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(enquiry);
};

/** PATCH /v1/enquiries/:id — admin (status / notes only) */
const update = async (req, res) => {
  const data = enquiryAdminUpdateSchema.parse(req.body ?? {});
  const fields = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  const enquiry = await table.EnquiryModel.updateById(req.params.id, fields);
  if (!enquiry) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(enquiry);
};

/** DELETE /v1/enquiries/:id — admin */
const destroy = async (req, res) => {
  const ok = await table.EnquiryModel.deleteById(req.params.id);
  if (!ok) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.code(StatusCodes.NO_CONTENT).send();
};

export default { create, list, getById, update, destroy };
