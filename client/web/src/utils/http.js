import axios from "axios";
import config from "@/config";

/**
 * API client (axios on fetch).
 *
 * Server components pass Next.js cache options per request:
 *   http().get("/services?locale=en", { next: { revalidate: 300, tags: ["services"] } })
 * They reach Next's fetch, so pages are cached and POST /api/revalidate can
 * refresh them the moment an editor saves in the admin panel.
 */
const http = (baseURL = config.api_base) => {
  const client = axios.create({
    baseURL,
    adapter: "fetch",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const request = (method, path, { next, cache, ...options } = {}) =>
    client
      .request({ method, url: path, ...options, fetchOptions: { next, cache } })
      .then((response) => response.data);

  return {
    get: (path, options) => request("get", path, options),
    post: (path, data, options) => request("post", path, { ...options, data }),
    put: (path, data, options) => request("put", path, { ...options, data }),
    patch: (path, data, options) => request("patch", path, { ...options, data }),
    delete: (path, options) => request("delete", path, options),
  };
};

export const isNotFound = (error) => error?.response?.status === 404;

export default http;
