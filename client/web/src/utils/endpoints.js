export const endpoints = {
  services: {
    getAll: "/services",
    getBySlug: "/services/get-by-slug",
    getByCode: "/services/get-by-code",
    categories: "/services/categories",
  },
  industries: { getAll: "/industries", getBySlug: "/industries/by-slug" },
  // Public content (published records only). Detail = `${getBySlug}/${slug}`.
  articles: { getAll: "/articles", getBySlug: "/articles/by-slug" },
  caseStudies: { getAll: "/case-studies", getBySlug: "/case-studies/by-slug" },
  schemes: { getAll: "/schemes", getBySlug: "/schemes/by-slug" },
  // Careers (open jobs only) and the people shown on the About page.
  jobs: { getAll: "/jobs", getBySlug: "/jobs/by-slug" },
  advisers: { getAll: "/advisers" },
  // Public forms.
  enquiries: { create: "/enquiries" },
  contactEnquiries: { create: "/contact-enquiries" },
  queries: { create: "/queries" },
};
