"use strict";
import axios from "axios";
import config from "../config/index.js";

// Tell the website to refresh what it cached for one kind of content
// (tag: "articles" | "case-studies" | "schemes"). A failure never fails the
// admin request; pages also refresh on the website's own revalidate interval.
export const notifyWebsite = (tag, slugs = []) => {
  if (!config.website_revalidate_url) return;
  axios
    .post(
      config.website_revalidate_url,
      { tag, slugs: [...new Set(slugs.filter(Boolean))] },
      { headers: { "x-revalidate-secret": config.website_revalidate_secret } },
    )
    .catch((error) =>
      console.error(`Website revalidation (${tag}) failed:`, error.message),
    );
};
