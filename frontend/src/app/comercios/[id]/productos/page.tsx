"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  disponible: boolean;
}

export default function ProductosPage() {
  const { id } = useParams<{ id: string }>();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = () => {
    supabase
      .from("productos")
      .select("*")
      .eq("comercio_id", id)
      .then(({ data }) => setProductos((data ?? []) as Producto[]));
  };

  useEffect(() => {
    fetchProductos();
  }, [id]);

  const agregarProducto = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error: err } = await supabase.from("productos").insert({
      comercio_id: id,
      nombre,
      precio: parseFloat(precio),
    });

    if (err) {
      setError(err.message);
      return;
    }

    setNombre("");
    setPrecio("");
    fetchProductos();
  };

  const toggleDisponible = async (p: Producto) => {
    await supabase
      .from("productos")
      .update({ disponible: !p.disponible })
      .eq("id", p.id);
    fetchProductos();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Gestionar productos</h1>

        {/* Formulario para agregar */}
        <form
          onSubmit={agregarProducto}
          className="bg-white p-4 rounded-lg shadow-sm space-y-3"
        >
          <h2 className="font-semibold">Agregar producto</h2>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="number"
            step="0.01"
            placeholder="Precio"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Agregar
          </button>
        </form>

        {/* Lista de productos */}
        <div className="space-y-2">
          {productos.map((p) => (
            <div
              key={p.id}
              className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{p.nombre}</p>
                <p className="text-sm text-gray-500">${p.precio}</p>
              </div>
              <button
                onClick={() => toggleDisponible(p)}
                className={`text-sm px-3 py-1 rounded ${
                  p.disponible
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {p.disponible ? "Disponible" : "Oculto"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
