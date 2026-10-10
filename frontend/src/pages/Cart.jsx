import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import ProductImage from "../components/ProductImage";
import QuantitySelector from "../components/QuantitySelector";
import EmptyState from "../components/EmptyState";
import OrderSummary from "../components/OrderSummary";
import { TagIcon, TrashIcon } from "../components/Icons";
import { formatPrice } from "../utils/format";
import { FREE_SHIPPING_THRESHOLD } from "../utils/pricing";

export default function Cart() {
  const { items, coupon, totals, updateQty, removeItem, clearCart, applyCoupon, removeCoupon } = useCart();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [couponError, setCouponError] = useState("");

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState emoji="🛒" title="Your cart is empty" message="Browse the store and add something you love." actionLabel="Start shopping" actionTo="/products" />
      </div>
    );
  }

  const submitCoupon = async (e) => {
    e.preventDefault();
    setCouponError("");
    setBusy(true);
    try {
      const res = await api.validateCoupon(code, totals.subtotal);
      applyCoupon(res.coupon);
      setCode("");
      toast.success(`Coupon ${res.coupon.code} applied`);
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - (totals.subtotal - totals.discount));
  const progress = Math.min(100, ((totals.subtotal - totals.discount) / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex items-end justify-between">
        <h1 className="text-3xl font-extrabold">Shopping cart</h1>
        <button onClick={clearCart} className="text-sm font-semibold text-slate-500 hover:text-red-600">
          Clear cart
        </button>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-4">
          <div className="card p-5">
            <p className="text-sm text-slate-600">
              {remaining > 0 ? (
                <>
                  You are <b className="text-slate-900">{formatPrice(remaining)}</b> away from free shipping.
                </>
              ) : (
                <b className="text-brand-700">Great news, your order ships free 🎉</b>
              )}
            </p>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <ul className="card divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 p-4 sm:gap-6 sm:p-5">
                <Link to={`/products/${item.id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28">
                  <ProductImage product={item} emojiClass="text-4xl" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{item.category}</p>
                      <Link to={`/products/${item.id}`} className="font-semibold leading-snug hover:text-brand-700">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">{formatPrice(item.price)} each</p>
                    </div>
                    <p className="hidden text-lg font-extrabold sm:block">{formatPrice(item.price * item.qty)}</p>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    <QuantitySelector value={item.qty} max={item.stock} onChange={(q) => updateQty(item.id, q)} />
                    <p className="text-lg font-extrabold sm:hidden">{formatPrice(item.price * item.qty)}</p>
                    <button
                      onClick={() => {
                        removeItem(item.id);
                        toast.info("Item removed");
                      }}
                      className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" /> <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                  {item.qty >= item.stock && <p className="mt-2 text-xs font-medium text-orange-600">Maximum available quantity reached</p>}
                </div>
              </li>
            ))}
          </ul>

          <Link to="/products" className="inline-block text-sm font-semibold text-brand-700 hover:underline">
            ← Continue shopping
          </Link>
        </div>

        <div className="space-y-4 lg:sticky lg:top-32">
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
              <TagIcon className="h-4 w-4" /> Promo code
            </h2>
            {coupon ? (
              <div className="flex items-center justify-between rounded-lg bg-brand-50 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-brand-800">{coupon.code}</p>
                  <p className="text-xs text-brand-700">{totals.couponApplies ? coupon.description : `Needs a $${coupon.minSubtotal} minimum order`}</p>
                </div>
                <button onClick={removeCoupon} className="text-sm font-semibold text-slate-500 hover:text-red-600">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={submitCoupon}>
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10"
                    aria-label="Promo code"
                    className={`input ${couponError ? "input-error" : ""}`}
                  />
                  <button className="btn-dark shrink-0" disabled={busy || !code.trim()}>
                    Apply
                  </button>
                </div>
                {couponError && <p className="mt-2 text-xs font-medium text-red-600">{couponError}</p>}
                <p className="mt-2 text-xs text-slate-400">Try WELCOME10, FREESHIP or SAVE20 (min. $150).</p>
              </form>
            )}
          </div>

          <OrderSummary totals={totals} coupon={coupon} />
          <Link to="/checkout" className="btn-primary w-full !py-3.5 text-base">
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
