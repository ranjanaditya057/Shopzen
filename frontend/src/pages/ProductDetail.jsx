import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import ProductImage from "../components/ProductImage";
import ProductCard from "../components/ProductCard";
import QuantitySelector from "../components/QuantitySelector";
import Rating from "../components/Rating";
import EmptyState, { ErrorMessage } from "../components/EmptyState";
import { CheckIcon, ChevronRightIcon, HeartIcon, RefreshIcon, TruckIcon } from "../components/Icons";
import { discountPercent, formatDate, formatPrice } from "../utils/format";

const TABS = ["Description", "Specifications", "Reviews"];

function DetailSkeleton() {
  return (
    <div className="container-page grid animate-pulse gap-10 py-10 lg:grid-cols-2">
      <div className="aspect-square rounded-3xl bg-slate-200" />
      <div className="space-y-4">
        <div className="h-4 w-1/4 rounded bg-slate-200" />
        <div className="h-10 w-3/4 rounded bg-slate-200" />
        <div className="h-5 w-1/3 rounded bg-slate-200" />
        <div className="h-24 rounded bg-slate-200" />
        <div className="h-12 w-1/2 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, openDrawer } = useCart();
  const wishlist = useWishlist();
  const toast = useToast();

  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState(0);
  const [tab, setTab] = useState("Description");

  const { data, loading, error } = useAsync(async () => {
    setQty(1);
    setVariant(0);
    setTab("Description");
    return api.getProduct(id);
  }, [id]);

  if (loading && !data) return <DetailSkeleton />;
  if (error) {
    return (
      <div className="container-page py-16">
        {error.toLowerCase().includes("not found") ? (
          <EmptyState emoji="🤷" title="Product not found" message="This product may have been removed." actionLabel="Back to shop" actionTo="/products" />
        ) : (
          <ErrorMessage message={error} />
        )}
      </div>
    );
  }

  const { product, related, reviews } = data;
  const off = discountPercent(product.price, product.originalPrice);
  const soldOut = product.stock === 0;
  const liked = wishlist.has(product.id);

  const handleAdd = () => {
    addItem(product, qty);
    toast.success(`Added ${qty} × "${product.name}" to cart`);
    openDrawer();
  };

  const handleBuyNow = () => {
    addItem(product, qty);
    navigate("/checkout");
  };

  return (
    <div className="container-page py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link to="/" className="hover:text-brand-700">Home</Link>
        <ChevronRightIcon className="h-4 w-4" />
        <Link to="/products" className="hover:text-brand-700">Shop</Link>
        <ChevronRightIcon className="h-4 w-4" />
        <Link to={`/products?category=${product.category}`} className="hover:text-brand-700">{product.category}</Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="line-clamp-1 font-medium text-slate-800">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl shadow-sm ring-1 ring-slate-200">
            <ProductImage product={product} variant={variant} emojiClass="text-[9rem]" />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                aria-label={`View image ${v + 1}`}
                aria-current={variant === v}
                className={`aspect-square overflow-hidden rounded-xl ring-2 transition ${variant === v ? "ring-brand-600" : "ring-transparent hover:ring-slate-300"}`}
              >
                <ProductImage product={product} variant={v} emojiClass="text-4xl" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand-700">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Rating value={product.rating} count={product.reviewCount} showValue size="h-5 w-5" />
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-4xl font-extrabold text-slate-900">{formatPrice(product.price)}</span>
            {product.originalPrice && <span className="text-xl text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>}
            {off > 0 && <span className="rounded-full bg-accent-100 px-3 py-1 text-sm font-bold text-accent-800">Save {off}%</span>}
          </div>

          <p className="mt-5 leading-relaxed text-slate-600">{product.description}</p>

          <ul className="mt-5 space-y-2">
            {product.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-6 text-sm font-semibold">
            {soldOut ? (
              <span className="text-red-600">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-orange-600">Hurry, only {product.stock} left in stock</span>
            ) : (
              <span className="text-brand-700">In stock</span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <QuantitySelector value={qty} onChange={(n) => setQty(Math.max(1, Math.min(n, product.stock || 1)))} max={product.stock || 1} />
            <button className="btn-primary flex-1 !py-3 sm:flex-none sm:!px-8" onClick={handleAdd} disabled={soldOut}>
              Add to cart
            </button>
            <button className="btn-dark flex-1 !py-3 sm:flex-none sm:!px-8" onClick={handleBuyNow} disabled={soldOut}>
              Buy now
            </button>
            <button
              onClick={() => {
                wishlist.toggle(product.id);
                toast.info(liked ? "Removed from wishlist" : "Saved to wishlist");
              }}
              aria-pressed={liked}
              aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
              className={`flex h-12 w-12 items-center justify-center rounded-lg border transition ${
                liked ? "border-rose-200 bg-rose-50 text-rose-500" : "border-slate-300 bg-white text-slate-500 hover:text-rose-500"
              }`}
            >
              <HeartIcon filled={liked} className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl bg-slate-100 p-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <TruckIcon className="h-6 w-6 text-brand-700" />
              <span>Free delivery on orders over $100</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshIcon className="h-6 w-6 text-brand-700" />
              <span>30-day hassle-free returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section className="mt-14">
        <div role="tablist" className="flex gap-1 border-b border-slate-200">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition ${
                tab === t ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t}
              {t === "Reviews" && <span className="ml-1.5 text-slate-400">({product.reviewCount})</span>}
            </button>
          ))}
        </div>

        <div className="card mt-6 p-6" role="tabpanel">
          {tab === "Description" && (
            <div className="max-w-3xl space-y-4 leading-relaxed text-slate-600">
              <p>{product.description}</p>
              <p>
                Every ShopZen product is inspected before it ships and backed by our 30-day returns policy, so you can buy with
                confidence.
              </p>
            </div>
          )}

          {tab === "Specifications" && (
            <dl className="max-w-2xl divide-y divide-slate-100">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-4 py-3 text-sm">
                  <dt className="font-semibold text-slate-700">{k}</dt>
                  <dd className="col-span-2 text-slate-600">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {tab === "Reviews" && (
            <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
              <div className="text-center md:text-left">
                <p className="text-5xl font-extrabold">{product.rating.toFixed(1)}</p>
                <div className="mt-2 flex justify-center md:justify-start">
                  <Rating value={product.rating} size="h-5 w-5" />
                </div>
                <p className="mt-1 text-sm text-slate-500">Based on {product.reviewCount.toLocaleString()} reviews</p>
              </div>
              <ul className="divide-y divide-slate-100">
                {reviews.map((r) => (
                  <li key={r.name + r.date} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Rating value={r.rating} />
                      <span className="font-semibold">{r.title}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{r.text}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {r.name} · {formatDate(r.date)} · Verified purchase
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-extrabold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
