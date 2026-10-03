"use strict";

// Template registry — lists all templates and their required fields.
// Used for validation (missing field = fail fast before sending).
const templates = {
  invitation: {
    // inviter_name: "Vishal",
    organization_name: "Acme Inc",
    role: "admin",
    invite_url: "http://localhost:3000/invite/abc123",
    expires_at: "20 Mar 2026",
  },
  "forgot-password": {
    resetLink: "http://localhost:3000/reset-password?t=TOKEN",
  },
  "forgot-username": {
    resetLink: "http://localhost:3000/reset-username?t=TOKEN",
  },
  // ── Rapid Consulting ──────────────────────────────────────────
  "enquiry-notification": {
    name: "Test User",
    phone: "9999999999",
    admin_url: "http://localhost:3001",
  },
  "enquiry-confirmation": {
    name: "Test User",
    phone: "9999999999",
  },
};

/**
 * Returns the mock/default data for a template key.
 * Used for development previews; the actual payload is passed at send time.
 */
export function getTemplateData(templateKey) {
  if (!templates[templateKey]) {
    throw new Error(
      `Unknown email template: "${templateKey}". Register it in app/utils/get-template-data.js`,
    );
  }
  return templates[templateKey];
}

/**
 * Validates that all required fields for a template are present in data.
 * Optional fields (email, location, subject, requirement, page_title, source)
 * are not enforced here — they are guarded inside the EJS templates with <%if%>.
 */
export function validateTemplateData(templateKey, data) {
  const schema = templates[templateKey];
  if (!schema) return; // already caught by getTemplateData

  const required = Object.keys(schema);
  const missing = required.filter(
    (key) => data[key] === undefined || data[key] === null,
  );

  if (missing.length) {
    throw new Error(
      `Email template "${templateKey}" is missing required fields: ${missing.join(", ")}`,
    );
  }
}
