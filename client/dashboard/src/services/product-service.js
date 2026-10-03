import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchProducts = async (searchParams) => {
  const { data } = await http().get(
    `${endpoints.products.getAll}?${searchParams}`,
  );
  return data;
};

export const fetchProduct = async (id) => {
  const { data } = await http().get(`${endpoints.products.getAll}/${id}`);
  return data;
};

export const createProduct = async (product) => {
  const { data } = await http().post(endpoints.products.getAll, product);
  return data;
};

export const updateProduct = async (id, product) => {
  const { data } = await http().put(
    `${endpoints.products.getAll}/${id}`,
    product,
  );
  return data;
};

export const deleteProduct = async (id) => {
  return await http().delete(`${endpoints.products.getAll}/${id}`);
};
