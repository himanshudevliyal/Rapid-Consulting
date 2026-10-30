import { createHmac, timingSafeEqual } from "node:crypto";
import config from "../config/index.js";

// Preview links for draft site pages. A token says "this page, until this
// time" and is signed with the server's JWT secret - nothing is stored, and a
// token for one page is useless for another.
//
//   token = base64url("<pageId>.<expiresAtMs>") + "." + base64url(HMAC-SHA256)

export const PREVIEW_TTL_MS = 30 * 60 * 1000;

const b64 = (input) => Buffer.from(input).toString("base64url");

const sign = (payload) => {
  if (!config.jwt_secret) throw new Error("JWT_SECRET is not configured");
  return createHmac("sha256", `${config.jwt_secret}:site-page-preview`).update(payload).digest("base64url");
};

export const createPreviewToken = (pageId, now = Date.now()) => {
  const expires = now + PREVIEW_TTL_MS;
  const payload = b64(`${pageId}.${expires}`);
  return { token: `${payload}.${sign(payload)}`, expires_at: new Date(expires).toISOString() };
};

// true only for an untampered, unexpired token that was made for this page.
export const verifyPreviewToken = (token, pageId, now = Date.now()) => {
  try {
    if (typeof token !== "string") return false;
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra !== undefined) return false;

    const expected = Buffer.from(sign(payload));
    const given = Buffer.from(signature);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;

    const [id, expires] = Buffer.from(payload, "base64url").toString("utf8").split(".");
    return id === pageId && Number(expires) > now;
  } catch {
    return false;
  }
};
