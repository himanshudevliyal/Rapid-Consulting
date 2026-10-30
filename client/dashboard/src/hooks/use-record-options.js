import { useQuery } from "@tanstack/react-query";
import { fetchAdvisers } from "@/services/adviser-service";
import { fetchArticles } from "@/services/article-service";
import { fetchCaseStudies } from "@/services/case-study-service";
import { fetchIndustries } from "@/services/industry-service";
import { fetchSchemes } from "@/services/scheme-service";
import { fetchServices } from "@/services/service-service";

const LIMIT = "page=1&limit=500";

// Any of: [..], { data: [..] }, { data: { services: [..] } }, { services: [..] }
const rowsOf = (body) => {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.services)) return body.data.services;
  if (Array.isArray(body?.services)) return body.services;
  return [];
};

// Each record type: the admin list call and how a row is shown. `id` is what
// pages store; slug and title are kept next to it for the website.
const SOURCES = {
  scheme: { load: () => fetchSchemes(LIMIT), title: (row) => row.title, hint: (row) => row.ministry },
  case_study: { load: () => fetchCaseStudies(LIMIT), title: (row) => row.title, hint: (row) => row.client_name },
  article: { load: () => fetchArticles(LIMIT), title: (row) => row.title, hint: (row) => row.type },
  adviser: {
    load: () => fetchAdvisers(""),
    title: (row) => row.name,
    hint: (row) => row.designation,
  },
  service: {
    // The /services index page is not a service to link to.
    load: async () => rowsOf(await fetchServices("page=1")).filter((row) => row.type !== "index"),
    title: (row) => row.title,
    hint: (row) => row.code,
  },
  industry: { load: () => fetchIndustries(""), title: (row) => row.name, hint: (row) => row.slug },
};

export const RECORD_TYPE_LABELS = {
  scheme: "scheme",
  case_study: "case study",
  article: "article",
  adviser: "person",
  service: "service",
  industry: "industry",
};

// Options for a record picker: [{ id, slug, title, hint }], loaded once per
// record type from the matching admin list endpoint.
export const useRecordOptions = (recordType) => {
  const source = SOURCES[recordType];
  const query = useQuery({
    queryKey: ["record-options", recordType],
    queryFn: async () => {
      const rows = rowsOf(await source.load());
      return rows
        .map((row) => ({
          id: String(row.id),
          slug: row.slug ?? "",
          title: source.title(row) || row.slug || String(row.id),
          hint: source.hint(row) || "",
        }))
        .sort((a, b) => a.title.localeCompare(b.title));
    },
    enabled: !!source,
    staleTime: 60 * 1000,
  });
  return { ...query, options: query.data ?? [], supported: !!source };
};
