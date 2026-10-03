"use strict";
import table from "../../db/models.js";
import { sendEnquiryEmail, sendEnquiryConfirmation } from "../../services/mailer.js";
import { StatusCodes } from "http-status-codes";

/** POST /api/v1/public/enquiries — public */
const create = async (req, res) => {
  const { name, phone, location, requirement, subject, page_title, page_id, source } = req.body;
  const { email } = req.body;

  if (!name || !phone) {
    return res.code(StatusCodes.BAD_REQUEST).send({ error: "name and phone are required" });
  }

  const enquiry = await table.EnquiryModel.createRecord({
    name: name.trim(),
    phone: phone.trim(),
    email: email?.trim() || null,
    location: location?.trim() || null,
    requirement: requirement?.trim() || null,
    subject: subject?.trim() || null,
    page_title: page_title?.trim() || null,
    page_id: page_id?.trim() || null,
    source: source || "contact-form",
  });

  // Fire-and-forget — emails must never block the API response
  sendEnquiryEmail(enquiry).catch(() => {});
  sendEnquiryConfirmation(enquiry).catch(() => {});

  return res.code(StatusCodes.CREATED).send({ id: enquiry.id, success: true });
};

/** GET /api/v1/enquiries — admin */
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

/** GET /api/v1/enquiries/:id — admin */
const getById = async (req, res) => {
  const enquiry = await table.EnquiryModel.getById(req.params.id);
  if (!enquiry) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(enquiry);
};

/** PATCH /api/v1/enquiries/:id — admin (update status / notes) */
const update = async (req, res) => {
  const { status, notes } = req.body;
  const enquiry = await table.EnquiryModel.updateById(req.params.id, { status, notes });
  if (!enquiry) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.send(enquiry);
};

/** DELETE /api/v1/enquiries/:id — admin */
const destroy = async (req, res) => {
  const ok = await table.EnquiryModel.deleteById(req.params.id);
  if (!ok) return res.code(StatusCodes.NOT_FOUND).send({ error: "Not found" });
  return res.code(StatusCodes.NO_CONTENT).send();
};

export default { create, list, getById, update, destroy };
