import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// Admin site settings by key, e.g. "navigation".
export const fetchSiteSetting = async (key) => {
  return await http().get(`${endpoints.siteSettings.getAll}/${key}`);
};

// The value is sent as { value }.
export const updateSiteSetting = async (key, value) => {
  return await http().put(`${endpoints.siteSettings.getAll}/${key}`, { value });
};
