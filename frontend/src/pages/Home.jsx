import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { useToast } from "../context/ToastContext";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import { ErrorMessage } from "../components/EmptyState";
import { ArrowRightIcon, HeadsetIcon, RefreshIcon, ShieldIcon, TruckIcon } from "../components/Icons";

const perks = [
  { icon: TruckIcon, title: "Free shipping", text: "On all orders over $100" },
  { icon: RefreshIcon, title: "30-day returns", text: "Changed your mind? No problem" },
  { icon: ShieldIcon, title: "Secure checkout", text: "Your details stay protected" },
  { icon: HeadsetIcon, title: "Friendly support", text: "We are here 7 days a week" },
];

const heroTiles = [
  { emoji: "🎧", from: "#6366f1", to: "#8b5cf6", cls: "left-0 top-6 h-40 w-40 -rotate-6", delay: "0s" },
  { emoji: "👟", from: "#f43f5e", to: "#be123c", cls: "right-2 top-0 h-36 w-36 rotate-6", delay: "1.2s" },
  { emoji: "⌚", from: "#0ea5e9", to: "#2563eb", cls: "bottom-4 left-16 h-36 w-36 rotate-3", delay: "2.4s" },
  { emoji: "🎒", from: "#b45309", to: "#78350f", cls: "bottom-0 right-8 h-40 w-40 -rotate-3", delay: "3.6s" },
];

function ProductRow({ title, subtitle, params, link }) {
  const { data, loading, error } = useAsync(() => api.getProducts(params), [JSON.stringify(params)]);

  return (
    <section className="container-page mt-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
          <p className="mt-1 text-slate-500">{subtitle}</p>
        </div>
        <Link to={link} className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:underline sm:flex">
          View all <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
      {error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {loading && !data
            ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)
            : data.items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}

function Newsletter() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.subscribe(email);
      toast.success(res.message);
      setEmail("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="container-page mt-16">
      <div className="card overflow-hidden bg-gradient-to-br from-brand-50 to-white p-8 text-center sm:p-12">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Get 10% off your first order</h2>
        <p className="mx-auto mt-2 max-w-md text-slate-600">Join the list for new arrivals, member-only deals and the occasional surprise.</p>
        <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            className="input"
          />
          <button className="btn-primary shrink-0" disabled={busy}>
            {busy ? "Joining..." : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function Home() {
  const categories = useAsync(() => api.getCategories(), []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container-page relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-brand-200 ring-1 ring-white/15">
              New season · Up to 30% off
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] !text-white sm:text-5xl lg:text-6xl">
              Everyday things, <span className="text-brand-400">made better.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-300">
              Thoughtfully chosen electronics, fashion, home and sports gear, delivered to your door with free shipping over $100.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary !px-6 !py-3 text-base">
                Shop now <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link to="/products?sort=discount" className="btn !px-6 !py-3 text-base text-white ring-1 ring-white/25 hover:bg-white/10">
                See deals
              </Link>
            </div>
          </div>

          <div className="relative mx-auto hidden h-[22rem] w-full max-w-md md:block" aria-hidden="true">
            {heroTiles.map((t) => (
              <div
                key={t.emoji}
                className={`absolute flex animate-float items-center justify-center rounded-3xl text-6xl shadow-2xl ring-1 ring-white/20 ${t.cls}`}
                style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})`, animationDelay: t.delay }}
              >
                {t.emoji}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="container-page -mt-8 relative z-10">
        <div className="card grid grid-cols-2 gap-6 p-6 lg:grid-cols-4">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-bold">{title}</p>
                <p className="text-xs text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page mt-16">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Shop by category</h2>
        <p className="mt-1 text-slate-500">Find exactly what you are looking for.</p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {(categories.data || Array.from({ length: 4 }, (_, i) => ({ name: i, skeleton: true }))).map((c) =>
            c.skeleton ? (
              <div key={c.name} className="h-40 animate-pulse rounded-2xl bg-slate-200" />
            ) : (
              <Link
                key={c.name}
                to={`/products?category=${encodeURIComponent(c.name)}`}
                className="group card flex flex-col items-start justify-between p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-3xl transition group-hover:scale-110">{c.emoji}</span>
                <div className="mt-6">
                  <p className="text-lg font-bold">{c.name}</p>
                  <p className="text-sm text-slate-500">{c.blurb}</p>
                  <p className="mt-2 text-xs font-semibold text-brand-700">{c.count} products</p>
                </div>
              </Link>
            )
          )}
        </div>
      </section>

      <ProductRow title="Featured products" subtitle="Hand-picked favourites our customers love." params={{ featured: "true", limit: 4 }} link="/products" />

      {/* Promo banner */}
      <section className="container-page mt-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 to-brand-500 px-8 py-12 text-white sm:px-14">
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 right-32 h-48 w-48 rounded-full bg-white/10" />
          <div className="relative max-w-xl">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-100">Limited time</p>
            <h2 className="mt-2 text-3xl font-extrabold !text-white sm:text-4xl">Take 10% off with code WELCOME10</h2>
            <p className="mt-3 text-brand-50">Apply it in your cart. Spend $150 or more and use SAVE20 for 20% off instead.</p>
            <Link to="/products?sort=discount" className="btn mt-6 bg-white text-brand-800 hover:bg-brand-50">
              Browse deals
            </Link>
          </div>
        </div>
      </section>

      <ProductRow title="Top rated" subtitle="The highest-rated products in the store." params={{ sort: "rating", limit: 4 }} link="/products?sort=rating" />

      <Newsletter />
    </>
  );
}
