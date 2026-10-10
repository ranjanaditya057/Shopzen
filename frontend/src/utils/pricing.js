// Mirrors the rules in backend/server.js. The server is always the source of truth
// at checkout; this keeps the cart page instant and works even if the API is down.
export const FREE_SHIPPING_THRESHOLD = 100;
export const FLAT_SHIPPING = 9.99;
export const TAX_RATE = 0.08;

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calcTotals(items, coupon) {
  const subtotal = round2(items.reduce((sum, i) => sum + i.price * i.qty, 0));
  const couponApplies = coupon && subtotal >= (coupon.minSubtotal || 0);

  let discount = 0;
  let freeShip = false;
  if (couponApplies) {
    if (coupon.type === "percent") discount = round2((subtotal * coupon.value) / 100);
    if (coupon.type === "shipping") freeShip = true;
  }

  const discounted = round2(subtotal - discount);
  const shipping = subtotal === 0 || freeShip || discounted >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const tax = round2(discounted * TAX_RATE);
  const total = round2(discounted + shipping + tax);

  return { subtotal, discount, shipping, tax, total, couponApplies: Boolean(couponApplies) };
}
