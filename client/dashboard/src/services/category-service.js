import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchCategories = async (searchParams) => {
  const { data } = await http().get(
    `${endpoints.categories.getAll}?${searchParams}`,
  );
  return data;
};

export const fetchCategory = async (id) => {
  const { data } = await http().get(`${endpoints.categories.getAll}/${id}`);
  return data;
};

export const createCategory = async (data) => {
  const response = await http().post(endpoints.categories.getAll, data, true);
  return response.data;
};

export const updateCategory = async (id, data) => {
  return await http().put(`${endpoints.categories.getAll}/${id}`, data, true);
};

export const deleteCategory = async (id) => {
  return await http().delete(`${endpoints.categories.getAll}/${id}`);
};
