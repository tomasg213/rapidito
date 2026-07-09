"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { usePedidoRealtime } from "@/hooks/usePedidoRealtime";

function Badge({ estado }: { estado: string }) {
  const colors: Record<string, string> = {
    pendiente: "bg-yellow-100 text-yellow-800",
    en_preparacion: "bg-blue-100 text-blue-800",
    en_camino: "bg-purple-100 text-purple-800",
    entregado: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`text-sm capitalize px-3 py-1 rounded-full font-medium ${
        colors[estado] ?? "bg-gray-100 text-gray-800"
      }`}
    >
      {estado.replace("_", " ")}
    </span>
  );
}

export default function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { pedido, loading } = usePedidoRealtime(id);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!confirm("¿Cancelar este pedido?")) return;
    setCancelLoading(true);
    setCancelError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(`/v1/pedidos/${id}/cancelar`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      setCancelError(err?.detail ?? "Error al cancelar");
    }
    setCancelLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando pedido...</p>
      </main>
    );
  }

  if (!pedido) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Pedido no encontrado.</p>
      </main>
    );
  }

  const esCancelado = pedido.estado === "cancelado";
  const pasos = [
    "pendiente",
    "en_preparacion",
    "en_camino",
    "entregado",
  ] as const;
  const pasoActual = esCancelado ? -1 : pasos.indexOf(pedido.estado as typeof pasos[number]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pedido #{pedido.id.slice(0, 8)}</h1>
          <Badge estado={pedido.estado} />
        </div>

        {/* Timeline de estados - se actualiza en vivo via Realtime */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
            Estado del pedido
          </h2>
          {esCancelado ? (
            <p className="text-red-600 font-medium">Este pedido fue cancelado</p>
          ) : (
            <div className="space-y-4">
              {pasos.map((paso, idx) => (
                <div key={paso} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx <= pasoActual
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={
                      idx <= pasoActual ? "text-gray-900 font-medium" : "text-gray-400"
                    }
                  >
                    {paso.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Productos */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Productos
          </h2>
          {pedido.items.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin productos</p>
          ) : (
            <div className="divide-y">
              {pedido.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <div>
                    <span className="font-medium">{item.nombre ?? "Producto"}</span>
                    <span className="text-gray-400 ml-2">x{item.cantidad}</span>
                  </div>
                  <span className="text-gray-700">
                    ${Number(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalles */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Detalles
          </h2>
          <p>
            <span className="text-gray-500">Total:</span> $
            {Number(pedido.monto_total).toFixed(2)}
          </p>
          <p>
            <span className="text-gray-500">Direccion:</span>{" "}
            {pedido.direccion_texto}
          </p>
          {pedido.referencia && (
            <p>
              <span className="text-gray-500">Referencia:</span>{" "}
              {pedido.referencia}
            </p>
          )}
        </div>

        {/* Cancelar */}
        {pedido.estado === "pendiente" && (
          <div className="space-y-2">
            {cancelError && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {cancelError}
              </p>
            )}
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
            >
              {cancelLoading ? "Cancelando..." : "Cancelar pedido"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
