import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchProductVariants = async (searchParams) => {
  const { data } = await http().get(
    `${endpoints.productVariants.getAll}?${searchParams}`,
  );
  return data;
};

export const fetchProductVariant = async (id) => {
  const { data } = await http().get(
    `${endpoints.productVariants.getAll}/${id}`,
  );
  return data;
};

export const createProductVariant = async (product) => {
  const { data } = await http().post(
    endpoints.productVariants.getAll,
    product,
    true,
  );
  return data;
};

export const updateProductVariant = async (id, product) => {
  const { data } = await http().put(
    `${endpoints.productVariants.getAll}/${id}`,
    product,
    true,
  );
  return data;
};

export const deleteProductVariant = async (id) => {
  return await http().delete(`${endpoints.productVariants.getAll}/${id}`);
};
