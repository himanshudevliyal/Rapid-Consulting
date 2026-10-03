import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchSubCategories = async (searchParams) => {
  const { data } = await http().get(
    `${endpoints.subCategories.getAll}?${searchParams}`,
  );
  return data;
};

export const fetchSubCategory = async (id) => {
  const { data } = await http().get(
    `${endpoints.subCategories.getAll}/${id}`,
  );
  return data;
};

export const createSubCategory = async (data) => {
  const response = await http().post(
    endpoints.subCategories.getAll,
    data,
    true,
  );
  return response.data;
};

export const updateSubCategory = async (id, data) => {
  return await http().put(
    `${endpoints.subCategories.getAll}/${id}`,
    data,
    true,
  );
};

export const deleteSubCategory = async (id) => {
  return await http().delete(`${endpoints.subCategories.getAll}/${id}`);
};
