import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { getOrderIds } from "../utils/orders";
import { formatDate, formatPrice } from "../utils/format";
import EmptyState from "../components/EmptyState";

export default function Orders() {
  const navigate = useNavigate();
  const [lookup, setLookup] = useState("");
  const ids = getOrderIds();

  const { data: orders, loading } = useAsync(async () => {
    const results = await Promise.allSettled(ids.map((id) => api.getOrder(id)));
    return results.filter((r) => r.status === "fulfilled").map((r) => r.value.order);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const id = lookup.trim();
    if (id) navigate(`/order/${encodeURIComponent(id.toUpperCase())}`);
  };

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold">My orders</h1>
      <p className="mt-1 text-slate-500">Orders placed from this browser, plus lookup by order number.</p>

      <form onSubmit={submit} className="card mt-8 flex max-w-xl flex-col gap-3 p-5 sm:flex-row">
        <input value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="Order number, e.g. ORD-XXXXXXXX" aria-label="Order number" className="input" />
        <button className="btn-dark shrink-0" disabled={!lookup.trim()}>Track order</button>
      </form>

      <div className="mt-8">
        {ids.length === 0 ? (
          <EmptyState emoji="📦" title="No orders yet" message="When you place an order it will show up here." actionLabel="Start shopping" actionTo="/products" />
        ) : loading ? (
          <div className="space-y-3">
            {ids.map((id) => (
              <div key={id} className="card h-20 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            emoji="🕳️"
            title="Orders not available"
            message="The server keeps orders in memory, so they disappear when it restarts."
            actionLabel="Keep shopping"
            actionTo="/products"
          />
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Link to={`/order/${o.id}`} className="card flex flex-wrap items-center justify-between gap-4 p-5 transition hover:border-brand-300 hover:shadow-md">
                  <div>
                    <p className="font-bold">{o.id}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.qty, 0)} items
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold capitalize text-brand-800">{o.status}</span>
                  <p className="text-lg font-extrabold tabular-nums">{formatPrice(o.totals.total)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
