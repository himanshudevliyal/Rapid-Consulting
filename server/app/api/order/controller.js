"use strict";
import moment from "moment";
import table from "../../db/models.js";
import { sequelize } from "../../db/postgres.js";
import config from "../../config/index.js";
import crypto from "crypto";

import { createOrderSchema } from "../../validation-schema/order-schema.js";
import { StatusCodes } from "http-status-codes";
import { numberToWords } from "../../helpers/num-to-word.js";
import { generateInvoicePDF } from "../../utils/generate-invoice-pdf.js";
import { generateShippingLabelPDF } from "../../utils/generate-shipping-label-pdf.js";
import { generateTransactionID } from "../../utils/generate-transaction-id.js";

const create = async (req, res) => {
  const transaction = await sequelize.transaction();
  const payuKey = config.payu_merchant_key;
  const transactionId = generateTransactionID();
  req.body.transaction_id = transactionId;

  try {
    const validateData = createOrderSchema.parse(req.body);

    let subtotal = 0;
    let total = 0;

    const items = [];

    // Products no longer carry a catalog price, so unit price for each line
    // comes from validateData.order_items[].product_price (quoted/negotiated
    // price supplied by the client/admin at order time).
    const itemRecords = await Promise.all(
      validateData.order_items.map(async (item) => {
        let record = await table.ProductModel.getById(0, item.product_id);
        if (!record)
          throw new Error(`Product not found with id ${item.product_id}`);

        items.push({
          qty: item.quantity,
          unitPrice: parseFloat(item.product_price),
          title: record.title,
        });

        const stockRecord = await table.InventoryModel.getById(
          0,
          item.product_id,
        );
        if (!stockRecord) return null;
        if (stockRecord.stock >= item.quantity) {
          await table.InventoryModel.update(
            { body: { stock: stockRecord.stock - item.quantity } },
            item.product_id,
            transaction,
          );
          console.log("Stock updated");
        } else {
          return null;
        }

        const lineTotal = item.product_price * item.quantity;
        subtotal += lineTotal;
        total += lineTotal;

        return {
          order_id: null,
          product_id: item.product_id,
          quantity: item.quantity,
          product_price: item.product_price,
          title: record?.title,
          total: lineTotal,
          sub_total: lineTotal,
        };
      }),
    );

    req.body.subtotal = subtotal;
    req.body.total = total;

    // create order
    const orderRecord = await table.OrderModel.create(req, transaction);

    // attach order_id to each item
    const bulkOrderItemData = itemRecords.filter(Boolean).map((i) => ({
      ...i,
      order_id: orderRecord.id,
    }));
    // bulk insert items
    await table.OrderItemModel.bulkCreate(bulkOrderItemData, transaction);
    await table.CartModel.deleteByUserId(req, 0, transaction);

    const invoiceData = await table.OrderModel.getById(
      0,
      orderRecord.id,
      transaction,
    );

    const firstName = req.user_data.fullname.split(" ")[0];
    const email = req.user_data.email;

    const hashString = `${payuKey}|${transactionId}|${total}|${orderRecord.order_no}|${firstName}|${email}|||||||||||${config.payu_merchant_salt}`;

    const sha512Hash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex");

    await table.PaymentModel.create(
      {
        body: {
          order_id: orderRecord.id,
          amount: total,
          payment_status: "initiated",
          transaction_id: transactionId,
        },
      },
      transaction,
    );

    // throw new Error("wekfbwe");
    await transaction.commit();
    // return res.code(StatusCodes.CREATED).send({
    //   status: true,
    //   message: "Order created",
    // });
    res.code(StatusCodes.CREATED).send({
      status: true,
      message: "Order created",
      data: {
        hash: sha512Hash,
        key: payuKey,
        transaction_id: transactionId,
        order: {
          amount: total,
          order_no: orderRecord.order_no,
          first_name: firstName,
          email: email,
          phone: req.user_data.mobile_number,
        },
      },
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const get = async (req, res) => {
  try {
    const data = await table.OrderModel.get(req);
    res.code(StatusCodes.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const update = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const record = await table.OrderModel.getById(req);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    await table.OrderModel.update(req, 0, transaction);
    if (req.body.order_status === "Canceled") {
      const data = await table.OrderItemModel.getByOrderId(req);
      const updateInventoryPromises = data.items.map(async (item) => {
        const stockRecord = await table.InventoryModel.getById(
          0,
          item.product_id,
        );
        return table.InventoryModel.update(
          { body: { stock: stockRecord.stock + item.quantity } },
          item.product_id,
          transaction,
        );
      });
      await Promise.all(updateInventoryPromises);
    }
    await transaction.commit();

    res.code(StatusCodes.OK).send({ status: true, message: "Order updated." });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.OrderModel.getById(req);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    res.code(StatusCodes.OK).send({ status: true, data: record });
  } catch (error) {
    throw error;
  }
};

const updateOrderItem = async (req, res) => {
  try {
    const orderRecord = await table.OrderModel.getById(0, req.params.order_id);
    if (!orderRecord)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    const record = await table.OrderItemModel.getById(
      0,
      req.params.item_id,
    );
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order item not found." });

    await table.OrderItemModel.update(req, req.params.item_id);
    res.code(StatusCodes.OK).send({ status: true, message: "Order deleted." });
  } catch (error) {
    throw error;
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.OrderModel.getById(req);
    if (!record)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found." });

    await table.OrderModel.deleteById(req);
    res.code(StatusCodes.OK).send({ status: true, message: "Order deleted." });
  } catch (error) {
    throw error;
  }
};

const getOrderItems = async (req, res) => {
  try {
    const data = await table.OrderItemModel.getByOrderId(req);
    res.code(StatusCodes.OK).send({ status: true, data: data });
  } catch (error) {
    throw error;
  }
};

const getOrderInvoice = async (req, res) => {
  try {
    const orderRecord = await table.OrderModel.getById(req);
    if (!orderRecord)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found!" });

    const user = await table.UserModel.getById(0, orderRecord.user_id);

    const orderItems = await table.OrderItemModel.getByOrderId(req);
    // Calculate totals
    // const subtotal = orderItems.items.reduce(
    //   (sum, item) => sum + item.quantity * parseFloat(item.price),
    //   0
    // );

    // const subtotal = orderItems.items.reduce((sum, item) => {
    //   const itemGstAmt = (parseFloat(item.price) * 18) / 100;
    //   const itemRateExclGst = parseFloat(item.price) - itemGstAmt;
    //   const totalExclGst = itemRateExclGst * item.quantity;

    //   return sum + totalExclGst;
    // }, 0);

    const subtotal = orderItems.items.reduce((sum, item) => {
      const price = Number(item.product_price);
      const quantity = Number(item.quantity);
      if (!Number.isFinite(price) || !Number.isFinite(quantity)) {
        throw new Error("Invalid price or quantity");
      }

      const basePrice = price / 1.18;
      return sum + basePrice * quantity;
    }, 0);

    const total = orderItems.items.reduce((sum, item) => {
      const price = Number(item.product_price);
      const quantity = Number(item.quantity);

      if (!Number.isFinite(price) || !Number.isFinite(quantity)) {
        throw new Error("Invalid price or quantity");
      }

      return sum + price * quantity;
    }, 0);

    const billingState = String(orderRecord?.billing_address?.state || "")
      .trim()
      .toLowerCase();

    const gstStateCode = user.gstin?.substring(0, 2);

    const isInterState = billingState !== "delhi" && gstStateCode !== "07";

    const cgstTotal = isInterState ? 0 : (subtotal * 9) / 100;
    const sgstTotal = isInterState ? 0 : (subtotal * 9) / 100;
    const igstTotal = isInterState ? (subtotal * 18) / 100 : 0;

    const invoiceData = {
      seller: {
        name: "Radhayu Herbals",
        address:
          "DPT 808B, F79 & 80, DLF Prime Tower, Industrial Area, Okhla Phase-1, New Delhi - 110020",
        country: "India",
        phone: "+91 97119 75094",
        email: "radhayuherbals@gmail.com",
        website: "radhayuherbals.com",
        gstin: "07BMDPK1948P1ZK",
      },
      buyer: {
        shipping_address: {
          name: orderRecord.shipping_address.fullname,
          address: `${orderRecord.shipping_address.house ?? "N/a"}, ${orderRecord.shipping_address.street}, ${orderRecord.shipping_address.city}, ${orderRecord.shipping_address.state} ${orderRecord.shipping_address.postal_code}.\n Phone: ${orderRecord.shipping_address.phone}`,
          gstin: user.gstin || "N/A",
        },
        billing_address: {
          name: orderRecord.billing_address.fullname,
          address: `${orderRecord.billing_address.house ?? "N/a"}, ${orderRecord.billing_address.street}, ${orderRecord.billing_address.city}, ${orderRecord.billing_address.state} ${orderRecord.billing_address.postal_code}.\n Phone: ${orderRecord.billing_address.phone}`,
          gstin: user.gstin || "N/A",
        },
      },
      invoice: {
        number: orderRecord.invoice_number,
        date: moment(orderRecord.created_at).format("DD.MM.YYYY"),
        placeOfSupply: orderRecord.shipping_address.state,
      },
      items: orderItems.items.map((item) => ({
        description: item.title,
        qty: item.quantity,
        rate: parseFloat(item.product_price),
        ...(orderRecord.is_inter_state ? { igst: 18 } : { cgst: 9, sgst: 9 }),
      })),
      is_inter_state: isInterState,
      total_in_word: numberToWords(parseFloat(orderRecord.total)),
      subtotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      total: parseFloat(total),
    };

    const pdfBuffer = await generateInvoicePDF(
      invoiceData,
      orderRecord.is_paid,
    );

    res.header("Content-Type", "application/pdf");
    res.header(
      "Content-Disposition",
      `attachment; filename="${orderRecord.invoice_number}.pdf"`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating invoice:", error);
    res
      .code(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ status: false, message: "Error generating PDF" });
  }
};

const getOrderShippingLabel = async (req, res) => {
  try {
    const orderRecord = await table.OrderModel.getById(req);
    if (!orderRecord)
      return res
        .code(StatusCodes.NOT_FOUND)
        .send({ status: false, message: "Order not found!" });

    const orderItems = await table.OrderItemModel.getByOrderId(req);
    const labelData = {
      customer: {
        name: orderRecord.fullname,
        address: [
          orderRecord.shipping_address.house ?? "N/A",
          orderRecord.shipping_address.street,
          orderRecord.shipping_address.city,
          orderRecord.shipping_address.state,
        ],
        city: `${orderRecord.shipping_address.state} ${orderRecord.shipping_address.postal_code}`,
        phone: orderRecord.shipping_address.phone,
      },
      returnAddress: {
        name: "Radhayu Herbals",
        address: [
          "DPT 808B, F79 & 80",
          "DLF Prime Tower, Industrial Area",
          "Okhla Phase-1, New Delhi - 110020",
          "Phone: +91 97119 75094",
          "Email: radhayuherbals@gmail.com",
        ],
      },
      products: orderItems.items.map((item) => ({
        description: item.title,
        qty: item.quantity,
      })),
      orderNo: orderRecord.order_no,
    };

    const pdfBuffer = await generateShippingLabelPDF(
      labelData,
      orderRecord.is_paid,
    );

    res.header("Content-Type", "application/pdf");
    res.header(
      "Content-Disposition",
      `attachment; filename="shipping-label-${orderRecord.order_no}.pdf"`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating shipping label:", error);
    res
      .code(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ status: false, message: "Error generating shipping label PDF" });
  }
};

export default {
  create: create,
  get: get,
  getOrderItems: getOrderItems,
  update: update,
  updateOrderItem: updateOrderItem,
  deleteById: deleteById,
  getById: getById,
  getOrderInvoice: getOrderInvoice,
  getOrderShippingLabel: getOrderShippingLabel,
};
