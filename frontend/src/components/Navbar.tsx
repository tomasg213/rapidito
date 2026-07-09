"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { cart, setCartOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-blue-700">
            Rapidito
          </Link>
          {user && (
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <Link
                href="/"
                className={`${
                  pathname === "/" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Inicio
              </Link>
              <Link
                href="/pedidos"
                className={`${
                  pathname.startsWith("/pedidos") ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Mis pedidos
              </Link>
              <Link
                href="/configuracion"
                className={`${
                  pathname === "/configuracion" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Configuracion
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
                title="Carrito"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                  />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>

              <button
                onClick={signOut}
                className="text-sm text-red-600 hover:underline"
              >
                Cerrar sesion
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
