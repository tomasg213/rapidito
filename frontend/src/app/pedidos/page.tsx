"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPedidos(data ?? []));
  }, []);

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
            <div className="flex justify-between">
              <span className="font-medium">#{p.id.slice(0, 8)}</span>
              <span className="text-sm capitalize">{p.estado}</span>
            </div>
            <p className="text-sm text-gray-500">${p.monto_total}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
