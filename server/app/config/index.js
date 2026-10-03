"use strict";
import "dotenv/config";

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.PORT = process.env.PORT || 3001;

const config = {
  port: parseInt(process.env.PORT, 10),
  site_url: process.env.SITE_URL,
  // postgres creds
  // PG_DATABASE_NAME is the name used in the Rapid .env; PG_DATABASE is still
  // read for older deployments.
  pg_database: process.env.PG_DATABASE_NAME || process.env.PG_DATABASE,
  pg_username: process.env.PG_USERNAME,
  pg_password: process.env.PG_PASSWORD,
  pg_host: process.env.PG_HOST || "localhost",
  pg_dialect: process.env.DB_DIALECT,

  // jwt secret key
  jwt_secret: process.env.JWT_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,

  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [],

  // smtp / brevo
  smtp_from_email: process.env.SMTP_EMAIL,
  smtp_port: parseInt(process.env.SMTP_PORT) || 587,
  // SMTP_SERVER (Brevo host) takes priority; fall back to legacy SMTP_HOST
  smtp_host: process.env.SMTP_SERVER || process.env.SMTP_HOST || "smtp-relay.brevo.com",
  smtp_user: process.env.BREVO_EMAIL || process.env.SMTP_USER,
  smtp_password: process.env.BREVO_SMTP_KEY || process.env.SMTP_PASSWORD,
  // Explicit aliases for Brevo credentials
  brevo_email: process.env.BREVO_EMAIL,
  brevo_smtp_key: process.env.BREVO_SMTP_KEY,
  smtp_server: process.env.SMTP_SERVER,
  // Notification addresses
  email_from: process.env.EMAIL_FROM || "Rapid Consulting <info@rapidconsulting.in>",
  email_enquiry_to: process.env.EMAIL_ENQUIRY_TO || "info@rapidconsulting.in",
  admin_url: process.env.ADMIN_URL || "http://localhost:3001",

  // payu
  payu_merchant_key: process.env.PAYU_MERCHANT_KEY,
  payu_merchant_salt: process.env.PAYU_MERCHANT_SALT,
  payu_env: process.env.PAYU_ENV,

  // Optional: the website's on-demand revalidation endpoint, called after a
  // service is created/updated/deleted so pages refresh immediately.
  website_revalidate_url: process.env.WEBSITE_REVALIDATE_URL,
  website_revalidate_secret: process.env.WEBSITE_REVALIDATE_SECRET,

  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
};

export default config;
