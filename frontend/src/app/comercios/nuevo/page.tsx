"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NuevoComercioPage() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      setError("Debes iniciar sesion");
      return;
    }

    const { error: err } = await supabase.from("comercios").insert({
      propietario_id: user.user.id,
      nombre,
      descripcion: descripcion || null,
      categoria: categoria || null,
    });

    if (err) {
      setError(err.message);
      return;
    }

    router.push("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Registrar comercio</h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}

        <input
          type="text"
          placeholder="Nombre del comercio"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />

        <textarea
          placeholder="Descripcion (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />

        <input
          type="text"
          placeholder="Categoria (opcional)"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Registrar
        </button>
      </form>
    </main>
  );
}
