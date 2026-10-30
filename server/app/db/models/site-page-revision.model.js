"use strict";
import { DataTypes } from "sequelize";

let SitePageRevisionModel = null;

const TABLE = "site_page_revisions";

// The newest revisions kept for each page.
export const MAX_REVISIONS = 50;

const init = async (sequelize) => {
  SitePageRevisionModel = sequelize.define(
    TABLE,
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      site_page_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "site_pages", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      version: { type: DataTypes.INTEGER, allowNull: false },
      // save | submit | publish | unpublish | restore | translate
      action: { type: DataTypes.STRING(20), allowNull: false },
      note: { type: DataTypes.TEXT, allowNull: true },
      // The page's meta fields and sections at that moment.
      snapshot: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      created_by: { type: DataTypes.UUID, allowNull: true },
      created_by_name: { type: DataTypes.STRING(255), allowNull: true },
    },
    {
      tableName: TABLE,
      timestamps: true,
      updatedAt: false,
      createdAt: "created_at",
      underscored: true,
      indexes: [{ name: "site_page_revisions_page_created_idx", fields: ["site_page_id", "created_at"] }],
    },
  );

  await SitePageRevisionModel.sync({ alter: false, force: false });
};

// Keeps only the newest MAX_REVISIONS of a page.
const prune = async (site_page_id) => {
  const old = await SitePageRevisionModel.findAll({
    where: { site_page_id },
    attributes: ["id"],
    order: [
      ["created_at", "DESC"],
      ["id", "DESC"],
    ],
    offset: MAX_REVISIONS,
  });
  if (old.length) await SitePageRevisionModel.destroy({ where: { id: old.map((row) => row.id) } });
};

const add = async (data) => {
  const revision = await SitePageRevisionModel.create(data);
  await prune(data.site_page_id);
  return revision;
};

// Newest first, without the (large) snapshot.
const list = async (site_page_id) =>
  SitePageRevisionModel.findAll({
    where: { site_page_id },
    attributes: { exclude: ["snapshot"] },
    order: [
      ["created_at", "DESC"],
      ["id", "DESC"],
    ],
  });

const getOne = async (site_page_id, id) =>
  SitePageRevisionModel.findOne({ where: { id, site_page_id } });

const removeForPage = async (site_page_id) => SitePageRevisionModel.destroy({ where: { site_page_id } });

export default { init, add, list, getOne, prune, removeForPage };
