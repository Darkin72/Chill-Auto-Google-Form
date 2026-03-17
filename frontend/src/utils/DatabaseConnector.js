import { fetchWithTimeout } from "./FormExtractorAPI.js";

// API endpoint cho database
const api_endpoint = "http://localhost:8000";

/**
 * Lấy danh sách forms từ database với các tham số lọc
 * @param {string} title - Tiêu đề form
 * @param {string} link - Link form
 * @param {string} status - Trạng thái form
 * @param {string} createdAt - Thời gian tạo form
 * @param {number} limit - Số lượng bản ghi trả về (1-100)
 * @param {number} offset - Số bản ghi bỏ qua
 * @param {number} timeoutMs - Thời gian timeout (ms)
 * @returns {Promise<{ok:true, data:any} | {ok:false, kind:'HTTP'|'NETWORK'|'TIMEOUT', status?:number, message:string}>}
 */
export async function getForms({
  title = "",
  link = "",
  status = "",
  createdAt = "",
  limit = 10,
  offset = 0,
  timeoutMs = 8000,
} = {}) {
  try {
    // Tạo URL với query parameters
    const params = new URLSearchParams();
    if (title) params.append("title", title);
    if (link) params.append("link", link);
    if (status) params.append("status", status);
    if (createdAt) params.append("created_at", createdAt);
    params.append("limit", Math.min(Math.max(limit, 1), 100)); // Đảm bảo limit trong khoảng 1-100
    params.append("offset", Math.max(offset, 0)); // Đảm bảo offset >= 0

    const url = `${api_endpoint}/get-forms/?${params.toString()}`;
    console.log("Fetching forms from:", url);

    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      timeoutMs
    );

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);
    if (response.ok) {
      return { ok: true, data: body };
    }

    // Server trả về lỗi
    const message =
      (body && (body.detail || body.message || JSON.stringify(body))) ||
      response.statusText ||
      "HTTP error";
    return { ok: false, kind: "HTTP", status: response.status, message };
  } catch (err) {
    if (err?.name === "AbortError") {
      return { ok: false, kind: "TIMEOUT", message: "Request timed out" };
    }
    // Network/CORS/server down/DNS error
    return {
      ok: false,
      kind: "NETWORK",
      message: err?.message || "Network error",
    };
  }
}

/**
 * Đếm tổng số forms từ database với các tham số lọc
 * @param {string} title - Tiêu đề form
 * @param {string} link - Link form
 * @param {string} status - Trạng thái form
 * @param {string} createdAt - Thời gian tạo form
 * @param {number} timeoutMs - Thời gian timeout (ms)
 * @returns {Promise<{ok:true, data:number} | {ok:false, kind:'HTTP'|'NETWORK'|'TIMEOUT', status?:number, message:string}>}
 */
export async function countForms({
  title = "",
  link = "",
  status = "",
  createdAt = "",
  timeoutMs = 8000,
} = {}) {
  try {
    // Tạo URL với query parameters
    const params = new URLSearchParams();
    if (title) params.append("title", title);
    if (link) params.append("link", link);
    if (status) params.append("status", status);
    if (createdAt) params.append("created_at", createdAt);

    const url = `${api_endpoint}/get-count-forms/?${params.toString()}`;
    console.log("Counting forms from:", url);

    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      timeoutMs
    );

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);

    if (response.ok) {
      return { ok: true, data: body };
    }

    // Server trả về lỗi
    const message =
      (body && (body.detail || body.message || JSON.stringify(body))) ||
      response.statusText ||
      "HTTP error";
    return { ok: false, kind: "HTTP", status: response.status, message };
  } catch (err) {
    if (err?.name === "AbortError") {
      return { ok: false, kind: "TIMEOUT", message: "Request timed out" };
    }
    // Network/CORS/server down/DNS error
    return {
      ok: false,
      kind: "NETWORK",
      message: err?.message || "Network error",
    };
  }
}

/**
 * Xóa form theo ID
 * @param {string|number} formId - ID của form cần xóa
 * @param {number} timeoutMs - Thời gian timeout (ms)
 * @returns {Promise<{ok:true, data:any} | {ok:false, kind:'HTTP'|'NETWORK'|'TIMEOUT', status?:number, message:string}>}
 */
export async function deleteForm(formId, timeoutMs = 8000) {
  try {
    console.log("Deleting form with ID:", formId);

    const response = await fetchWithTimeout(
      `${api_endpoint}/delete-form/${formId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
      timeoutMs
    );

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);

    if (response.ok) {
      return { ok: true, data: body };
    }

    // Server trả về lỗi
    const message =
      (body && (body.detail || body.message || JSON.stringify(body))) ||
      response.statusText ||
      "HTTP error";
    return { ok: false, kind: "HTTP", status: response.status, message };
  } catch (err) {
    if (err?.name === "AbortError") {
      return { ok: false, kind: "TIMEOUT", message: "Request timed out" };
    }
    // Network/CORS/server down/DNS error
    return {
      ok: false,
      kind: "NETWORK",
      message: err?.message || "Network error",
    };
  }
}

/**
 * Lấy danh sách form queue từ database
 * @param {number} timeoutMs - Thời gian timeout (ms)
 * @returns {Promise<{ok:true, data:any} | {ok:false, kind:'HTTP'|'NETWORK'|'TIMEOUT', status?:number, message:string}>}
 */
export async function getFormQueue(timeoutMs = 8000) {
  try {
    const url = `${api_endpoint}/get-form-queue`;
    console.log("Fetching form queue from:", url);

    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      timeoutMs
    );

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);

    if (response.ok) {
      return { ok: true, data: body };
    }

    // Server trả về lỗi
    const message =
      (body && (body.detail || body.message || JSON.stringify(body))) ||
      response.statusText ||
      "HTTP error";
    return { ok: false, kind: "HTTP", status: response.status, message };
  } catch (err) {
    if (err?.name === "AbortError") {
      return { ok: false, kind: "TIMEOUT", message: "Request timed out" };
    }
    // Network/CORS/server down/DNS error
    return {
      ok: false,
      kind: "NETWORK",
      message: err?.message || "Network error",
    };
  }
}

/**
 * Hủy form đang xử lý
 * @param {string} formId - ID của form cần hủy
 * @param {number} timeoutMs - Thời gian timeout (ms)
 * @returns {Promise<{ok:true, data:any} | {ok:false, kind:'HTTP'|'NETWORK'|'TIMEOUT', status?:number, message:string}>}
 */
export async function cancelForm(formId, timeoutMs = 8000) {
  try {
    const url = `${api_endpoint}/cancel-form/${formId}`;
    console.log("Cancelling form:", url);

    const response = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      timeoutMs
    );

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);

    if (response.ok) {
      return { ok: true, data: body };
    }

    // Server trả về lỗi
    const message =
      (body && (body.detail || body.message || JSON.stringify(body))) ||
      response.statusText ||
      "HTTP error";
    return { ok: false, kind: "HTTP", status: response.status, message };
  } catch (err) {
    if (err?.name === "AbortError") {
      return { ok: false, kind: "TIMEOUT", message: "Request timed out" };
    }
    // Network/CORS/server down/DNS error
    return {
      ok: false,
      kind: "NETWORK",
      message: err?.message || "Network error",
    };
  }
}

