import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { saveOrderId } from "../utils/orders";
import { formatPrice } from "../utils/format";
import ProductImage from "../components/ProductImage";
import OrderSummary from "../components/OrderSummary";
import EmptyState from "../components/EmptyState";

const EMPTY_FORM = { name: "", email: "", phone: "", address: "", city: "", state: "", zip: "" };
const EMPTY_CARD = { number: "", expiry: "", cvc: "" };

function validate(form, payment, card) {
  const e = {};
  if (!form.name.trim()) e.name = "Enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
  if (form.phone.replace(/\D/g, "").length < 7) e.phone = "Enter a valid phone number.";
  if (!form.address.trim()) e.address = "Enter your street address.";
  if (!form.city.trim()) e.city = "Enter your city.";
  if (!form.zip.trim()) e.zip = "Enter your postal code.";
  if (payment === "card") {
    const digits = card.number.replace(/\s/g, "");
    if (!/^\d{13,19}$/.test(digits)) e.cardNumber = "Enter a valid card number.";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) e.cardExpiry = "Use MM/YY.";
    if (!/^\d{3,4}$/.test(card.cvc)) e.cardCvc = "3 or 4 digits.";
  }
  return e;
}

function Field({ id, label, error, className = "", ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input id={id} name={id} className={`input ${error ? "input-error" : ""}`} aria-invalid={Boolean(error)} {...props} />
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function Section({ step, title, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="mb-5 flex items-center gap-3 text-lg font-bold">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-sm text-white">{step}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Checkout() {
  const { items, coupon, totals, syncItems, removeCoupon, clearCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [payment, setPayment] = useState("cod");
  const [card, setCard] = useState(EMPTY_CARD);
  const [errors, setErrors] = useState({});
  const [issues, setIssues] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // On arrival, re-price the cart with the server so stale localStorage prices/stock are fixed.
  const initial = useRef({ items, coupon });
  useEffect(() => {
    const { items: start, coupon: startCoupon } = initial.current;
    if (!start.length) return;
    api
      .validateCart(start.map(({ id, qty, price }) => ({ id, qty, price })), startCoupon && startCoupon.code)
      .then((res) => {
        syncItems(res.lines);
        setIssues(res.issues.map((i) => i.message));
        if (startCoupon && res.couponError) removeCoupon();
      })
      .catch(() => {
        /* offline: keep local snapshot, the server re-checks when the order is placed */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState emoji="🛒" title="Nothing to check out" message="Add a few items to your cart first." actionLabel="Browse products" actionTo="/products" />
      </div>
    );
  }

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const setCardField = (name, value, errorKey) => {
    setCard((c) => ({ ...c, [name]: value }));
    if (errors[errorKey]) setErrors((er) => ({ ...er, [errorKey]: undefined }));
  };

  const formatCardNumber = (v) => v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(form, payment, card);
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error("Please fix the highlighted fields.");
      requestAnimationFrame(() => document.querySelector("[aria-invalid='true']")?.focus());
      return;
    }

    setSubmitting(true);
    try {
      // Card details are validated in the browser only and never sent to the server (demo store).
      const { order } = await api.createOrder({
        items: items.map(({ id, qty }) => ({ id, qty })),
        customer: form,
        payment,
        coupon: coupon && coupon.code,
      });
      saveOrderId(order.id);
      navigate(`/order/${order.id}`, { state: { order } });
      clearCart();
    } catch (err) {
      if (err.status === 400 && err.data && err.data.fields) {
        setErrors(err.data.fields);
        toast.error("Please check your details.");
      } else if (err.status === 409) {
        setIssues((err.data.issues || []).map((i) => i.message));
        try {
          const res = await api.validateCart(items.map(({ id, qty, price }) => ({ id, qty, price })), coupon && coupon.code);
          syncItems(res.lines);
        } catch {
          /* ignore */
        }
        toast.error("Your cart was updated. Please review and try again.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold">Checkout</h1>
      <p className="mt-1 text-slate-500">
        <Link to="/cart" className="font-semibold text-brand-700 hover:underline">← Back to cart</Link>
      </p>

      {issues.length > 0 && (
        <div role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">We updated your cart</p>
          <ul className="mt-1 list-inside list-disc">
            {issues.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={submit} noValidate className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <Section step={1} title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Full name" value={form.name} onChange={setField} error={errors.name} autoComplete="name" className="sm:col-span-2" />
              <Field id="email" type="email" label="Email" value={form.email} onChange={setField} error={errors.email} autoComplete="email" />
              <Field id="phone" type="tel" label="Phone" value={form.phone} onChange={setField} error={errors.phone} autoComplete="tel" />
            </div>
          </Section>

          <Section step={2} title="Shipping address">
            <div className="grid gap-4 sm:grid-cols-6">
              <Field id="address" label="Street address" value={form.address} onChange={setField} error={errors.address} autoComplete="street-address" className="sm:col-span-6" />
              <Field id="city" label="City" value={form.city} onChange={setField} error={errors.city} autoComplete="address-level2" className="sm:col-span-3" />
              <Field id="state" label="State / Region" value={form.state} onChange={setField} autoComplete="address-level1" className="sm:col-span-2" />
              <Field id="zip" label="Postal code" value={form.zip} onChange={setField} error={errors.zip} autoComplete="postal-code" className="sm:col-span-1" />
            </div>
          </Section>

          <Section step={3} title="Payment">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
              {[
                { value: "cod", title: "Cash on delivery", text: "Pay when your order arrives" },
                { value: "card", title: "Credit / debit card", text: "Demo only, no real charge" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    payment === opt.value ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input type="radio" name="payment" value={opt.value} checked={payment === opt.value} onChange={() => setPayment(opt.value)} className="mt-1 h-4 w-4 accent-brand-600" />
                  <span>
                    <span className="block text-sm font-bold">{opt.title}</span>
                    <span className="block text-xs text-slate-500">{opt.text}</span>
                  </span>
                </label>
              ))}
            </div>

            {payment === "card" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field
                  id="cardNumber"
                  label="Card number"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  autoComplete="cc-number"
                  value={card.number}
                  onChange={(e) => setCardField("number", formatCardNumber(e.target.value), "cardNumber")}
                  error={errors.cardNumber}
                  className="sm:col-span-2"
                />
                <Field
                  id="cardExpiry"
                  label="Expiry"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  autoComplete="cc-exp"
                  value={card.expiry}
                  onChange={(e) => setCardField("expiry", formatExpiry(e.target.value), "cardExpiry")}
                  error={errors.cardExpiry}
                />
                <Field
                  id="cardCvc"
                  label="CVC"
                  inputMode="numeric"
                  placeholder="123"
                  autoComplete="cc-csc"
                  value={card.cvc}
                  onChange={(e) => setCardField("cvc", e.target.value.replace(/\D/g, "").slice(0, 4), "cardCvc")}
                  error={errors.cardCvc}
                />
              </div>
            )}
          </Section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-32">
          <OrderSummary totals={totals} coupon={coupon}>
            <ul className="-mt-1 mb-4 max-h-64 space-y-3 overflow-y-auto border-b border-slate-100 pb-4">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0">
                    <div className="h-full w-full overflow-hidden rounded-lg">
                      <ProductImage product={item} emojiClass="text-xl" />
                    </div>
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-800 px-1 text-[11px] font-bold text-white">{item.qty}</span>
                  </div>
                  <p className="line-clamp-2 flex-1 text-sm font-medium leading-snug">{item.name}</p>
                  <span className="text-sm font-semibold tabular-nums">{formatPrice(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
          </OrderSummary>

          <button className="btn-primary w-full !py-3.5 text-base" disabled={submitting}>
            {submitting ? "Placing order..." : `Place order · ${formatPrice(totals.total)}`}
          </button>
          <p className="text-center text-xs text-slate-400">By placing your order you agree to our terms. This is a demo store, nothing is charged.</p>
        </div>
      </form>
    </div>
  );
}
