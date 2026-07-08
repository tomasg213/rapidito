"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Pedido {
  id: string;
  cliente_id: string;
  comercio_id: string;
  monto_total: number;
  direccion_texto: string;
  referencia: string | null;
  estado: "pendiente" | "en_preparacion" | "en_camino" | "entregado";
  created_at: string;
}

export function usePedidoRealtime(pedidoId: string) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pedidoId) return;

    // 1. Fetch inicial del pedido
    const fetchPedido = async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("id", pedidoId)
        .single();

      if (error) {
        console.error("Error fetching pedido:", error);
        return;
      }

      setPedido(data as Pedido);
      setLoading(false);
    };

    fetchPedido();

    // 2. Suscripción en tiempo real a UPDATEs en esta fila específica
    const channel = supabase
      .channel(`pedido-${pedidoId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pedidos",
          filter: `id=eq.${pedidoId}`,
        },
        (payload) => {
          setPedido(payload.new as Pedido);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pedidoId]);

  return { pedido, loading };
}
