import { endpoints } from "@/utils/endpoints";
import { createContentApi } from "./content-api";

// Cache tag refreshed by POST /api/revalidate when a case study is saved.
export const CASE_STUDIES_TAG = "case-studies";
export const caseStudyTag = (slug) => `case-study:${slug}`;

const api = createContentApi(endpoints.caseStudies);

export const fetchCaseStudies = api.list;
export const fetchAllCaseStudies = api.all;
export const fetchCaseStudyBySlug = api.bySlug;
