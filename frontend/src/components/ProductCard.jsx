import { Link } from "react-router-dom";
import ProductImage from "./ProductImage";
import Rating from "./Rating";
import { CartIcon, HeartIcon } from "./Icons";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { discountPercent, formatPrice } from "../utils/format";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const wishlist = useWishlist();
  const toast = useToast();

  const off = discountPercent(product.price, product.originalPrice);
  const soldOut = product.stock === 0;
  const liked = wishlist.has(product.id);

  const handleAdd = () => {
    addItem(product, 1);
    toast.success(`Added "${product.name}" to cart`);
  };

  const handleLike = () => {
    wishlist.toggle(product.id);
    toast.info(liked ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <article className="group card flex flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/products/${product.id}`} className="block h-full" aria-label={product.name}>
          <ProductImage product={product} className="transition duration-500 group-hover:scale-105" />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {off > 0 && <span className="rounded-full bg-accent-400 px-2.5 py-1 text-xs font-bold text-slate-900">-{off}%</span>}
          {soldOut && <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">Sold out</span>}
          {!soldOut && product.stock <= 5 && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-red-600">Only {product.stock} left</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleLike}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={liked}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow transition hover:scale-110 ${
            liked ? "text-rose-500" : "text-slate-500 hover:text-rose-500"
          }`}
        >
          <HeartIcon filled={liked} className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{product.category}</p>
        <Link to={`/products/${product.id}`} className="mt-1 line-clamp-2 min-h-[2.75rem] font-semibold leading-snug text-slate-900 hover:text-brand-700">
          {product.name}
        </Link>
        <div className="mt-2">
          <Rating value={product.rating} count={product.reviewCount} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <span className="text-lg font-extrabold text-slate-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className="btn-primary !px-3 !py-2"
            aria-label={`Add ${product.name} to cart`}
          >
            <CartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{soldOut ? "Sold out" : "Add"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="aspect-square bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-slate-200" />
        <div className="h-4 w-5/6 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-200" />
        <div className="flex items-center justify-between pt-3">
          <div className="h-5 w-1/4 rounded bg-slate-200" />
          <div className="h-9 w-16 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
