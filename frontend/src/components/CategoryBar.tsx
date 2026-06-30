"use client";

import { useRef } from "react";

import type { Categoria } from "@/types";

interface CategoryBarProps {
  categorias: Categoria[];
  activa: string;
  onChange: (id: string) => void;
}

export default function CategoryBar({
  categorias,
  activa,
  onChange,
}: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <nav
      ref={scrollRef}
      className="no-scrollbar sticky top-14 z-10 flex gap-2 overflow-x-auto border-b border-amber-900/10 bg-surface-alt px-4 py-3"
    >
      {categorias
        .sort((a, b) => a.orden - b.orden)
        .map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activa === cat.id
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-amber-900/70 hover:bg-amber-100"
            }`}
          >
            {cat.nombre}
          </button>
        ))}
    </nav>
  );
}
