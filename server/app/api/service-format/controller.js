"use strict";
import table from "../../db/models.js";
import {
  lookupCreateSchema,
  lookupUpdateSchema,
} from "../../validation-schema/service-lookup.schema.js";
import { createLookupController } from "../service-lookup/controller-factory.js";

// Format = the kind of service page (stored in services.type).
export default createLookupController({
  model: {
    getAll: (...args) => table.ServiceFormatModel.getAll(...args),
    getById: (...args) => table.ServiceFormatModel.getById(...args),
    getByCode: (...args) => table.ServiceFormatModel.getByCode(...args),
    generateCode: (...args) => table.ServiceFormatModel.generateCode(...args),
    create: (...args) => table.ServiceFormatModel.create(...args),
    updateById: (...args) => table.ServiceFormatModel.updateById(...args),
    deleteById: (...args) => table.ServiceFormatModel.deleteById(...args),
  },
  createSchema: lookupCreateSchema(),
  updateSchema: lookupUpdateSchema(),
  label: "Format",
});
