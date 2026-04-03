const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/$/, "");

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

export const api = {
  login: (credentials) => request("/auth/login", { method: "POST", body: credentials }),
  signup: (payload, token) =>
    request("/auth/signup", { method: "POST", body: payload, token }),
  me: (token) => request("/auth/me", { token }),
  getProducts: (token) => request("/products", { token }),
  createProduct: (token, body) => request("/products", { method: "POST", token, body }),
  updateProduct: (token, productId, body) =>
    request(`/products/${productId}`, { method: "PUT", token, body }),
  deleteProduct: (token, productId) =>
    request(`/products/${productId}`, { method: "DELETE", token }),
  getDashboard: (token) => request("/dashboard", { token }),
  createDispatch: (token, body) =>
    request("/inventory/dispatches", { method: "POST", token, body }),
  createReturn: (token, body) =>
    request("/inventory/returns", { method: "POST", token, body }),
  adjustInventory: (token, body) =>
    request("/inventory/adjustments", { method: "POST", token, body }),
  resetCompanyInventory: (token, body) =>
    request("/inventory/company-reset", { method: "POST", token, body })
};
