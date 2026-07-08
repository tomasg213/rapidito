"use client";

import { usePedidoRealtime } from "@/hooks/usePedidoRealtime";

export default function Home() {
  const pedidoId = "00000000-0000-0000-0000-000000000000";
  const { pedido, loading } = usePedidoRealtime(pedidoId);

  if (loading) return <p className="p-4">Cargando pedido...</p>;
  if (!pedido) return <p className="p-4">Pedido no encontrado.</p>;

  return (
    <main className="p-4 space-y-2">
      <h1 className="text-xl font-bold">Pedido {pedido.id.slice(0, 8)}</h1>
      <p>Estado: <span className="font-semibold">{pedido.estado}</span></p>
      <p>Total: ${pedido.monto_total}</p>
      <p>Dirección: {pedido.direccion_texto}</p>
    </main>
  );
}
