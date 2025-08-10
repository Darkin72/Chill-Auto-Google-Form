// api endpoint
const api_endpoint = "http://localhost:8000/submit-link";

/**
 * Gửi POST JSON với timeout.
 * @param {string} link
 * @param {number} timeoutMs  Thời gian timeout (ms)
 * @returns {Promise<{ok:true, data:any} | {ok:false, kind:'HTTP'|'NETWORK'|'TIMEOUT', status?:number, message:string}>}
 */
export default async function apiRequest(link, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log("Starting post");
    const resp = await fetch(api_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: link }),
      signal: controller.signal,
    });
    clearTimeout(timer);

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
    clearTimeout(timer);
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
