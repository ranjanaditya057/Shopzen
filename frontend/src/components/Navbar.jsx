import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { CartIcon, CloseIcon, HeartIcon, MenuIcon, PackageIcon, SearchIcon } from "./Icons";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/products", label: "Shop" },
  { to: "/orders", label: "Orders" },
];

function Badge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent-400 px-1 text-[11px] font-bold text-slate-900">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Navbar() {
  const { count, openDrawer } = useCart();
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Keep the search box in sync with the URL, and close the mobile menu on navigation
  useEffect(() => {
    const q = location.pathname === "/products" ? new URLSearchParams(location.search).get("q") || "" : "";
    setQuery(q);
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const SearchBox = ({ className = "" }) => (
    <form onSubmit={submit} role="search" className={`relative ${className}`}>
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, brands, categories..."
        aria-label="Search products"
        className="input rounded-full bg-slate-100 !pl-10 hover:bg-slate-50 focus:bg-white"
      />
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="bg-slate-900 py-1.5 text-center text-xs font-medium text-slate-200">
        Free shipping on orders over $100 · Use code <span className="font-bold text-accent-300">WELCOME10</span> for 10% off
      </div>

      <div className="container-page flex h-16 items-center gap-4">
        <button
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg text-white">🛍️</span>
          <span className="hidden sm:inline">
            Shop<span className="text-brand-600">Zen</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="mx-2 hidden max-w-md flex-1 md:block">{SearchBox({})}</div>

        <div className="ml-auto flex items-center gap-1">
          <Link to="/orders" className="relative rounded-lg p-2.5 text-slate-700 hover:bg-slate-100 md:hidden" aria-label="Orders">
            <PackageIcon className="h-6 w-6" />
          </Link>
          <Link to="/wishlist" className="relative rounded-lg p-2.5 text-slate-700 hover:bg-slate-100" aria-label={`Wishlist (${wishlist.count})`}>
            <HeartIcon className="h-6 w-6" />
            <Badge count={wishlist.count} />
          </Link>
          <button onClick={openDrawer} className="relative rounded-lg p-2.5 text-slate-700 hover:bg-slate-100" aria-label={`Open cart (${count} items)`}>
            <CartIcon className="h-6 w-6" />
            <Badge count={count} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="animate-fade-in border-t border-slate-200 bg-white md:hidden">
          <div className="container-page space-y-3 py-4">
            {SearchBox({})}
            <nav className="flex flex-col" aria-label="Mobile">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                  {l.label}
                </NavLink>
              ))}
              <NavLink to="/wishlist" className={linkClass}>
                Wishlist
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
