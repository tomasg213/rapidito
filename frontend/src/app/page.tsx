"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import CatalogoProductos from "@/components/CatalogoProductos";
import type { CartItem } from "@/components/CatalogoProductos";
import CartPanel from "@/components/CartPanel";

interface Perfil {
  id: string;
  nombre: string;
  rol: "cliente" | "comercio" | "repartidor";
}

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) {
      setFetching(false);
      return;
    }

    supabase
      .from("usuarios")
      .select("id, nombre, rol")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setPerfil(data as Perfil | null);
        setFetching(false);
      });
  }, [user]);

  if (authLoading || fetching) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </main>
    );
  }

  if (!user || !perfil) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <h1 className="text-3xl font-bold">Rapidito</h1>
        <p className="text-gray-600">Delivery hiperlocal en tiempo real</p>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Iniciar sesion
          </Link>
          <Link
            href="/register"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Registrarse
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Rapidito</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {perfil.nombre} ({perfil.rol})
          </span>
          <Link
            href="/configuracion"
            className="text-sm text-blue-600 hover:underline"
          >
            Configuracion
          </Link>
          <button
            onClick={signOut}
            className="text-sm text-red-600 hover:underline"
          >
            Cerrar sesion
          </button>
        </div>
      </header>

      <section className="p-6 max-w-4xl mx-auto">
        {perfil.rol === "cliente" && <DashboardCliente />}
        {perfil.rol === "comercio" && <DashboardComercio />}
        {perfil.rol === "repartidor" && <DashboardRepartidor />}
      </section>
    </main>
  );
}

function DashboardCliente() {
  const [tab, setTab] = useState<"ordenar" | "pedidos">("ordenar");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPedidos(data ?? []));
  }, []);

  const handleAddToCart = (item: CartItem) => {
    if (cart.length > 0 && cart[0].comercio_id !== item.comercio_id) {
      const ok = confirm(
        "Tenes productos de otro comercio en el carrito. Queres vaciarlo y agregar este?"
      );
      if (!ok) return;
      setCart([item]);
      setCartOpen(true);
      return;
    }

    setCart((prev) => {
      const existing = prev.find(
        (p) => p.producto_id === item.producto_id
      );
      if (existing) {
        return prev.map((p) =>
          p.producto_id === item.producto_id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }
      return [...prev, item];
    });
    setCartOpen(true);
  };

  const handleUpdateCantidad = (producto_id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.producto_id === producto_id
            ? { ...p, cantidad: p.cantidad + delta }
            : p
        )
        .filter((p) => p.cantidad > 0)
    );
  };

  const handleClearCart = () => {
    setCart([]);
    setCartOpen(false);
  };

  const tabs = [
    { key: "ordenar" as const, label: "Ordenar", badge: cart.length },
    { key: "pedidos" as const, label: "Mis pedidos" },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-200 rounded-lg p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              tab === t.key
                ? "bg-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
            {"badge" in t && t.badge != null && t.badge > 0 && (
              <span className="ml-1.5 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === "ordenar" && (
        <CatalogoProductos onAddToCart={handleAddToCart} cart={cart} />
      )}

      {tab === "pedidos" && (
        <>
          {pedidos.length === 0 ? (
            <p className="text-gray-500">No tienes pedidos aun.</p>
          ) : (
            <div className="grid gap-3">
              {pedidos.map((p) => (
                <Link
                  key={p.id}
                  href={`/pedidos/${p.id}`}
                  className="block bg-white p-4 rounded-lg shadow-sm hover:shadow"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Pedido #{p.id.slice(0, 8)}
                    </span>
                    <span className="text-sm capitalize px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {p.estado}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    ${p.monto_total} &middot;{" "}
                    {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Carrito modal */}
      {cartOpen && (
        <CartPanel
          cart={cart}
          onUpdateCantidad={handleUpdateCantidad}
          onClearCart={handleClearCart}
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  );
}

function DashboardComercio() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [comercio, setComercio] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: c } = await supabase
        .from("comercios")
        .select("*")
        .eq("propietario_id", userData.user.id)
        .single();
      setComercio(c ?? null);

      if (c) {
        const { data: p } = await supabase
          .from("pedidos")
          .select("*")
          .eq("comercio_id", c.id)
          .order("created_at", { ascending: false });
        setPedidos(p ?? []);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Pedidos recibidos</h2>
        {comercio && (
          <Link
            href={`/comercios/${comercio.id}/productos`}
            className="text-sm text-blue-600 underline"
          >
            Gestionar productos
          </Link>
        )}
      </div>

      {!comercio && (
        <p className="text-gray-500">
          Aun no registraste tu comercio.{" "}
          <Link href="/comercios/nuevo" className="text-blue-600 underline">
            Registralo aqui
          </Link>
        </p>
      )}

      {pedidos.length === 0 && comercio && (
        <p className="text-gray-500">No hay pedidos entrantes.</p>
      )}

      <div className="grid gap-3">
        {pedidos.map((p: any) => (
          <div
            key={p.id}
            className="bg-white p-4 rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">Pedido #{p.id.slice(0, 8)}</span>
              <span className="text-sm capitalize px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">
                {p.estado}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">${p.monto_total}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardRepartidor() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Entregas disponibles</h2>
      <p className="text-gray-500">Proximamente...</p>
    </div>
  );
}
