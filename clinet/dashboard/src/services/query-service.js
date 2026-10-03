import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchQueries = async (searchParams) => {
  const { data } = await http().get(
    `${endpoints.queries.getAll}?${searchParams}`,
  );

  return data;
};

export const fetchQuery = async (id) => {
  const { data } = await http().get(`${endpoints.queries.getAll}/${id}`);

  return data;
};

export const createQuery = async (data) => {
  const response = await http().post(endpoints.queries.getAll, data, true);

  return response.data;
};

export const updateQuery = async (id, data) => {
  return await http().put(`${endpoints.queries.getAll}/${id}`, data, true);
};

export const deleteQuery = async (id) => {
  return await http().delete(`${endpoints.queries.getAll}/${id}`);
};
