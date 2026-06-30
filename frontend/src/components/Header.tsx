"use client";

import type { Empresa } from "@/types";

interface HeaderProps {
  empresa: Empresa;
}

export default function Header({ empresa }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-yellow-700/10 bg-surface/95 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          {empresa.nombre.charAt(0)}
        </div>
        <div>
          <h1 className="text-lg font-bold text-primary-dark">
            {empresa.nombre}
          </h1>
          <p className="text-xs text-amber-800/60">Pedí online, retirá local</p>
        </div>
      </div>
    </header>
  );
}
