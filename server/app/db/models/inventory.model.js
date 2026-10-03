import { DataTypes, Deferrable, QueryTypes } from "sequelize";
import constants from "../../lib/constants/index.js";

let InventoryModel;
const init = async (sequelize) => {
  InventoryModel = sequelize.define(
    constants.models.INVENTORY_TABLE,
    {
      product_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
          model: constants.models.PRODUCT_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
        onDelete: "CASCADE",
      },

      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["product_id"] }, { fields: ["stock"] }],
    },
  );

  return InventoryModel;
};

const create = async (req, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  const data = await InventoryModel.create(
    {
      product_id: req.body.product_id,
      stock: req.body.stock,
    },
    options,
  );

  return data.dataValues;
};
const bulkCreate = async (data, transaction) => {
  const options = {};
  if (transaction) options.transaction = transaction;

  return await InventoryModel.bulkCreate(data, options);
};

const get = async (req) => {
  const whereConditions = [];
  const queryParams = {};

  const itemId = req?.params?.product_id ?? null;
  if (itemId) {
    whereConditions.push(`invn.product_id = :itemId`);
    queryParams.itemId = itemId;
  }

  const q = req.query.q ? req.query.q : null;
  if (q) {
    whereConditions.push(`prd.title ILIKE :query`);
    queryParams.query = `%${q}%`;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = (page - 1) * limit;

  let whereClause = "";
  if (whereConditions.length) {
    whereClause = `WHERE ${whereConditions.join(" AND ")}`;
  }

  const query = `
  SELECT 
      invn.*,
      prd.title,
      prd.hero,
      prd.gallery
    FROM ${constants.models.INVENTORY_TABLE} invn
    LEFT JOIN ${constants.models.PRODUCT_TABLE} prd ON prd.id = invn.product_id
    ${whereClause}
    ORDER BY invn.created_at DESC
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
  SELECT 
      COUNT(invn.product_id) OVER()::integer as total
    FROM ${constants.models.INVENTORY_TABLE} invn
    ${whereClause}
  `;

  const inventory = await InventoryModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const count = await InventoryModel.sequelize.query(countQuery, {
    replacements: { ...queryParams },
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });

  return { inventory, total: count?.total ?? 0 };
};

const getById = async (req, id) => {
  return await InventoryModel.findOne({
    where: { product_id: req?.params?.id || id },
    raw: true,
  });
};

const update = async (req, id, transaction) => {
  const options = {
    where: { product_id: req?.params?.id || id },
  };
  if (transaction) options.transaction = transaction;

  return await InventoryModel.update({ stock: req.body.stock }, options);
};

export default {
  init: init,
  create: create,
  bulkCreate: bulkCreate,
  get: get,
  getById: getById,
  update: update,
};
