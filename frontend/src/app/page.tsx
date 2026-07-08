import RestaurantCard from "@/components/RestaurantCard";
import { empresas } from "@/data/mockData";

export default function HomePage() {
  const lista = Object.values(empresas);

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-20 border-b border-yellow-700/10 bg-surface/95 backdrop-blur-sm">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-primary-dark">Rapidito</h1>
          <p className="text-sm text-amber-800/60">
            Elegí tu restaurante favorito
          </p>
        </div>
      </header>

      <main className="space-y-3 px-4 pt-4">
        {lista.map((empresa) => (
          <RestaurantCard key={empresa.id} empresa={empresa} />
        ))}
      </main>
    </div>
  );
}
