"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Direccion {
  id: string;
  nombre: string;
  direccion: string;
}

export default function AddressManager() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDirecciones = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return;

    const res = await fetch("/v1/direcciones", {
      headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setDirecciones(data ?? []);
    }
    setCargando(false);
  };

  useEffect(() => {
    fetchDirecciones();
  }, []);

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError("Debes iniciar sesion");
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };

    const body = JSON.stringify({ nombre, direccion });

    try {
      if (editandoId) {
        const res = await fetch(`/v1/direcciones/${editandoId}`, {
          method: "PUT",
          headers,
          body,
        });
        if (!res.ok) throw new Error("Error al actualizar");
      } else {
        const res = await fetch("/v1/direcciones", {
          method: "POST",
          headers,
          body,
        });
        if (!res.ok) throw new Error("Error al crear");
      }

      setNombre("");
      setDireccion("");
      setEditandoId(null);
      fetchDirecciones();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const editar = (d: Direccion) => {
    setNombre(d.nombre);
    setDireccion(d.direccion);
    setEditandoId(d.id);
  };

  const eliminar = async (id: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(`/v1/direcciones/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      setDirecciones((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Mis direcciones</h3>

      <form onSubmit={guardar} className="bg-white p-4 rounded-lg shadow-sm space-y-3">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}

        <input
          type="text"
          placeholder="Nombre (ej: Casa, Trabajo)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />

        <textarea
          placeholder="Direccion completa"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          required
          rows={2}
          className="w-full border rounded px-3 py-2"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            {editandoId ? "Actualizar" : "Agregar"}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={() => {
                setNombre("");
                setDireccion("");
                setEditandoId(null);
              }}
              className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {cargando ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : direcciones.length === 0 ? (
        <p className="text-sm text-gray-500">
          No tenes direcciones guardadas. Agrega una arriba.
        </p>
      ) : (
        <div className="space-y-2">
          {direcciones.map((d) => (
            <div
              key={d.id}
              className="bg-white p-4 rounded-lg shadow-sm flex items-start justify-between"
            >
              <div>
                <p className="font-medium">{d.nombre}</p>
                <p className="text-sm text-gray-600">{d.direccion}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => editar(d)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminar(d.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
