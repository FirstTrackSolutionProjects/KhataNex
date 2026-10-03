// Small fetch wrapper for the FIRST TRACK KHATANEX backend.
// Reads the API base URL from Vite's env (set VITE_API_BASE_URL in .env
// Reads the API base URL from Vite's env (set VITE_API_BASE_URL in .env
// locally and in Netlify's site settings for production).
// locally and in Netlify's site settings for production).
const BASE_URL = "http://localhost:5001";


const TOKEN_KEY = "khatanex_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * apiRequest — core request function. Pass a plain object body for JSON
 * requests, or a FormData instance for file uploads (Content-Type is left
 * unset so the browser adds the correct multipart boundary itself).
 */
async function apiRequest(path, { method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });
  } catch (networkErr) {
    throw new Error("Could not reach the server. Please check your connection and try again.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // non-JSON response (e.g. a raw file) — caller should not use apiRequest for those
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
    }
    const message = data?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => apiRequest(path, { method: "GET" }),
  post: (path, body) => apiRequest(path, { method: "POST", body }),
  patch: (path, body) => apiRequest(path, { method: "PATCH", body }),
  del: (path) => apiRequest(path, { method: "DELETE" }),
  delete: (path) => apiRequest(path, { method: "DELETE" }),
  postForm: (path, formData) => apiRequest(path, { method: "POST", body: formData, isFormData: true }),
  patchForm: (path, formData) => apiRequest(path, { method: "PATCH", body: formData, isFormData: true }),
};

export const fileUrl = (relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith("http")) return relativePath;
  return `${BASE_URL}${relativePath}`;
};

export default api;

export const secureFileUrl = (relativePath, userId = null) => {
  if (!relativePath) return null;
  if (relativePath.startsWith("http")) return relativePath;

  const params = new URLSearchParams({
    path: relativePath,
  });

  if (userId !== null && userId !== undefined) {
    params.set("user_id", String(userId));
  }

  return `${BASE_URL}/api/files?${params.toString()}`;
};

export const fetchSecureFile = async (relativePath, userId = null) => {
  if (!relativePath) throw new Error("File path is missing.");

  const token = getToken();
  if (!token) throw new Error("Not authenticated.");

  const params = new URLSearchParams({
    path: relativePath,
  });

  if (userId !== null && userId !== undefined) {
    params.set("user_id", String(userId));
  }

  let res;

  try {
    res = await fetch(
      `${BASE_URL}/api/files?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (networkErr) {
    throw new Error(
      "Could not reach the server. Please check your connection and try again."
    );
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
    }

    let message = `File request failed (${res.status})`;

    try {
      const data = await res.json();
      message = data?.message || message;
    } catch (_) {
      // Non-JSON error response.
    }

    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  const rawBlob = await res.blob();
  if (
    relativePath &&
    relativePath.toLowerCase().includes(".pdf") &&
    rawBlob.type !== "application/pdf"
  ) {
    return new Blob([rawBlob], { type: "application/pdf" });
  }

  return rawBlob;
};

export const secureFileObjectUrl = async (relativePath, userId = null) => {
  const blob = await fetchSecureFile(relativePath, userId);
  return URL.createObjectURL(blob);
};
