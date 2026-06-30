"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import type { CartItem, Producto } from "@/types";

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Producto }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; delta: number } }
  | { type: "CLEAR" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.producto.id === action.payload.id,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.producto.id === action.payload.id
              ? { ...i, cantidad: i.cantidad + 1 }
              : i,
          ),
        };
      }
      return {
        items: [...state.items, { producto: action.payload, cantidad: 1 }],
      };
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter((i) => i.producto.id !== action.payload),
      };
    case "UPDATE_QUANTITY": {
      const { id, delta } = action.payload;
      return {
        items: state.items
          .map((i) =>
            i.producto.id === id
              ? { ...i, cantidad: Math.max(1, i.cantidad + delta) }
              : i,
          )
          .filter((i) => i.cantidad > 0),
      };
    }
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (producto: Producto) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clear: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const initialState: CartState = { items: [] };

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = useCallback((producto: Producto) => {
    dispatch({ type: "ADD_ITEM", payload: producto });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, delta } });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const totalItems = useMemo(
    () => state.items.reduce((sum, i) => sum + i.cantidad, 0),
    [state.items],
  );

  const totalPrice = useMemo(
    () => state.items.reduce((sum, i) => sum + i.producto.precio * i.cantidad, 0),
    [state.items],
  );

  const value = useMemo(
    () => ({
      items: state.items,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      totalItems,
      totalPrice,
    }),
    [state.items, addItem, removeItem, updateQuantity, clear, totalItems, totalPrice],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
