import { useState } from "react";

// Shows a real photo when `product.images[variant]` / `product.image` is set, otherwise a
// gradient + emoji tile, so the store looks complete with zero image assets.
const ANGLES = [135, 45, 200, 315];
const TILTS = [0, -8, 8, -14];

export default function ProductImage({ product, variant = 0, emojiClass = "text-7xl", className = "" }) {
  const [failed, setFailed] = useState(false);
  const src = (product.images && product.images[variant]) || (variant === 0 ? product.image : null);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={product.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const [from, to] = product.color || ["#14b8a6", "#0f766e"];
  return (
    <div
      role="img"
      aria-label={product.name}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(${ANGLES[variant % 4]}deg, ${from}, ${to})` }}
    >
      <span className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/15" />
      <span className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white/10" />
      <span
        className={`relative select-none drop-shadow-lg ${emojiClass}`}
        style={{ transform: `rotate(${TILTS[variant % 4]}deg)` }}
      >
        {product.emoji}
      </span>
    </div>
  );
}
