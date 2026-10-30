import { endpoints } from "@/utils/endpoints";
import { createContentApi } from "./content-api";

// Expert sessions (webinars). Cache tag refreshed by POST /api/revalidate
// when a session is saved in the admin panel.
export const SESSIONS_TAG = "sessions";
export const sessionTag = (slug) => `session:${slug}`;

const api = createContentApi(endpoints.sessions);

// params: q, state ("upcoming" | "past"), page, limit
export const fetchSessions = api.list;
export const fetchAllSessions = api.all;
export const fetchSessionBySlug = api.bySlug;
