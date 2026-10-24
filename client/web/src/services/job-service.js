import { endpoints } from "@/utils/endpoints";
import { createContentApi } from "./content-api";

// Cache tag refreshed by POST /api/revalidate when a job is saved.
export const JOBS_TAG = "jobs";
export const jobTag = (slug) => `job:${slug}`;

const api = createContentApi(endpoints.jobs);

// Open jobs only (active, closing date not passed).
export const fetchJobs = api.list;
export const fetchAllJobs = api.all;
export const fetchJobBySlug = api.bySlug;
