import { formatPrice } from "../utils/format";

function Row({ label, value, tone = "" }) {
  return (
    <div className={`flex items-center justify-between text-sm ${tone}`}>
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

// Used on both the cart and checkout pages. `totals` comes from calcTotals() or the server.
export default function OrderSummary({ totals, coupon, children }) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">Order summary</h2>
      {children}
      <div className="space-y-2.5">
        <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
        {totals.discount > 0 && <Row label={`Discount${coupon ? ` (${coupon.code})` : ""}`} value={`-${formatPrice(totals.discount)}`} tone="text-brand-700" />}
        <Row label="Shipping" value={totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)} />
        <Row label="Estimated tax (8%)" value={formatPrice(totals.tax)} />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="font-bold">Total</span>
        <span className="text-2xl font-extrabold tabular-nums">{formatPrice(totals.total)}</span>
      </div>
    </div>
  );
}
