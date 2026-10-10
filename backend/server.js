const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { products, categories, coupons, reviewPool } = require("./data");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* ------------------------------------------------------------------ */
/* Pricing rules (mirrored in frontend/src/utils/pricing.js)           */
/* ------------------------------------------------------------------ */
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING = 9.99;
const TAX_RATE = 0.08;

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function evaluateCoupon(code, subtotal) {
  if (!code) return { coupon: null };
  const coupon = coupons[String(code).trim().toUpperCase()];
  if (!coupon) return { coupon: null, error: "That coupon code is not valid." };
  if (subtotal < coupon.minSubtotal) {
    return {
      coupon: null,
      error: `This code needs a minimum order of $${coupon.minSubtotal.toFixed(2)}.`,
    };
  }
  return { coupon };
}

function calcTotals(subtotal, coupon) {
  let discount = 0;
  let freeShip = false;
  if (coupon) {
    if (coupon.type === "percent") discount = round2((subtotal * coupon.value) / 100);
    if (coupon.type === "shipping") freeShip = true;
  }
  const discounted = round2(subtotal - discount);
  const shipping = subtotal === 0 || freeShip || discounted >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const tax = round2(discounted * TAX_RATE);
  const total = round2(discounted + shipping + tax);
  return { subtotal: round2(subtotal), discount, shipping, tax, total };
}

/**
 * Turns [{id, qty}] from the client into authoritative lines using server prices
 * and stock, and reports anything that had to be adjusted.
 */
function buildLines(rawItems) {
  const lines = [];
  const issues = [];
  if (!Array.isArray(rawItems)) return { lines, issues: ["Cart items are missing."] };

  for (const raw of rawItems) {
    const id = Number(raw && raw.id);
    let qty = Math.floor(Number(raw && raw.qty));
    const product = products.find((p) => p.id === id);

    if (!product) {
      issues.push({ id, type: "removed", message: "A product in your cart is no longer available." });
      continue;
    }
    if (!Number.isFinite(qty) || qty < 1) qty = 1;

    if (product.stock === 0) {
      issues.push({ id, type: "out_of_stock", message: `${product.name} is out of stock and was removed.` });
      continue;
    }
    if (qty > product.stock) {
      issues.push({ id, type: "qty_adjusted", message: `Only ${product.stock} of ${product.name} left; quantity updated.` });
      qty = product.stock;
    }
    if (typeof raw.price === "number" && round2(raw.price) !== product.price) {
      issues.push({ id, type: "price_changed", message: `The price of ${product.name} has changed to $${product.price.toFixed(2)}.` });
    }

    lines.push({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      qty,
      stock: product.stock,
      emoji: product.emoji,
      color: product.color,
      image: (product.images && product.images[0]) || null,
      lineTotal: round2(product.price * qty),
    });
  }
  return { lines, issues };
}

function reviewsFor(product) {
  const start = (product.id * 3) % reviewPool.length;
  return Array.from({ length: 4 }, (_, i) => reviewPool[(start + i) % reviewPool.length]);
}

/* ------------------------------------------------------------------ */
/* In-memory stores                                                    */
/* ------------------------------------------------------------------ */
const orders = new Map();
const subscribers = new Set();

