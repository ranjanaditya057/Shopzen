import { Link } from "react-router-dom";

const columns = [
  {
    title: "Shop",
    links: [
      { to: "/products", label: "All products" },
      { to: "/products?category=Electronics", label: "Electronics" },
      { to: "/products?category=Fashion", label: "Fashion" },
      { to: "/products?category=Home", label: "Home" },
      { to: "/products?category=Sports", label: "Sports" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/orders", label: "Track an order" },
      { to: "/wishlist", label: "Wishlist" },
      { to: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Help",
    links: [
      { to: "/", label: "Shipping & delivery" },
      { to: "/", label: "30-day returns" },
      { to: "/", label: "Contact us" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-slate-900 text-slate-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">🛍️</span>
            ShopZen
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            A simple demo store built with React, Tailwind CSS and a tiny Node API. Your cart lives in your browser.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">{col.title}</h3>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-slate-400 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} ShopZen. Demo project, no real payments are processed.
      </div>
    </footer>
  );
}
