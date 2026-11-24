"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "evidence-reps-cart";
const CHANGE_EVENT = "evidence-reps-cart-change";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal_cents: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  setQty: (productId: string, variantId: string | null, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

function getSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot(): string {
  return "[]";
}

function write(items: CartItem[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Armazenamento indisponível: o carrinho segue apenas na memória do browser.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const items = useMemo<CartItem[]>(() => {
    try {
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  }, [raw]);

  const addItem = useCallback(
    (item: CartItem) => {
      const current = getSnapshot();
      let parsed: CartItem[] = [];
      try {
        parsed = JSON.parse(current) as CartItem[];
      } catch {
        parsed = [];
      }
      const index = parsed.findIndex(
        (existing) =>
          existing.product_id === item.product_id &&
          existing.variant_id === item.variant_id,
      );
      if (index === -1) {
        write([...parsed, item]);
        return;
      }
      write(
        parsed.map((existing, position) =>
          position === index
            ? { ...existing, qty: Math.min(existing.qty + item.qty, 20) }
            : existing,
        ),
      );
    },
    [],
  );

  const removeItem = useCallback((productId: string, variantId: string | null) => {
    const current = getSnapshot();
    let parsed: CartItem[] = [];
    try {
      parsed = JSON.parse(current) as CartItem[];
    } catch {
      parsed = [];
    }
    write(
      parsed.filter(
        (item) =>
          !(item.product_id === productId && item.variant_id === variantId),
      ),
    );
  }, []);

  const setQty = useCallback(
    (productId: string, variantId: string | null, qty: number) => {
      const current = getSnapshot();
      let parsed: CartItem[] = [];
      try {
        parsed = JSON.parse(current) as CartItem[];
      } catch {
        parsed = [];
      }
      write(
        parsed.map((item) =>
          item.product_id === productId && item.variant_id === variantId
            ? { ...item, qty: Math.max(1, Math.min(qty, 20)) }
            : item,
        ),
      );
    },
    [],
  );

  const clear = useCallback(() => write([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal_cents: items.reduce(
        (sum, item) => sum + item.unit_price_cents * item.qty,
        0,
      ),
      addItem,
      removeItem,
      setQty,
      clear,
    }),
    [items, addItem, removeItem, setQty, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return context;
}
