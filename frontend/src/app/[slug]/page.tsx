"use client";

import { useMemo, useState } from "react";
import { notFound } from "next/navigation";

import CartBar from "@/components/CartBar";
import CategoryBar from "@/components/CategoryBar";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { categorias, empresas, productos } from "@/data/mockData";
import { productosPorCategoria } from "@/lib/utils";

interface PageProps {
  params: { slug: string };
}

export default function MenuPage({ params }: PageProps) {
  const { slug } = params;
  const { addItem } = useCart();

  const empresa = empresas[slug];
  if (!empresa) notFound();

  const [categoriaActiva, setCategoriaActiva] = useState(categorias[0]?.id);

  const items = useMemo(
    () => productosPorCategoria(productos, categoriaActiva),
    [categoriaActiva],
  );

  return (
    <div className="pb-24">
      <Header empresa={empresa} />

      <CategoryBar
        categorias={categorias}
        activa={categoriaActiva}
        onChange={setCategoriaActiva}
      />

      <main className="space-y-3 px-4 pt-4">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-amber-800/40">
            No hay productos disponibles en esta categoría
          </p>
        ) : (
          items.map((p) => (
            <ProductCard key={p.id} producto={p} onAgregar={addItem} />
          ))
        )}
      </main>

      <CartBar />
    </div>
  );
}
