"use strict";
import { DataTypes } from "sequelize";
import constants from "../../lib/constants/index.js";
import { createLookupModel } from "./lookup-model.js";

// "Format" of a service page. The code is stored in services.type.
export default createLookupModel({
  table: constants.models.SERVICE_FORMAT_TABLE,
  usageColumn: "type",
  attributes: {
    is_system: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
});
