import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchArticles = async (searchParams) => {
  const { data } = await http().get(`${endpoints.articles.getAll}?${searchParams}`);
  return data;
};

export const fetchArticle = async (id) => {
  const { data } = await http().get(`${endpoints.articles.getAll}/${id}`);
  return data;
};

export const createArticle = async (data) => {
  const response = await http().post(endpoints.articles.getAll, data, true);
  return response.data;
};

export const updateArticle = async (id, data) => {
  return await http().put(`${endpoints.articles.getAll}/${id}`, data, true);
};

export const deleteArticle = async (id) => {
  return await http().delete(`${endpoints.articles.getAll}/${id}`);
};
