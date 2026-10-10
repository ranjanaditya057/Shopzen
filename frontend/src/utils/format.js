const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const formatPrice = (n) => currency.format(Number(n) || 0);

export const discountPercent = (price, original) =>
  original && original > price ? Math.round((1 - price / original) * 100) : 0;

export const formatDate = (iso, options = { year: "numeric", month: "short", day: "numeric" }) =>
  new Date(iso).toLocaleDateString("en-US", options);
