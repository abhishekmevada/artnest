import axios from "axios";

/**
 * Global API Base URL
 * Reads from Vite environment variable `API_BASE_URL` or falls back to http://localhost:5000
 */
export const API_BASE_URL =
  import.meta.env.API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/**
 * Get current stored JWT authentication token
 */
export const getAuthToken = () => {
  try {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("accessToken") ||
      null
    );
  } catch {
    return null;
  }
};

/**
 * Get standard headers with Authorization token attached if available
 */
export const getAuthHeaders = (extraHeaders = {}) => {
  const token = getAuthToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
};

/**
 * Pre-configured Axios instance with:
 * - Default baseURL pointing to API_BASE_URL
 * - Request interceptor automatically attaching the Bearer token
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Helper wrapper for native window.fetch:
 * - Automatically prepends API_BASE_URL if a relative path (e.g. '/buyer/cart') is provided
 * - Automatically attaches Authorization Bearer token header if available
 */
export const fetchApi = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = getAuthHeaders(options.headers || {});

  return fetch(url, {
    ...options,
    headers,
  });
};

export default api;
