export const endpoints = {
  services: {
    getAll: "/services",
    getBySlug: "/services/get-by-slug",
    getByCode: "/services/get-by-code",
  },
  // Public content (published records only). Detail = `${getBySlug}/${slug}`.
  articles: { getAll: "/articles", getBySlug: "/articles/by-slug" },
  caseStudies: { getAll: "/case-studies", getBySlug: "/case-studies/by-slug" },
  schemes: { getAll: "/schemes", getBySlug: "/schemes/by-slug" },
  // Public forms.
  enquiries: { create: "/enquiries" },
  queries: { create: "/queries" },
};
