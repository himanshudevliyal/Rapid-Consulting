import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// Admin list: every article, drafts included -> { total, page, limit, totalPages, data: [...] }
export const fetchArticles = async (searchParams) => {
  return await http().get(`${endpoints.articles.list}?${searchParams}`);
};

// One article (the record itself).
export const fetchArticle = async (id) => {
  return await http().get(`${endpoints.articles.getAll}/${id}`);
};

export const createArticle = async (data) => {
  return await http().post(endpoints.articles.getAll, data);
};

export const updateArticle = async (id, data) => {
  return await http().put(`${endpoints.articles.getAll}/${id}`, data);
};

export const deleteArticle = async (id) => {
  return await http().delete(`${endpoints.articles.getAll}/${id}`);
};
