import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// Format (/service/format) and Family / topic (/service/family-topic) share
// the same API shape: list, get, create, update, delete.
const makeOptionApi = (path) => ({
  list: (searchParams = "") => http().get(`${path}?${searchParams}`),
  get: (id) => http().get(`${path}/${id}`),
  create: (data) => http().post(path, data),
  update: (id, data) => http().put(`${path}/${id}`, data),
  remove: (id) => http().delete(`${path}/${id}`),
});

export const formatApi = makeOptionApi(endpoints.serviceFormats.getAll);
export const familyTopicApi = makeOptionApi(endpoints.serviceFamilyTopics.getAll);
