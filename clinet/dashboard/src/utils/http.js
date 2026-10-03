import { handleLogout } from "@/providers/auth-provider";
import axios from "axios";

const API_ROOT = process.env.NEXT_PUBLIC_API_URL;
let tokenRefreshPromise = null;

const http = (headerType = "json", baseURL = API_ROOT) => {
  // Create the axios instance
  const client = axios.create({
    baseURL: baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true, // Send cookies for cross-origin
  });

  // Request interceptor to add token from localStorage if available
  client.interceptors.request.use(
    (config) => {
      // Get token from localStorage (set by refresh-token endpoint)
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  client.interceptors.response.use(handleSuccess, handleError);

  function handleSuccess(response) {
    return response;
  }

  async function handleError(error) {
    const originalRequest = error.config;
    // Only retry on 401 (unauthorized - token expired)
    // and only once per request
    if (error.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Prevent multiple simultaneous refresh requests
        if (!tokenRefreshPromise) {
          tokenRefreshPromise = axios.post(
            "/api/refresh-token",
            {},
            { withCredentials: true },
          );
        }

        const response = await tokenRefreshPromise;
        tokenRefreshPromise = null;

        if (response.status === 200 && response.data.token) {
          const newToken = response.data.token;

          // Store token in localStorage
          localStorage.setItem("token", newToken);

          // Update header for retry
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Retry the original request
          return client(originalRequest);
        } else {
          handleLogout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        tokenRefreshPromise = null;
        handleLogout();
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }

  async function get(path) {
    return client.get(path).then((response) => response.data);
  }

  async function getFull(path, config = {}) {
    return client.get(path, config);
  }

  async function post(path, payload, isFormData = false) {
    let config = {};
    if (isFormData) {
      config.headers = { "Content-Type": "multipart/form-data" };
    }
    return client.post(path, payload, config).then((response) => response.data);
  }

  async function put(path, payload, isFormData = false) {
    let config = {};
    if (isFormData) {
      config.headers = { "Content-Type": "multipart/form-data" };
    }
    return client.put(path, payload, config).then((response) => response.data);
  }

  async function patch(path, payload) {
    return client.patch(path, payload).then((response) => response.data);
  }

  async function _delete(path, data) {
    if (data) {
      return client
        .delete(path, { data: data })
        .then((response) => response?.data);
    }
    return client.delete(path).then((response) => response.data);
  }

  return {
    get,
    getFull,
    post,
    put,
    patch,
    delete: _delete,
  };
};

export default http;
