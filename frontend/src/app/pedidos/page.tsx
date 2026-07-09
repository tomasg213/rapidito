"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPedidos(data ?? []));
  }, [refresh]);

  const handleCancel = async (pedidoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("¿Cancelar este pedido?")) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch(`/v1/pedidos/${pedidoId}/cancelar`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) setRefresh((n) => n + 1);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        {pedidos.map((p) => (
          <Link
            key={p.id}
            href={`/pedidos/${p.id}`}
            className="block bg-white p-4 rounded-lg shadow-sm hover:shadow"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">#{p.id.slice(0, 8)}</span>
              <div className="flex items-center gap-2">
                {p.estado === "pendiente" && (
                  <button
                    onClick={(e) => handleCancel(p.id, e)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Cancelar
                  </button>
                )}
                <span className="text-sm capitalize px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {p.estado}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              ${Number(p.monto_total).toFixed(2)} &middot;{" "}
              {p.total_items ?? 0} productos
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
