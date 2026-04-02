const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/$/, "");

const request = async (path, { method = "GET", token, body } = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response
    .json()
    .catch(() => ({ message: "Unexpected server response" }));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
};

const toQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

export const api = {
  login: (credentials) => request("/auth/login", { method: "POST", body: credentials }),
  signup: (payload, token) =>
    request("/auth/signup", { method: "POST", body: payload, token }),
  getCurrentUser: (token) => request("/auth/me", { token }),
  getProducts: (token) => request("/products", { token }),
  createProduct: (token, body) => request("/products", { method: "POST", token, body }),
  updateProduct: (token, productId, body) =>
    request(`/products/${productId}`, { method: "PUT", token, body }),
  deleteProduct: (token, productId) =>
    request(`/products/${productId}`, { method: "DELETE", token }),
  createDispatch: (token, body) =>
    request("/inventory/dispatches", { method: "POST", token, body }),
  createReturn: (token, body) =>
    request("/inventory/returns", { method: "POST", token, body }),
  getDashboard: (token) => request("/dashboard", { token }),
  getLogs: (token, params = {}) => request(`/logs${toQueryString(params)}`, { token })
};
