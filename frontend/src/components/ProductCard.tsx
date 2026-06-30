"use client";

import type { Producto } from "@/types";
import { formatearPrecio } from "@/lib/utils";

interface ProductCardProps {
  producto: Producto;
  onAgregar: (producto: Producto) => void;
}

export default function ProductCard({ producto, onAgregar }: ProductCardProps) {
  return (
    <article className="flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-amber-900/5">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center self-center rounded-lg bg-surface-alt text-3xl">
        🍗
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
        <div>
          <h3 className="text-sm font-semibold text-amber-900">
            {producto.nombre}
          </h3>
          <p className="line-clamp-2 text-xs text-amber-800/60">
            {producto.descripcion}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-accent">
            {formatearPrecio(producto.precio)}
          </span>
          <button
            onClick={() => onAgregar(producto)}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark active:scale-95"
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
