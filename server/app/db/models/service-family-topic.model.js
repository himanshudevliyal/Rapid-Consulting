"use strict";
import { DataTypes } from "sequelize";
import constants from "../../lib/constants/index.js";
import { createLookupModel } from "./lookup-model.js";

// "Family / topic" a service belongs to. The code is stored in
// services.family_code (for example "S02").
export default createLookupModel({
  table: constants.models.SERVICE_FAMILY_TOPIC_TABLE,
  usageColumn: "family_code",
  attributes: {
    icon: { type: DataTypes.STRING(80) },
  },
  editable: ["icon"],
  codePrefix: "S",
});
