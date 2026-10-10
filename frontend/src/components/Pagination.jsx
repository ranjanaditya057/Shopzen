import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const numbers = Array.from({ length: pages }, (_, i) => i + 1);
  const base =
    "flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg border px-3 text-sm font-semibold transition";

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <button
        className={`${base} border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40`}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
      {numbers.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`${base} ${
            n === page ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        className={`${base} border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40`}
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}
