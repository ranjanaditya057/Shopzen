import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { calcTotals } from "../utils/pricing";

// The whole cart (items + applied coupon) lives in localStorage under this key.
const STORAGE_KEY = "shopzen_cart_v1";
const EMPTY = { items: [], coupon: null };

const isValidItem = (i) =>
  i && Number.isInteger(i.id) && typeof i.price === "number" && Number.isInteger(i.qty) && i.qty > 0;

function readStorage() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed) return EMPTY;
    return {
      items: Array.isArray(parsed.items) ? parsed.items.filter(isValidItem) : [],
      coupon: parsed.coupon || null,
    };
  } catch {
    return EMPTY;
  }
}

const clamp = (qty, stock) => Math.max(1, Math.min(qty, stock ?? 99));

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "ADD": {
      const { product, qty } = action;
      const stock = product.stock ?? 99;
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, price: product.price, stock, qty: clamp(i.qty + qty, stock) } : i
          ),
        };
      }
      const item = {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        emoji: product.emoji,
        color: product.color,
        image: (product.images && product.images[0]) || product.image || null,
        stock,
        qty: clamp(qty, stock),
      };
      return { ...state, items: [...state.items, item] };
    }

    case "SET_QTY":
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.id ? { ...i, qty: clamp(action.qty, i.stock) } : i)),
      };

    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };

    case "SYNC": {
      // Replace local snapshots with the server's authoritative lines
      const byId = new Map(action.lines.map((l) => [l.id, l]));
      const items = state.items
        .filter((i) => byId.has(i.id))
        .map((i) => {
          const l = byId.get(i.id);
          return { ...i, price: l.price, stock: l.stock, qty: l.qty };
        });
      return { ...state, items };
    }

    case "SET_COUPON":
      return { ...state, coupon: action.coupon };

    case "CLEAR":
      return EMPTY;

    default:
      return state;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, readStorage);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked - cart still works for this session */
    }
  }, [state]);

  // Keep several tabs in sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) dispatch({ type: "HYDRATE", state: readStorage() });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback((product, qty = 1) => dispatch({ type: "ADD", product, qty }), []);
  const updateQty = useCallback((id, qty) => dispatch({ type: "SET_QTY", id, qty }), []);
  const removeItem = useCallback((id) => dispatch({ type: "REMOVE", id }), []);
  const syncItems = useCallback((lines) => dispatch({ type: "SYNC", lines }), []);
  const applyCoupon = useCallback((coupon) => dispatch({ type: "SET_COUPON", coupon }), []);
  const removeCoupon = useCallback(() => dispatch({ type: "SET_COUPON", coupon: null }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo(
    () => ({
      items: state.items,
      coupon: state.coupon,
      count: state.items.reduce((n, i) => n + i.qty, 0),
      totals: calcTotals(state.items, state.coupon),
      drawerOpen,
      addItem,
      updateQty,
      removeItem,
      syncItems,
      applyCoupon,
      removeCoupon,
      clearCart,
      openDrawer,
      closeDrawer,
    }),
    [state, drawerOpen, addItem, updateQty, removeItem, syncItems, applyCoupon, removeCoupon, clearCart, openDrawer, closeDrawer]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
