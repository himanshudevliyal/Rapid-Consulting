import { endpoints } from "@/utils/endpoints";
import { createContentApi } from "./content-api";

// Cache tag refreshed by POST /api/revalidate when a scheme is saved.
export const SCHEMES_TAG = "schemes";
export const schemeTag = (slug) => `scheme:${slug}`;

const api = createContentApi(endpoints.schemes);

export const fetchSchemes = api.list;
export const fetchAllSchemes = api.all;
export const fetchSchemeBySlug = api.bySlug;
