import { api } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { useWishlist } from "../context/WishlistContext";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import EmptyState, { ErrorMessage } from "../components/EmptyState";

export default function Wishlist() {
  const { ids } = useWishlist();

  const { data, loading, error } = useAsync(
    () => (ids.length ? api.getProducts({ ids: ids.join(","), limit: 50 }) : Promise.resolve({ items: [] })),
    [ids.join(",")]
  );

  const items = data ? data.items.filter((p) => ids.includes(p.id)) : [];

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold">Wishlist</h1>
      <p className="mt-1 text-slate-500">{ids.length} saved {ids.length === 1 ? "item" : "items"}</p>

      <div className="mt-8">
        {error ? (
          <ErrorMessage message={error} />
        ) : ids.length === 0 ? (
          <EmptyState emoji="💝" title="Your wishlist is empty" message="Tap the heart on any product to save it for later." actionLabel="Discover products" actionTo="/products" />
        ) : loading && !data ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {ids.map((id) => (
              <ProductCardSkeleton key={id} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
