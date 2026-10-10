# ShopZen - basic e-commerce store

React + Tailwind CSS frontend, Node/Express backend. **No database**: the backend keeps products/orders in memory, and the cart, wishlist and order history IDs are stored in the browser's `localStorage`.

## Quick start

```bash
npm run install:all     # installs root, backend and frontend dependencies
npm run dev             # API on :5000, web app on http://localhost:5173
```

Run the two parts separately if you prefer:

```bash
cd backend  && npm install && npm run dev     # http://localhost:5000
cd frontend && npm install && npm run dev     # http://localhost:5173 (proxies /api to :5000)
```

**Single-server production mode**

```bash
npm run build           # builds frontend/dist
npm start               # Express serves the API and the built site on :5000
```

## Features

**Frontend**
- Home: hero, perks strip, category tiles, featured and top-rated rows, promo banner, newsletter signup
- Shop: search, category / price / rating filters (kept in the URL), 6 sort options, pagination, filter chips, loading skeletons, empty and error states
- Product page: gallery, breadcrumbs, price + discount, stock status, quantity picker, Add to cart / Buy now, wishlist, tabs (description, specs, reviews), related products
- Cart drawer (opens from the navbar) and full cart page: quantity controls respecting stock, remove / clear, free-shipping progress bar, promo codes, order summary
- Checkout: validated contact / shipping / payment form (cash on delivery or demo card), server re-pricing on arrival, stock/price change warnings, order summary
- Order confirmation page, "My orders" page with order-number lookup
- Wishlist page, toast notifications, responsive navbar with mobile menu, 404 page

**Backend** (`backend/server.js`)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/products` | List with `q, category, minPrice, maxPrice, rating, sort, page, limit, featured, ids` |
| GET | `/api/products/:id` | Product + related products + sample reviews |
| GET | `/api/categories` | Categories with product counts |
| POST | `/api/cart/validate` | Re-prices a cart with server data (fixes stale prices/stock) |
| POST | `/api/coupons/validate` | Checks a promo code |
| POST | `/api/orders` | Validates and creates an order, decrements stock |
| GET | `/api/orders/:id` | Fetch an order |
| POST | `/api/newsletter` | Subscribe an email |
| GET | `/api/health` | Health check |

Demo promo codes: `WELCOME10` (10% off), `FREESHIP` (free shipping), `SAVE20` (20% off orders of $150+).
Pricing: free shipping at $100+ (otherwise $9.99), 8% tax.

## localStorage keys

| Key | Contents |
| --- | --- |
| `shopzen_cart_v1` | Cart items (id, name, price, qty, stock, ...) and applied coupon |
| `shopzen_wishlist_v1` | Array of product IDs |
| `shopzen_orders_v1` | Order IDs placed from this browser |

The cart syncs across browser tabs. Because prices in localStorage can go stale (or be edited), the server re-prices the cart at checkout and again when the order is created.

## Project structure

```
ecommerce-app/
├── backend/
│   ├── server.js        # Express routes + pricing rules
│   └── data.js          # in-memory products, categories, coupons
└── frontend/src/
    ├── api/client.js    # fetch wrapper
    ├── context/         # Cart (localStorage), Wishlist, Toast
    ├── components/      # Navbar, CartDrawer, ProductCard, FilterSidebar, ...
    ├── pages/           # Home, Products, ProductDetail, Cart, Checkout, ...
    └── utils/           # pricing, formatting, order history
```

## Customising

- **Theme**: change `brand` / `accent` in `frontend/tailwind.config.js`.
- **Products**: edit `backend/data.js`. Products render as gradient + emoji tiles by default; add `images: ["https://..."]` to a product to use real photos.
- **Currency**: `frontend/src/utils/format.js` (and the `$` text in `backend/server.js` coupon messages).

## Notes

This is a demo. Orders and stock reset when the server restarts, there are no user accounts, and card details are validated in the browser only (never sent anywhere). For a real store you would add authentication, a database, and a payment provider such as Stripe.
