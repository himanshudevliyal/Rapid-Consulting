"use strict";
import { z } from "zod";
import table from "../../db/models.js";
import {
  lookupCreateSchema,
  lookupUpdateSchema,
} from "../../validation-schema/service-lookup.schema.js";
import { createLookupController } from "../service-lookup/controller-factory.js";

const icon = { icon: z.string().trim().max(80).nullish() };

// Family / topic = the group a service belongs to (stored in services.family_code).
export default createLookupController({
  model: {
    getAll: (...args) => table.ServiceFamilyTopicModel.getAll(...args),
    getById: (...args) => table.ServiceFamilyTopicModel.getById(...args),
    getByCode: (...args) => table.ServiceFamilyTopicModel.getByCode(...args),
    generateCode: (...args) => table.ServiceFamilyTopicModel.generateCode(...args),
    create: (...args) => table.ServiceFamilyTopicModel.create(...args),
    updateById: (...args) => table.ServiceFamilyTopicModel.updateById(...args),
    deleteById: (...args) => table.ServiceFamilyTopicModel.deleteById(...args),
  },
  createSchema: lookupCreateSchema(icon),
  updateSchema: lookupUpdateSchema(icon),
  label: "Family / topic",
});
