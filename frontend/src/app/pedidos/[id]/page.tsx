"use client";

import { useParams } from "next/navigation";
import { usePedidoRealtime } from "@/hooks/usePedidoRealtime";

function Badge({ estado }: { estado: string }) {
  const colors: Record<string, string> = {
    pendiente: "bg-yellow-100 text-yellow-800",
    en_preparacion: "bg-blue-100 text-blue-800",
    en_camino: "bg-purple-100 text-purple-800",
    entregado: "bg-green-100 text-green-800",
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

  const pasos = [
    "pendiente",
    "en_preparacion",
    "en_camino",
    "entregado",
  ] as const;
  const pasoActual = pasos.indexOf(pedido.estado as typeof pasos[number]);

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
        </div>

        {/* Detalles */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Detalles
          </h2>
          <p>
            <span className="text-gray-500">Total:</span> ${pedido.monto_total}
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
      </div>
    </main>
  );
}
