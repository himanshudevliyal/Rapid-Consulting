import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchInventories = async (searchParams) => {
  const { data } = await http().get(
    `${endpoints.inventories.getAll}?${searchParams}`,
  );
  return data;
};

export const fetchInventory = async (id) => {
  const { data } = await http().get(`${endpoints.inventories.getAll}/${id}`);
  return data;
};

export const createInventory = async (data) => {
  const response = await http().post(endpoints.inventories.getAll, data);
  return response.data;
};

export const updateInventory = async (id, data) => {
  return await http().put(`${endpoints.inventories.getAll}/${id}`, data);
};

export const deleteInventory = async (id) => {
  return await http().delete(`${endpoints.inventories.getAll}/${id}`);
};
