import { Link, useLocation, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import ProductImage from "../components/ProductImage";
import OrderSummary from "../components/OrderSummary";
import EmptyState, { ErrorMessage } from "../components/EmptyState";
import { CheckIcon } from "../components/Icons";
import { formatDate, formatPrice } from "../utils/format";

export default function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const fromCheckout = Boolean(location.state && location.state.order);

  const { data, loading, error } = useAsync(
    () => (fromCheckout ? Promise.resolve({ order: location.state.order }) : api.getOrder(id)),
    [id]
  );

  if (loading && !data) {
    return <div className="container-page py-16"><div className="card mx-auto h-72 max-w-3xl animate-pulse bg-slate-100" /></div>;
  }
  if (error) {
    return (
      <div className="container-page py-16">
        {error.toLowerCase().includes("not found") ? (
          <EmptyState
            emoji="📭"
            title="Order not found"
            message="We could not find that order. Orders are kept in server memory and are cleared when the server restarts."
            actionLabel="View my orders"
            actionTo="/orders"
          />
        ) : (
          <ErrorMessage message={error} />
        )}
      </div>
    );
  }

  const { order } = data;
  const c = order.customer;

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <CheckIcon className="h-10 w-10" strokeWidth={2.2} />
          </div>
          <h1 className="mt-5 text-3xl font-extrabold">{fromCheckout ? "Thank you, your order is confirmed!" : "Order details"}</h1>
          <p className="mt-2 text-slate-500">
            Order <span className="font-bold text-slate-900">{order.id}</span> · placed {formatDate(order.createdAt)}
          </p>
          {fromCheckout && <p className="mt-1 text-sm text-slate-500">A confirmation would be sent to {c.email}.</p>}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Status", value: order.status.charAt(0).toUpperCase() + order.status.slice(1) },
            { label: "Estimated delivery", value: formatDate(order.estimatedDelivery, { weekday: "short", month: "short", day: "numeric" }) },
            { label: "Payment", value: order.payment === "cod" ? "Cash on delivery" : "Card" },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
              <p className="mt-1 font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="card mt-6 divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <ProductImage product={item} emojiClass="text-2xl" />
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/products/${item.id}`} className="font-semibold hover:text-brand-700">{item.name}</Link>
                <p className="text-sm text-slate-500">{formatPrice(item.price)} × {item.qty}</p>
              </div>
              <p className="font-bold tabular-nums">{formatPrice(item.lineTotal)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid items-start gap-6 md:grid-cols-2">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Shipping to</h2>
            <address className="space-y-0.5 text-sm not-italic text-slate-600">
              <p className="font-semibold text-slate-900">{c.name}</p>
              <p>{c.address}</p>
              <p>{[c.city, c.state, c.zip].filter(Boolean).join(", ")}</p>
              <p className="pt-2">{c.phone}</p>
              <p>{c.email}</p>
            </address>
          </div>
          <OrderSummary totals={order.totals} coupon={order.coupon ? { code: order.coupon } : null} />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/products" className="btn-primary">Continue shopping</Link>
          <Link to="/orders" className="btn-outline">View my orders</Link>
        </div>
      </div>
    </div>
  );
}
