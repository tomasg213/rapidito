import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Rapidito",
  description: "Sistema de pedidos para restaurantes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="mx-auto min-h-screen max-w-lg bg-surface font-body">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
