import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "shopzen_wishlist_v1";

function read() {
  try {
    const ids = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(ids) ? ids.filter(Number.isInteger) : [];
  } catch {
    return [];
  }
}

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(read);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids]);

  useEffect(() => {
    const onStorage = (e) => e.key === STORAGE_KEY && setIds(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has = useCallback((id) => ids.includes(id), [ids]);
  const toggle = useCallback(
    (id) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    []
  );

  const value = useMemo(() => ({ ids, has, toggle, count: ids.length }), [ids, has, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
