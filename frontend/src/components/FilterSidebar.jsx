export const PRICE_RANGES = [
  { label: "Any price", min: "", max: "" },
  { label: "Under $50", min: "", max: "50" },
  { label: "$50 - $100", min: "50", max: "100" },
  { label: "$100 - $200", min: "100", max: "200" },
  { label: "Over $200", min: "200", max: "" },
];

const RATINGS = [
  { label: "Any rating", value: "" },
  { label: "4★ & up", value: "4" },
  { label: "3★ & up", value: "3" },
];

function Group({ title, children }) {
  return (
    <fieldset className="border-b border-slate-200 pb-5 last:border-0 last:pb-0">
      <legend className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-900">{title}</legend>
      <div className="space-y-2">{children}</div>
    </fieldset>
  );
}

function Radio({ name, checked, onChange, children, extra }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 text-sm text-slate-700">
      <span className="flex items-center gap-2.5">
        <input type="radio" name={name} checked={checked} onChange={onChange} className="h-4 w-4 accent-brand-600" />
        {children}
      </span>
      {extra !== undefined && <span className="text-xs text-slate-400">{extra}</span>}
    </label>
  );
}

export default function FilterSidebar({ categories = [], category, min, max, rating, onChange, onClear, hasFilters }) {
  const totalCount = categories.reduce((n, c) => n + c.count, 0);

  return (
    <div className="card space-y-5 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">Filters</h2>
        {hasFilters && (
          <button onClick={onClear} className="text-sm font-semibold text-brand-700 hover:underline">
            Clear all
          </button>
        )}
      </div>

      <Group title="Category">
        <Radio name="category" checked={category === "all"} onChange={() => onChange({ category: "all" })} extra={totalCount || undefined}>
          All products
        </Radio>
        {categories.map((c) => (
          <Radio key={c.name} name="category" checked={category === c.name} onChange={() => onChange({ category: c.name })} extra={c.count}>
            {c.name}
          </Radio>
        ))}
      </Group>

      <Group title="Price">
        {PRICE_RANGES.map((r) => (
          <Radio
            key={r.label}
            name="price"
            checked={(min || "") === r.min && (max || "") === r.max}
            onChange={() => onChange({ min: r.min, max: r.max })}
          >
            {r.label}
          </Radio>
        ))}
      </Group>

      <Group title="Rating">
        {RATINGS.map((r) => (
          <Radio key={r.label} name="rating" checked={(rating || "") === r.value} onChange={() => onChange({ rating: r.value })}>
            {r.label}
          </Radio>
        ))}
      </Group>
    </div>
  );
}
