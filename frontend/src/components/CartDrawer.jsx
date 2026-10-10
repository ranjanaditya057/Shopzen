import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { CloseIcon, TrashIcon } from "./Icons";
import ProductImage from "./ProductImage";
import QuantitySelector from "./QuantitySelector";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import { FREE_SHIPPING_THRESHOLD } from "../utils/pricing";

export default function CartDrawer() {
  const { drawerOpen, closeDrawer, items, count, totals, updateQty, removeItem } = useCart();
  const location = useLocation();

  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totals.subtotal);
  const progress = Math.min(100, (totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/50" onClick={closeDrawer} />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-in flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold">
            Your cart <span className="text-slate-400">({count})</span>
          </h2>
          <button onClick={closeDrawer} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close cart">
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-4xl">🛒</div>
            <p className="text-lg font-bold">Your cart is empty</p>
            <p className="mt-1 text-sm text-slate-500">Looks like you have not added anything yet.</p>
            <Link to="/products" className="btn-primary mt-6">
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
              <p className="text-sm text-slate-600">
                {remaining > 0 ? (
                  <>
                    Add <b className="text-slate-900">{formatPrice(remaining)}</b> more for free shipping
                  </>
                ) : (
                  <b className="text-brand-700">You have unlocked free shipping 🎉</b>
                )}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  <Link to={`/products/${item.id}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <ProductImage product={item} emojiClass="text-3xl" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/products/${item.id}`} className="line-clamp-2 text-sm font-semibold leading-snug hover:text-brand-700">
                        {item.name}
                      </Link>
                      <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500" aria-label={`Remove ${item.name}`}>
                        <TrashIcon className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">{formatPrice(item.price)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <QuantitySelector size="sm" value={item.qty} max={item.stock} onChange={(q) => updateQty(item.id, q)} />
                      <span className="font-bold">{formatPrice(item.price * item.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-slate-200 p-5">
              <div className="flex items-center justify-between text-base">
                <span className="font-medium text-slate-600">Subtotal</span>
                <span className="text-lg font-extrabold">{formatPrice(totals.subtotal)}</span>
              </div>
              <p className="text-xs text-slate-500">Shipping, taxes and discounts are calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/cart" className="btn-outline">
                  View cart
                </Link>
                <Link to="/checkout" className="btn-primary">
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
