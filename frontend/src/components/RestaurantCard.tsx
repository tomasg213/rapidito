import Link from "next/link";

import type { Empresa } from "@/types";

interface RestaurantCardProps {
  empresa: Empresa;
}

export default function RestaurantCard({ empresa }: RestaurantCardProps) {
  return (
    <Link
      href={`/${empresa.slug}`}
      className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-amber-900/5 transition-all hover:shadow-md hover:ring-primary/30 active:scale-[0.98]"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white">
        {empresa.nombre.charAt(0)}
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-amber-900">
            {empresa.nombre}
          </h2>
          <p className="text-sm text-amber-800/60">Ver menú →</p>
        </div>
      </div>
    </Link>
  );
}
