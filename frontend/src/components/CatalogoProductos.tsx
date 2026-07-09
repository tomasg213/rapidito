"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  disponible: boolean;
}

interface Comercio {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  productos: Producto[];
}

interface CartItem {
  producto_id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  comercio_id: string;
  comercio_nombre: string;
}

interface Props {
  onAddToCart: (item: CartItem) => void;
  cart: CartItem[];
}

export default function CatalogoProductos({ onAddToCart, cart }: Props) {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: comerciosData } = await supabase
        .from("comercios")
        .select("*")
        .eq("activo", true);

      if (!comerciosData) {
        setLoading(false);
        return;
      }

      const { data: productosData } = await supabase
        .from("productos")
        .select("*")
        .eq("disponible", true);

      const comerciosConProductos = comerciosData.map((c) => ({
        ...c,
        productos:
          (productosData ?? []).filter((p) => p.comercio_id === c.id) ?? [],
      }));

      setComercios(comerciosConProductos);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-gray-500">Cargando catalogo...</p>;

  if (comercios.length === 0)
    return <p className="text-gray-500">No hay comercios disponibles.</p>;

  return (
    <div className="space-y-6">
      {comercios.map((comercio) => (
        <section key={comercio.id} className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold">{comercio.nombre}</h3>
          {comercio.descripcion && (
            <p className="text-sm text-gray-500 mt-1">{comercio.descripcion}</p>
          )}

          {comercio.productos.length === 0 ? (
            <p className="text-sm text-gray-400 mt-2">
              Sin productos disponibles
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {comercio.productos.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{prod.nombre}</p>
                    {prod.descripcion && (
                      <p className="text-sm text-gray-500">{prod.descripcion}</p>
                    )}
                    <p className="text-sm text-blue-600 font-semibold">
                      ${prod.precio}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onAddToCart({
                        producto_id: prod.id,
                        nombre: prod.nombre,
                        precio: prod.precio,
                        cantidad: 1,
                        comercio_id: comercio.id,
                        comercio_nombre: comercio.nombre,
                      })
                    }
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

export type { CartItem };
