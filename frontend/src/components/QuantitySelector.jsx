import { MinusIcon, PlusIcon } from "./Icons";

export default function QuantitySelector({ value, onChange, min = 1, max = 99, size = "md" }) {
  const dims = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const btn = `${dims} flex items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40`;

  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-300 bg-white">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className={`${size === "sm" ? "w-8 text-sm" : "w-10"} select-none text-center font-semibold tabular-nums`} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
