// api endpoint
const api_endpoint = "http://localhost:8000/submit-link";

/**
 * Hàm chung để thực thi một Promise với timeout
 * @param {Promise} promise - Promise cần thực thi
 * @param {number} timeoutMs - Thời gian timeout (milliseconds)
 * @param {string} timeoutMessage - Thông báo lỗi khi timeout
 * @returns {Promise} - Promise với timeout
 */
export function withTimeout(
  promise,
  timeoutMs = 7000,
  timeoutMessage = "Operation timed out"
) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Hàm chung để thực thi fetch với timeout sử dụng AbortController
 * @param {string} url - URL để fetch
 * @param {object} options - Fetch options
 * @param {number} timeoutMs - Thời gian timeout (milliseconds)
 * @returns {Promise<Response>} - Promise với timeout
 */
export function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const fetchPromise = fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timer);
  });

  return fetchPromise;
}

/**
 * Gửi POST JSON với timeout.
 * @param {string} link
 * @param {number} timeoutMs  Thời gian timeout (ms)
 * @returns {Promise<{ok:true, data:any} | {ok:false, kind:'HTTP'|'NETWORK'|'TIMEOUT', status?:number, message:string}>}
 */
export default async function apiRequest(link, timeoutMs = 7000) {
  try {
    console.log("Starting post");
    const resp = await fetchWithTimeout(
      api_endpoint,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link }),
      },
      timeoutMs
    );

    const ct = resp.headers.get("content-type") || "";
    const body = ct.includes("application/json")
      ? await resp.json().catch(() => null)
      : await resp.text().catch(() => null);

    if (resp.ok) {
      return { ok: true, data: body };
    }
    // Kết nối được nhưng server trả lỗi (ví dụ link sai/validation fail)
    const message =
      (body && (body.detail || body.message || JSON.stringify(body))) ||
      resp.statusText ||
      "HTTP error";
    return { ok: false, kind: "HTTP", status: resp.status, message };
  } catch (err) {
    if (err?.name === "AbortError") {
      return { ok: false, kind: "TIMEOUT", message: "Request timed out" };
    }
    // Network/CORS/server down/DNS…
    return {
      ok: false,
      kind: "NETWORK",
      message: err?.message || "Network error",
    };
  }
}
