"use strict";
import { ZodError } from "zod";
import table from "../../db/models.js";
import {
  sendContactEnquiryEmail,
  sendContactEnquiryConfirmation,
} from "../../services/mailer.js";
import { sendValidationError } from "../../helpers/zod-errors.js";
import {
  contactEnquiryCreateSchema,
  enquiryAdminUpdateSchema,
} from "../../validation-schema/enquiry-schema.js";
import { StatusCodes } from "http-status-codes";

/** POST /v1/public/contact-enquiries — public (Contact Us form) */
const create = async (req, res) => {
  let data;
  try {
    data = contactEnquiryCreateSchema.parse(req.body ?? {});
  } catch (error) {
    if (error instanceof ZodError) return sendValidationError(res, error);
    throw error;
  }

  // A bot filled the hidden field: answer as if it worked, save nothing.
  if (data.website) {
    return res.code(StatusCodes.CREATED).send({ success: true, status: true });
  }

  const { website, ...fields } = data;
  const enquiry = await table.ContactEnquiryModel.createRecord({
    ...fields,
    source: fields.source || "contact-page",
  });

  // Fire-and-forget — emails must never block the API response.
  const plain = enquiry.toJSON();
  sendContactEnquiryEmail(plain).catch(() => {});
  sendContactEnquiryConfirmation(plain).catch(() => {});

  return res.code(StatusCodes.CREATED).send({
    success: true,
    status: true,
    id: enquiry.id,
    message: "Thank you. Your message has been received.",
  });
};

/** GET /v1/contact-enquiries — admin */
const list = async (req, res) => {
  const { status, source, q, page, limit, from, to } = req.query;
  const result = await table.ContactEnquiryModel.getAll({
    status,
    source,
    q,
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    from,
    to,
  });
  return res.send(result);
};

/** GET /v1/contact-enquiries/:id — admin */
const getById = async (req, res) => {
  const item = await table.ContactEnquiryModel.getById(req.params.id);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(item);
};

/** PATCH /v1/contact-enquiries/:id — admin (status / notes only) */
const update = async (req, res) => {
  const data = enquiryAdminUpdateSchema.parse(req.body ?? {});
  const fields = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  const item = await table.ContactEnquiryModel.updateById(req.params.id, fields);
  if (!item) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(item);
};

/** DELETE /v1/contact-enquiries/:id — admin */
const destroy = async (req, res) => {
  const ok = await table.ContactEnquiryModel.deleteById(req.params.id);
  if (!ok) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.code(StatusCodes.NO_CONTENT).send();
};

export default { create, list, getById, update, destroy };
