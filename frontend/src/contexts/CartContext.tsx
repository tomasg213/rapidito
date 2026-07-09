"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface CartItem {
  producto_id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  comercio_id: string;
  comercio_nombre: string;
}

interface CartContextType {
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: CartItem) => void;
  updateCantidad: (producto_id: string, delta: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  cartOpen: false,
  setCartOpen: () => {},
  addToCart: () => {},
  updateCantidad: () => {},
  clearCart: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      if (prev.length > 0 && prev[0].comercio_id !== item.comercio_id) {
        return [item];
      }
      const existing = prev.find((p) => p.producto_id === item.producto_id);
      if (existing) {
        return prev.map((p) =>
          p.producto_id === item.producto_id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }
      return [...prev, item];
    });
    setCartOpen(true);
  }, []);

  const updateCantidad = useCallback((producto_id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.producto_id === producto_id
            ? { ...p, cantidad: p.cantidad + delta }
            : p
        )
        .filter((p) => p.cantidad > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCartOpen(false);
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, cartOpen, setCartOpen, addToCart, updateCantidad, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
