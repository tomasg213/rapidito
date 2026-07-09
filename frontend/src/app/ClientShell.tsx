"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import CartPanel from "@/components/CartPanel";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { cart, cartOpen, setCartOpen, updateCantidad, clearCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <>
      {user && !isAuthPage && <Navbar />}

      <main className="min-h-screen bg-gray-50">
        {user && !isHome && !isAuthPage && (
          <div className="max-w-5xl mx-auto px-4 pt-3">
            <button
              onClick={() => router.back()}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver
            </button>
          </div>
        )}

        {children}
      </main>

      {cartOpen && cart.length > 0 && (
        <CartPanel
          cart={cart}
          onUpdateCantidad={updateCantidad}
          onClearCart={clearCart}
          onClose={() => setCartOpen(false)}
        />
      )}
    </>
  );
}
