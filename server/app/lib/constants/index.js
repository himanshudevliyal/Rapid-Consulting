"use strict";

const constants = {
  environment: {
    LOCAL: "local",
    DEVELOPMENT: "development",
    TEST: "test",
    PRODUCTION: "production",
  },
  http: {
    status: {
      OK: 200,
      CREATED: 201,
      ACCEPTED: 202,
      NOCONTENT: 204,
      MULTI_STATUS: 207,
      REDIRECT: 301,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      CONFLICT: 409,
      INTERNAL_SERVER_ERROR: 500,
      NOT_FOUND: 404,
    },
  },
  error: {
    validation: {},
    message: {
      // HTTP Status code messages
      HTTP_STATUS_CODE_201: "Created",
      HTTP_STATUS_CODE_400: "Bad Request.",
      HTTP_STATUS_CODE_301: "Redirect to other url",
      HTTP_STATUS_CODE_401: "Unauthorized.",
      HTTP_STATUS_CODE_403: "Forbidden.",
      HTTP_STATUS_CODE_404: "The specified resource was not found.",
      HTTP_STATUS_CODE_409: "Resource already exists",
      HTTP_STATUS_CODE_500: "Internal Server Error.",
      INVALID_LOGIN: "Invalid Login",
      EMAIL_MISSING: "Email Missing",
      PAYMENT_ACCOUNT_ID_MISSING: "Payment Account Id Missing",
      INVALID_PAYMENT_ACCOUNT_ID: "Invalid Payment Account Id provided",
    },
  },
  models: {
    USER_TABLE: "users",
    PRODUCT_TABLE: "products",
    PRODUCT_VARIANT_TABLE: "product_variants", // kept only so old/new migration files can reference the (now dropped) table name
    BOOK_TABLE: "books",
    PAYMENT_TABLE: "payments",
    ORDER_TABLE: "orders",
    ORDER_ITEM_TABLE: "order_items",
    CART_TABLE: "carts",
    USER_ADDRESS_TABLE: "user_addresses",
    INVENTORY_TABLE: "inventories",
    CATEGORY_TABLE: "categories",
    SUB_CATEGORY_TABLE: "sub_categories",
    CONTACT_INQUIRY_TABLE: "contact_inquiries",
    QUERY_TABLE: "queries",
    PRODUCT_INQUIRY_TABLE: "product_inquiries",
    BLOG_TABLE: "blogs",
    SERVICE_TABLE: "services",
    SERVICE_TRANSLATION_TABLE: "service_translations",
    // Admin-managed option lists for the service form (Format and Family / topic).
    SERVICE_FORMAT_TABLE: "service_formats",
    SERVICE_FAMILY_TOPIC_TABLE: "service_family_topics",
  },
  // Languages the website publishes. "en" is the default and the fallback
  // when a service has no translation for the requested locale.
  locales: ["en", "hi"],
  defaultLocale: "en",
  bcrypt: {
    SALT_ROUNDS: 10,
  },
  time: {
    // TOKEN_EXPIRES_IN: 1000 * 10, // 15 * 1 minute = 15 minutes
    TOKEN_EXPIRES_IN: 1000 * 60 * 15, // 15 * 1 minute = 15 minutes
    REFRESH_TOKEN_EXPIRES_IN: 1000 * 60 * 60 * 24 * 1, // 1 day
  },
  rateLimit: {
    max_rate_limit: 1000,
    time_window: "1 minute",
  },
};

export default constants;
