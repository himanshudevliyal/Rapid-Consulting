import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchOrders = async (searchParams) => {
  const { data } = await http().get(
    `${endpoints.orders.getAll}?${searchParams}`,
  );
  return data;
};

export const fetchOrder = async (id) => {
  const { data } = await http().get(`${endpoints.orders.getAll}/${id}`);
  return data;
};

export const createOrder = async (data) => {
  const response = await http().post(endpoints.orders.getAll, data, true);
  return response.data;
};

export const updateOrder = async (id, data) => {
  return await http().put(`${endpoints.orders.getAll}/${id}`, data);
};

export const updateOrderItem = async (orderId, itemId, data) => {
  return await http().put(
    `${endpoints.orders.getAll}/${orderId}/items/${itemId}`,
    data,
  );
};

export const deleteOrder = async (id) => {
  return await http().delete(`${endpoints.orders.getAll}/${id}`);
};

export const fetchOrderItems = async (orderId, searchParams) => {
  const { data } = await http().get(
    `${endpoints.orders.getAll}/${orderId}/items?${searchParams}`,
  );
  return data;
};

export const fetchOrderInvoice = async (orderId) => {
  const response = await http().getFull(
    `${endpoints.orders.getAll}/${orderId}/invoice`,
    { responseType: "blob" },
  );

  const disposition = response.headers["content-disposition"];
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] || "order-invoice.pdf";

  return { blob: response.data, filename };
};

export const fetchOrderShippingLabel = async (orderId) => {
  const response = await http().getFull(
    `${endpoints.orders.getAll}/${orderId}/shipping-label`,
    { responseType: "blob" },
  );

  const disposition = response.headers["content-disposition"];
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] || "order-shipping-details.pdf";

  return { blob: response.data, filename };
};

export const deleteOrderItem = async (itemId) => {
  const { data } = await http().delete(
    `${endpoints.orders.getAll}/${orderId}/items/${itemId}`,
  );
  return data;
};
