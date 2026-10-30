export const endpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    signup: "/auth/signup",
    refresh: "/auth/refresh",
    username: "/auth/username",
    acceptInvite: "/auth/accept-invite",
  },
  profile: "/users/me",
  files: {
    upload: "/upload/files",
    getFiles: "/upload",
    deleteKey: "/upload/s3",
    preSignedUrl: "/upload/presigned-url",
    preSignedUrls: "/upload/presigned-urls",
  },
  users: { getAll: "/users" },
  products: { getAll: "/products" },
  orders: { getAll: "/orders" },
  reports: { getAll: "/reports" },
  inventories: { getAll: "/inventories" },
  categories: { getAll: "/categories" },
  subCategories: { getAll: "/sub-categories" },
  queries: { getAll: "/queries" },
  productInquiries: { getAll: "/product-inquiries" },
  blogs: { getAll: "/blogs" },
  // RC modules
  enquiries: { getAll: "/enquiries" },
  contactEnquiries: { getAll: "/contact-enquiries" },
  // getAll = base path for create / update / delete / by id; list = admin list incl. drafts
  articles: { getAll: "/articles", list: "/articles/all" },
  // getAll = base path for create / update / delete / by id; list = admin list incl. drafts
  caseStudies: { getAll: "/case-studies", list: "/case-studies/all" },
  advisers: { getAll: "/advisers", list: "/advisers/all" },
  jobs: { getAll: "/jobs", list: "/jobs/all" },
  // getAll = base path for create / update / delete / by id; list = admin list incl. inactive
  sessions: { getAll: "/sessions", list: "/sessions/all" },
  communityGroups: { getAll: "/community-groups", list: "/community-groups/all" },
  industries: { getAll: "/industries", list: "/industries/all" },
  // getAll = base path for create / update / delete / by id; list = admin list incl. drafts
  schemes: { getAll: "/schemes", list: "/schemes/all" },
  services: { getAll: "/services" },
  serviceFormats: { getAll: "/service/format" },
  serviceFamilyTopics: { getAll: "/service/family-topic" },
  // getAll = base path for create / update / delete / by id; list = admin list (no sections)
  sitePages: { getAll: "/site-pages", list: "/site-pages/all", registry: "/site-pages/registry" },
  // /site-settings/<key>, e.g. "navigation" (admin only)
  siteSettings: { getAll: "/site-settings" },
};