function newOrderId() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORD-${Date.now().toString(36).toUpperCase()}${rand}`;
}

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/categories", (req, res) => {
  res.json(
    categories.map((c) => ({ ...c, count: products.filter((p) => p.category === c.name).length }))
  );
});

// GET /api/products?q=&category=&minPrice=&maxPrice=&rating=&sort=&page=&limit=&featured=&ids=
app.get("/api/products", (req, res) => {
  const { q = "", category = "", minPrice, maxPrice, rating, sort = "featured", featured, ids } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 8));

  let list = [...products];

  if (ids) {
    const wanted = String(ids).split(",").map(Number);
    list = list.filter((p) => wanted.includes(p.id));
  }
  const term = String(q).trim().toLowerCase();
  if (term) {
    list = list.filter((p) =>
      [p.name, p.brand, p.category, p.description].join(" ").toLowerCase().includes(term)
    );
  }
  if (category && category !== "all") {
    list = list.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
  }
  if (minPrice !== undefined && minPrice !== "") list = list.filter((p) => p.price >= Number(minPrice));
  if (maxPrice !== undefined && maxPrice !== "") list = list.filter((p) => p.price <= Number(maxPrice));
  if (rating) list = list.filter((p) => p.rating >= Number(rating));
  if (featured === "true") list = list.filter((p) => p.featured);

  const discount = (p) => (p.originalPrice ? 1 - p.price / p.originalPrice : 0);
  const sorters = {
    featured: (a, b) => Number(b.featured) - Number(a.featured) || b.reviewCount - a.reviewCount,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
    newest: (a, b) => b.id - a.id,
    discount: (a, b) => discount(b) - discount(a),
  };
  list.sort(sorters[sort] || sorters.featured);

  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const items = list.slice((page - 1) * limit, page * limit);

  res.json({ items, total, page, pages, limit });
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found." });

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  res.json({ product, related, reviews: reviewsFor(product) });
});

// Re-prices a cart with the server's data (protects against stale/tampered localStorage)
app.post("/api/cart/validate", (req, res) => {
  const { items, coupon: code } = req.body || {};
  const { lines, issues } = buildLines(items);
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const { coupon, error } = evaluateCoupon(code, subtotal);
  res.json({
    lines,
    issues,
    coupon,
    couponError: error || null,
    totals: calcTotals(subtotal, coupon),
  });
});

app.post("/api/coupons/validate", (req, res) => {
  const { code, subtotal = 0 } = req.body || {};
  if (!code) return res.status(400).json({ error: "Enter a coupon code." });
  const { coupon, error } = evaluateCoupon(code, Number(subtotal) || 0);
  if (error) return res.status(400).json({ error });
  res.json({ coupon });
});

app.post("/api/orders", (req, res) => {
  const { items, customer = {}, payment, coupon: code } = req.body || {};

  const errors = {};
  const required = ["name", "email", "phone", "address", "city", "zip"];
  required.forEach((field) => {
    if (!String(customer[field] || "").trim()) errors[field] = "This field is required.";
  });
  if (customer.email && !/^\S+@\S+\.\S+$/.test(customer.email)) errors.email = "Enter a valid email address.";
  if (!["cod", "card"].includes(payment)) errors.payment = "Choose a payment method.";
  if (Object.keys(errors).length) return res.status(400).json({ error: "Please check your details.", fields: errors });

  const { lines, issues } = buildLines(items);
  if (!lines.length) {
    // Nothing orderable left: a 409 (items changed) lets the checkout page re-sync; 400 means it was empty to begin with
    return issues.length
      ? res.status(409).json({ error: "Those items are no longer available. Please review your cart.", issues })
      : res.status(400).json({ error: "Your cart is empty.", issues });
  }

  // If stock changed under the customer, make them review rather than silently altering the order
  const blocking = issues.filter((i) => ["out_of_stock", "qty_adjusted", "removed"].includes(i.type));
  if (blocking.length) {
    return res.status(409).json({ error: "Some items changed while you were checking out. Please review your cart.", issues });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const { coupon } = evaluateCoupon(code, subtotal);
  const totals = calcTotals(subtotal, coupon);

  lines.forEach((l) => {
    const p = products.find((x) => x.id === l.id);
    p.stock -= l.qty;
  });

  const estimated = new Date();
  estimated.setDate(estimated.getDate() + 5);

  const order = {
    id: newOrderId(),
    status: "confirmed",
    createdAt: new Date().toISOString(),
    estimatedDelivery: estimated.toISOString(),
    customer: {
      name: String(customer.name).trim(),
      email: String(customer.email).trim(),
      phone: String(customer.phone).trim(),
      address: String(customer.address).trim(),
      city: String(customer.city).trim(),
      state: String(customer.state || "").trim(),
      zip: String(customer.zip).trim(),
    },
    payment,
    coupon: coupon ? coupon.code : null,
    items: lines,
    totals,
  };
  orders.set(order.id, order);
  res.status(201).json({ order });
});

app.get("/api/orders/:id", (req, res) => {
  const order = orders.get(String(req.params.id).toUpperCase());
  if (!order) return res.status(404).json({ error: "Order not found." });
  res.json({ order });
});

app.post("/api/newsletter", (req, res) => {
  const email = String((req.body && req.body.email) || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
  const already = subscribers.has(email);
  subscribers.add(email);
  res.status(already ? 200 : 201).json({ message: already ? "You are already subscribed." : "Thanks for subscribing!" });
});

/* ------------------------------------------------------------------ */
/* Optionally serve the built frontend (npm run build, then npm start) */
/* ------------------------------------------------------------------ */
const dist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use("/api", (req, res) => res.status(404).json({ error: "Endpoint not found." }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`ShopZen API running on http://localhost:${PORT}`));
}

module.exports = app;
