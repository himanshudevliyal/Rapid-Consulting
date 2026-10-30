// The CRM login link in the top strip. The real URL is not part of the
// website's code or content, so it is read from NEXT_PUBLIC_CRM_LOGIN_URL and
// the link is hidden when that variable is unset (or is not an https URL).
// The expression must stay literal so the build can inline it.
function safeHttps(value) {
  try {
    const url = new URL((value ?? "").trim());
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

export const CRM_LOGIN_URL = safeHttps(process.env.NEXT_PUBLIC_CRM_LOGIN_URL);
