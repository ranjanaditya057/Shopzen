const BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw Object.assign(new Error("Cannot reach the server. Is the backend running?"), { status: 0 });
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) {
    throw Object.assign(new Error((data && data.error) || `Request failed (${res.status})`), {
      status: res.status,
      data,
    });
  }
  return data;
}

const toQuery = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
};

export const api = {
  getProducts: (params) => request(`/products${toQuery(params)}`),
  getProduct: (id) => request(`/products/${id}`),
  getCategories: () => request("/categories"),
  validateCart: (items, coupon) => request("/cart/validate", { method: "POST", body: { items, coupon } }),
  validateCoupon: (code, subtotal) => request("/coupons/validate", { method: "POST", body: { code, subtotal } }),
  createOrder: (payload) => request("/orders", { method: "POST", body: payload }),
  getOrder: (id) => request(`/orders/${encodeURIComponent(id)}`),
  subscribe: (email) => request("/newsletter", { method: "POST", body: { email } }),
};
