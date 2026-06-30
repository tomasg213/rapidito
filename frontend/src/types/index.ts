export interface Empresa {
  id: string;
  nombre: string;
  slug: string;
  logoUrl: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  orden: number;
}

export interface Producto {
  id: string;
  categoriaId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  disponible: boolean;
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
}
