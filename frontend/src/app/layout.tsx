import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ClientShell from "./ClientShell";

export const metadata: Metadata = {
  title: "Rapidito",
  description: "Delivery hiperlocal en tiempo real",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <CartProvider>
            <ClientShell>{children}</ClientShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
