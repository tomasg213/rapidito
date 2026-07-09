"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface PedidoItem {
  id: string;
  producto_id: string;
  nombre: string | null;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  comercio_id: string;
  repartidor_id: string | null;
  monto_total: number;
  direccion_texto: string;
  referencia: string | null;
  estado: "pendiente" | "en_preparacion" | "en_camino" | "entregado";
  created_at: string;
  total_items?: number;
  items: PedidoItem[];
}

export function usePedidoRealtime(pedidoId: string) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pedidoId) return;

    // 1. Fetch inicial desde el backend (incluye items)
    const fetchPedido = async () => {
      try {
        const res = await fetch(`/v1/pedidos/${pedidoId}`);
        if (!res.ok) {
          console.error("Error fetching pedido:", res.status);
          return;
        }
        const data = await res.json();
        setPedido(data as Pedido);
      } catch (err) {
        console.error("Error fetching pedido:", err);
      } finally {
        setLoading(false);
      }
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
          setPedido((prev) => {
            if (!prev) return prev;
            return { ...prev, ...(payload.new as Partial<Pedido>) };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pedidoId]);

  return { pedido, loading };
}
