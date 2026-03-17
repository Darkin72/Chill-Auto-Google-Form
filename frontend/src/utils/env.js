const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

const rawWsBaseUrl =
  import.meta.env.VITE_WS_BASE_URL || API_BASE_URL.replace(/^http/i, "ws");
const WS_BASE_URL = rawWsBaseUrl.replace(/\/+$/, "");

export { API_BASE_URL, WS_BASE_URL };
