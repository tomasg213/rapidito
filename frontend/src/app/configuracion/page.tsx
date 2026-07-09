"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AddressManager from "@/components/AddressManager";

export default function ConfiguracionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    supabase
      .from("usuarios")
      .select("nombre, telefono")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setNombre(data.nombre ?? "");
          setTelefono(data.telefono ?? "");
        }
        setCargandoDatos(false);
      });
  }, [user, authLoading, router]);

  const handleGuardar = async (e: FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setExito(false);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("Debes iniciar sesion");
      setGuardando(false);
      return;
    }

    try {
      const res = await fetch("/v1/usuarios/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          nombre: nombre || null,
          telefono: telefono || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail ?? "Error al guardar");
      }

      setExito(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (authLoading || cargandoDatos) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Configuracion</h1>

        <form
          onSubmit={handleGuardar}
          className="bg-white p-6 rounded-lg shadow-sm space-y-4"
        >
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          {exito && (
            <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
              Datos guardados correctamente
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefono
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="0412-555-5555"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        <AddressManager />
      </div>
    </main>
  );
}
