import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "artnest_cart";
const CartContext = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const inCart = useMemo(() => {
    const set = new Set();
    items.forEach((i) => {
      if (i.id != null) set.add(i.id);
      if (i._id != null) set.add(i._id);
      if (i.artworkDbId != null) set.add(i.artworkDbId);
      if (i.artworkId != null) set.add(i.artworkId);
    });
    return set;
  }, [items]);

  // Original artworks are one-of-a-kind, so no quantity: add once, toggle to remove.
  const toggleCart = useCallback((art) => {
    const artId = art.id || art._id || art.artworkDbId;
    setItems((prev) =>
      prev.some(
        (i) =>
          i.id === artId ||
          (art._id && i._id === art._id) ||
          (art.artworkDbId && i.artworkDbId === art.artworkDbId)
      )
        ? prev.filter(
            (i) =>
              i.id !== artId &&
              (!art._id || i._id !== art._id) &&
              (!art.artworkDbId || i.artworkDbId !== art.artworkDbId)
          )
        : [{ ...art, addedAt: Date.now() }, ...prev]
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          i.id !== id &&
          i._id !== id &&
          i.artworkDbId !== id &&
          i.artworkId !== id
      )
    );
  }, []);
  const clearCart = useCallback(() => setItems([]), []);
  const setCartItems = useCallback((newItems) => setItems(Array.isArray(newItems) ? newItems : []), []);

  const value = useMemo(
    () => ({ items, inCart, toggleCart, removeFromCart, clearCart, setCartItems }),
    [items, inCart, toggleCart, removeFromCart, clearCart, setCartItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}