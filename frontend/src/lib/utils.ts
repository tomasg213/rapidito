import type { Categoria, Producto } from "@/types";

export function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

export function productosPorCategoria(
  productos: Producto[],
  categoriaId: string,
): Producto[] {
  return productos.filter(
    (p) => p.categoriaId === categoriaId && p.disponible,
  );
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}
