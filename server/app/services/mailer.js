"use strict";
import nodemailer from "nodemailer";
import config from "../config/index.js";
import { renderEmail } from "../utils/render-mail.js";

// ── Transport (lazy singleton) ────────────────────────────────────
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: config.smtp_host,   // SMTP_SERVER or smtp-relay.brevo.com
    port: config.smtp_port,   // SMTP_PORT or 587
    secure: false,
    auth: {
      user: config.smtp_user, // BREVO_EMAIL
      pass: config.smtp_password, // BREVO_SMTP_KEY or SMTP_PASSWORD
    },
  });

  return _transporter;
}

const FROM = config.email_from; // "Rapid Consulting <info@rapidconsulting.in>"

// ── Generic send ─────────────────────────────────────────────────

/**
 * Send a templated email.
 * templateKey must match a file in app/views/emails/<key>.ejs
 */
export async function sendEmail({ to, templateKey, payload, subject }) {
  if (process.env.NODE_ENV === "development") {
    console.log("📧 Email skipped (dev):", { to, subject, payload });
    return;
  }

  const html = await renderEmail(templateKey, payload);
  return getTransporter().sendMail({ from: FROM, to, subject, html });
}

// ── Enquiry emails ────────────────────────────────────────────────

/**
 * Admin notification: new enquiry received.
 */
export async function sendEnquiryEmail(enquiry) {
  const to = config.email_enquiry_to;

  try {
    const html = await renderEmail("enquiry-notification", {
      ...enquiry,
      admin_url: config.admin_url,
    });

    await getTransporter().sendMail({
      from: FROM,
      to,
      subject: `New Enquiry from ${enquiry.name} — Rapid Consulting`,
      html,
    });
  } catch (err) {
    console.error("[Mailer] Failed to send enquiry notification:", err.message);
    // Non-fatal — enquiry is already saved to DB
  }
}

/**
 * Auto-reply confirmation to the user who submitted the enquiry.
 * Only sent when enquiry.email is present.
 */
export async function sendEnquiryConfirmation(enquiry) {
  if (!enquiry.email) return;

  try {
    const html = await renderEmail("enquiry-confirmation", enquiry);

    await getTransporter().sendMail({
      from: FROM,
      to: enquiry.email,
      subject: "We received your enquiry — Rapid Consulting",
      html,
    });
  } catch (err) {
    console.error("[Mailer] Failed to send enquiry confirmation:", err.message);
  }
}

// ── Auth emails ───────────────────────────────────────────────────

export async function sendResetPasswordEmail(userEmail, token) {
  const resetLink = `${config.site_url || ""}/reset-password?t=${token}`;

  try {
    const html = await renderEmail("forgot-password", { resetLink });

    await getTransporter().sendMail({
      from: FROM,
      to: userEmail,
      subject: "Reset Your Password — Rapid Consulting",
      html,
    });
  } catch (err) {
    console.error("[Mailer] Failed to send password reset email:", err.message);
    throw err;
  }
}

export async function sendResetUsernameEmail(userEmail, token) {
  const resetLink = `${config.site_url || ""}/reset-username?t=${token}`;

  try {
    const html = await renderEmail("forgot-username", { resetLink });

    await getTransporter().sendMail({
      from: FROM,
      to: userEmail,
      subject: "Reset Your Username — Rapid Consulting",
      html,
    });
  } catch (err) {
    console.error("[Mailer] Failed to send username reset email:", err.message);
    throw err;
  }
}

/** Quick smoke-test helper (call from a test route or script). */
export async function sendSampleMail(to) {
  const info = await getTransporter().sendMail({
    from: FROM,
    to,
    subject: "Test email — Rapid Consulting",
    text: "If you received this, your SMTP config is working.",
  });
  console.log("Sample email sent:", info.messageId);
}
