// Remembers order IDs placed from this browser so the Orders page can list them.
const KEY = "shopzen_orders_v1";

export function getOrderIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

export function saveOrderId(id) {
  try {
    const ids = [id, ...getOrderIds().filter((x) => x !== id)].slice(0, 20);
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable - ignore */
  }
}
