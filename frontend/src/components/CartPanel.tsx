"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface CartItem {
  producto_id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  comercio_id: string;
  comercio_nombre: string;
}

interface Props {
  cart: CartItem[];
  onUpdateCantidad: (producto_id: string, delta: number) => void;
  onClearCart: () => void;
  onClose: () => void;
}

export default function CartPanel({
  cart,
  onUpdateCantidad,
  onClearCart,
  onClose,
}: Props) {
  const [direccion, setDireccion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const total = cart.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );

  const comercio = cart.length > 0 ? cart[0].comercio_nombre : "";

  const confirmarPedido = async () => {
    if (!direccion.trim()) {
      setError("La direccion es obligatoria");
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Debes iniciar sesion");
        setEnviando(false);
        return;
      }

      const body = {
        comercio_id: cart[0].comercio_id,
        direccion_texto: direccion,
        referencia: referencia || null,
        productos: cart.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
        })),
      };

      const res = await fetch("/v1/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail ?? "Error al crear pedido");
      }

      const pedido = await res.json();
      setExito(pedido.id);
      onClearCart();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 text-center space-y-3">
          <p className="text-green-600 text-lg font-semibold">
            Pedido creado con exito
          </p>
          <p className="text-sm text-gray-500">
            Hacé clic para ver el estado en vivo
          </p>
          <a
            href={`/pedidos/${exito}`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Ver pedido
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Carrito</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay productos en el carrito
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              Pedido en: <span className="font-medium">{comercio}</span>
            </p>

            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.producto_id}
                  className="flex items-center justify-between py-2 border-b"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.nombre}</p>
                    <p className="text-sm text-gray-500">
                      ${item.precio} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateCantidad(item.producto_id, -1)}
                      className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => onUpdateCantidad(item.producto_id, 1)}
                      className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                  <p className="w-16 text-right font-medium">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </p>
            )}

            <input
              type="text"
              placeholder="Direccion de entrega *"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />

            <input
              type="text"
              placeholder="Referencia (opcional)"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />

            <div className="flex gap-2">
              <button
                onClick={onClearCart}
                className="flex-1 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
              >
                Vaciar
              </button>
              <button
                onClick={confirmarPedido}
                disabled={enviando}
                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {enviando ? "Enviando..." : "Confirmar pedido"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
