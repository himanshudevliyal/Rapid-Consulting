"use strict";
import { StatusCodes } from "http-status-codes";

// CRUD controller shared by the Format and Family / topic lists.
export const createLookupController = ({
  model,
  createSchema,
  updateSchema,
  label, // "Format" | "Family / topic"
  usedByLabel = "services",
}) => {
  const fail = (res, status, message) =>
    res.code(status).send({ status: false, message });

  const toBool = (value) =>
    value === "true" ? true : value === "false" ? false : undefined;

  // GET / ?q=&is_active=true&page=1&limit=10  (no limit = every row)
  const list = async (req, res) => {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : null;
    const { rows, total } = await model.getAll({
      q: req.query.q || null,
      is_active: toBool(req.query.is_active),
      page,
      limit,
    });
    return res.send({ status: true, data: rows, total, page, limit });
  };

  const getById = async (req, res) => {
    const record = await model.getById(req.params.id);
    if (!record) return fail(res, StatusCodes.NOT_FOUND, `${label} not found.`);
    return res.send({ status: true, data: record });
  };

  const create = async (req, res) => {
    const data = createSchema.parse(req.body);
    data.code = data.code || (await model.generateCode(data.name));
    if (await model.getByCode(data.code)) {
      return fail(res, StatusCodes.CONFLICT, `A ${label} with the code "${data.code}" already exists.`);
    }
    const record = await model.create(data);
    return res
      .code(StatusCodes.CREATED)
      .send({ status: true, message: `${label} created.`, data: record });
  };

  const update = async (req, res) => {
    const data = updateSchema.parse(req.body);
    const existing = await model.getById(req.params.id);
    if (!existing) return fail(res, StatusCodes.NOT_FOUND, `${label} not found.`);
    if (data.code !== undefined && data.code !== existing.code) {
      return fail(
        res,
        StatusCodes.BAD_REQUEST,
        `The code cannot be changed because ${usedByLabel} refer to it. Create a new ${label} instead.`,
      );
    }
    const record = await model.updateById(req.params.id, data);
    return res.send({ status: true, message: `${label} updated.`, data: record });
  };

  const destroy = async (req, res) => {
    const existing = await model.getById(req.params.id);
    if (!existing) return fail(res, StatusCodes.NOT_FOUND, `${label} not found.`);
    if (existing.is_system) {
      return fail(res, StatusCodes.BAD_REQUEST, `"${existing.name}" is a built-in ${label} and cannot be deleted. You can mark it inactive instead.`);
    }
    if (existing.service_count > 0) {
      return fail(
        res,
        StatusCodes.CONFLICT,
        `Cannot delete "${existing.name}": ${existing.service_count} ${usedByLabel} use it. Change those first, or mark it inactive.`,
      );
    }
    await model.deleteById(req.params.id);
    return res.send({ status: true, message: `${label} deleted.`, data: existing });
  };

  return { list, getById, create, update, destroy };
};

export const lookupRoutes = (controller) => async (fastify) => {
  fastify.get("/", controller.list);
  fastify.post("/", controller.create);
  fastify.get("/:id", controller.getById);
  fastify.put("/:id", controller.update);
  fastify.delete("/:id", controller.destroy);
};
