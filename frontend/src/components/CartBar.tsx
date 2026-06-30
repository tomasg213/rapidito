"use client";

import { useCart } from "@/context/CartContext";
import { formatearPrecio } from "@/lib/utils";

export default function CartBar() {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-lg -translate-x-1/2 px-4 pb-4">
      <button className="flex w-full items-center justify-between rounded-xl bg-accent px-5 py-3.5 text-white shadow-lg transition-transform active:scale-[0.98]">
        <span className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
            {totalItems}
          </span>
          <span className="text-sm font-semibold">Ver Carrito</span>
        </span>
        <span className="text-base font-bold">
          {formatearPrecio(totalPrice)}
        </span>
      </button>
    </div>
  );
}
