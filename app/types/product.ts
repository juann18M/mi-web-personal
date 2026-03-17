// app/types/product.ts

export interface Product {
  id: number;
  nombre: string;
  marca: string;
  descripcion?: string;
  precio: number;
  precio_oferta: number | null;
  en_oferta: boolean;
  stock: number;
  imagen: string;
  talla?: string;
  
  // NUEVOS CAMPOS PARA MAYOREO
  precio_mayoreo_1?: number | null;
  cantidad_mayoreo_1?: number;
  precio_mayoreo_2?: number | null;
  cantidad_mayoreo_2?: number;
  precio_mayoreo_3?: number | null;
  cantidad_mayoreo_3?: number;
}