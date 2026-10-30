"use strict";
import { DataTypes } from "sequelize";

let SiteSettingModel = null;

const TABLE = "site_settings";

const init = async (sequelize) => {
  SiteSettingModel = sequelize.define(
    TABLE,
    {
      key: { type: DataTypes.STRING(100), primaryKey: true },
      value: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      updated_by: { type: DataTypes.UUID, allowNull: true },
    },
    {
      tableName: TABLE,
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  await SiteSettingModel.sync({ alter: false, force: false });
};

const get = async (key) => SiteSettingModel.findByPk(key);

const set = async (key, value, updated_by = null) => {
  await SiteSettingModel.upsert({ key, value, updated_by });
  return SiteSettingModel.findByPk(key);
};

export default { init, get, set };
