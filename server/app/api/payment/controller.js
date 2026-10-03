"use strict";
import { StatusCodes } from "http-status-codes";
import config from "../../config/index.js";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";

const success = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const transactionId = req.body.txnid;

    const transactionRecord =
      await table.PaymentModel.getByTxnId(transactionId);
    if (!transactionRecord)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Transaction not found." });

    const order = await table.OrderModel.getById(0, transactionRecord.order_id);
    if (!order)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    await table.OrderModel.update(
      { body: { order_status: "Order Accepted", is_paid: true } },
      transactionRecord.order_id,
      transaction,
    );

    await table.PaymentModel.update(
      {
        body: {
          payment_status: req.body.status,
          remarks: req.body.error_Message,
          response: JSON.stringify(req.body),
        },
      },
      transactionId,
      transaction,
    );

    await transaction.commit();

    res.redirect(`${config.site_url}/payu-success?tid=${transactionId}`);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const failure = async (req, res) => {
  const transaction = await sequelize.transaction();
  console.log(req.body);
  try {
    const transactionId = req.body.txnid;
    const transactionRecord =
      await table.PaymentModel.getByTxnId(transactionId);
    if (!transactionRecord)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Transaction not found." });

    const order = await table.OrderModel.getById(0, transactionRecord.order_id);
    if (!order)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    await table.OrderModel.update(
      { body: { order_status: "Canceled", is_paid: false } },
      transactionRecord.order_id,
      transaction,
    );

    await table.PaymentModel.update(
      {
        body: {
          payment_status: req.body.status,
          remarks: req.body.error_Message,
          response: JSON.stringify(req.body),
        },
      },
      transactionId,
      transaction,
    );

    const data = await table.OrderItemModel.getByOrderId(req, order.id);
    const updateInventoryPromises = data.items.map(async (item) => {
      const stockRecord = await table.InventoryModel.getById(0, item.item_id);
      return table.InventoryModel.update(
        { body: { stock: stockRecord.stock + item.quantity } },
        item.item_id,
        transaction,
      );
    });

    await Promise.all(updateInventoryPromises);

    await transaction.commit();

    res.redirect(`${config.site_url}/payu-failure?tid=${transactionId}`);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default {
  success: success,
  failure: failure,
};
