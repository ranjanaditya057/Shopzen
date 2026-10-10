import { StarIcon } from "./Icons";

export default function Rating({ value = 0, count, size = "h-4 w-4", showValue = false }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const stars = Array.from({ length: 5 }, (_, i) => <StarIcon key={i} className={`${size} shrink-0`} />);

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative inline-block leading-none" role="img" aria-label={`Rated ${value} out of 5`}>
        <span className="flex text-slate-300">{stars}</span>
        <span className="absolute inset-y-0 left-0 flex overflow-hidden text-amber-400" style={{ width: `${pct}%` }}>
          {stars}
        </span>
      </span>
      {showValue && <span className="text-sm font-semibold text-slate-700">{value.toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-slate-500">({count.toLocaleString()})</span>}
    </div>
  );
}
