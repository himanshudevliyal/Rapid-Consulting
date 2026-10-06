import { endpoints } from "@/utils/endpoints";
import { createContentApi } from "./content-api";

// Cache tag refreshed by POST /api/revalidate when an article is saved.
export const ARTICLES_TAG = "articles";
export const articleTag = (slug) => `article:${slug}`;

const api = createContentApi(endpoints.articles);

export const fetchArticles = api.list;
export const fetchAllArticles = api.all;
export const fetchArticleBySlug = api.bySlug;
