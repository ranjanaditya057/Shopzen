import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import FilterSidebar, { PRICE_RANGES } from "../components/FilterSidebar";
import Pagination from "../components/Pagination";
import EmptyState, { ErrorMessage } from "../components/EmptyState";
import { CloseIcon, FilterIcon } from "../components/Icons";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "discount", label: "Biggest discount" },
  { value: "newest", label: "Newest" },
];

function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pl-3 pr-2 text-xs font-semibold text-brand-800">
      {children}
      <button onClick={onRemove} className="rounded-full p-0.5 hover:bg-brand-100" aria-label="Remove filter">
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const q = params.get("q") || "";
  const category = params.get("category") || "all";
  const min = params.get("min") || "";
  const max = params.get("max") || "";
  const rating = params.get("rating") || "";
  const sort = params.get("sort") || "featured";
  const page = Math.max(1, Number(params.get("page")) || 1);

  // Merge a patch into the URL query string. Changing any filter resets to page 1.
  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      const empty = value === "" || value === null || value === undefined || (key === "category" && value === "all");
      if (empty) next.delete(key);
      else next.set(key, String(value));
    });
    if (!("page" in patch)) next.delete("page");
    setParams(next);
  };

  const clearAll = () => setParams(sort !== "featured" ? { sort } : {});

  const products = useAsync(
    () => api.getProducts({ q, category, minPrice: min, maxPrice: max, rating, sort, page, limit: 8 }),
    [q, category, min, max, rating, sort, page]
  );
  const categories = useAsync(() => api.getCategories(), []);

  const hasFilters = Boolean(q || category !== "all" || min || max || rating);
  const priceLabel = PRICE_RANGES.find((r) => r.min === min && r.max === max)?.label;

  const { data, loading, error } = products;

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">{q ? `Results for "${q}"` : category !== "all" ? category : "All products"}</h1>
        <p className="mt-1 text-slate-500">
          {data ? `${data.total} ${data.total === 1 ? "product" : "products"}` : "Loading products..."}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <FilterSidebar
            categories={categories.data || []}
            category={category}
            min={min}
            max={max}
            rating={rating}
            onChange={update}
            onClear={clearAll}
            hasFilters={hasFilters}
          />
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <button className="btn-outline lg:hidden" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
              <FilterIcon className="h-4 w-4" /> {showFilters ? "Hide filters" : "Filters"}
            </button>

            <div className="flex flex-wrap gap-2">
              {q && <Chip onRemove={() => update({ q: "" })}>Search: {q}</Chip>}
              {category !== "all" && <Chip onRemove={() => update({ category: "all" })}>{category}</Chip>}
              {(min || max) && priceLabel && <Chip onRemove={() => update({ min: "", max: "" })}>{priceLabel}</Chip>}
              {rating && <Chip onRemove={() => update({ rating: "" })}>{rating}★ & up</Chip>}
            </div>

            <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
              <span className="hidden sm:inline">Sort by</span>
              <select value={sort} onChange={(e) => update({ sort: e.target.value })} className="input !w-auto !py-2 pr-8">
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? (
            <ErrorMessage message={error} onRetry={() => setParams(new URLSearchParams(params))} />
          ) : loading && !data ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : data.items.length === 0 ? (
            <EmptyState
              emoji="🔍"
              title="No products found"
              message="Try a different search term or remove some filters."
              actionLabel="Clear filters"
              onAction={() => setParams({})}
            />
          ) : (
            <>
              <div className={`grid grid-cols-2 gap-4 transition-opacity sm:gap-6 xl:grid-cols-3 ${loading ? "opacity-50" : ""}`}>
                {data.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination
                page={data.page}
                pages={data.pages}
                onChange={(n) => {
                  update({ page: n });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
