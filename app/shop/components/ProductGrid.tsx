'use client';

import { useEffect, useState, useMemo } from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  marca: string;
  categoria: 'hombre' | 'mujer' | 'accesorios';
  subcategoria: string | null;
  tipo_arete: string | null;
  precio: number;
  precio_oferta: number | null;
  en_oferta: boolean;
  stock: number;
  talla: string;
  color: string;
  imagen: string;
}

interface ProductGridProps {
  forcedCategory?: 'hombre' | 'mujer' | 'accesorios';
  filters: {
    categoria: string;
    subcategoria: string;
    tipo_arete: string;
    sort: string;
    marca: string;
  };
  onTotalChange?: (count: number) => void;
}

export default function ProductGrid({ forcedCategory, filters, onTotalChange }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Simulando un ligero delay para que se aprecie la transición elegante
        await new Promise(resolve => setTimeout(resolve, 600)); 
        const res = await fetch('/api/productos');
        const data = await res.json();
        
        if (Array.isArray(data)) {
          console.log('Productos cargados:', data.length);
          setProducts(data);
        } else {
          setError('Error de catálogo.');
        }
      } catch (err) {
        setError('No pudimos cargar la colección.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    let result = [...products];

    console.log('Filtros aplicados:', filters);

   // 🔒 Si la página fuerza categoría (ej: Hombre)
if (forcedCategory) {
  result = result.filter(p => p.categoria === forcedCategory);
} 
// Si NO hay categoría forzada, usar filtro normal
else if (filters.categoria && filters.categoria !== 'todos') {
  result = result.filter(p => p.categoria === filters.categoria);
}

    // Filtrar por subcategoría
    if (filters.subcategoria && filters.subcategoria !== 'todos') {
      result = result.filter(p => p.subcategoria === filters.subcategoria);
      console.log(`Después de filtrar por subcategoría ${filters.subcategoria}:`, result.length);
    }

    // Filtrar por tipo de arete (solo para aretes)
    if (filters.tipo_arete && filters.tipo_arete !== 'todos') {
      result = result.filter(p => p.tipo_arete === filters.tipo_arete);
      console.log(`Después de filtrar por tipo_arete ${filters.tipo_arete}:`, result.length);
    }

    // Filtrar por marca
    if (filters.marca && filters.marca !== 'todos') {
      result = result.filter(p => p.marca?.toLowerCase() === filters.marca.toLowerCase());
    }

    // Ordenar
    if (filters.sort === 'price_asc') {
      result.sort((a, b) => (a.precio_oferta ?? a.precio) - (b.precio_oferta ?? b.precio));
    } else if (filters.sort === 'price_desc') {
      result.sort((a, b) => (b.precio_oferta ?? b.precio) - (a.precio_oferta ?? a.precio));
    } else if (filters.sort === 'name_asc') {
      result.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (filters.sort === 'name_desc') {
      result.sort((a, b) => b.nombre.localeCompare(a.nombre));
    }

    return result;
  }, [products, filters]);

  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(filteredProducts.length);
    }
  }, [filteredProducts.length, onTotalChange]);

  // --- ESTADO DE CARGA EDITORIAL ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] gap-6 animate-pulse">
        {/* Spinner ultra delgado y minimalista */}
        <div className="w-5 h-5 border-[1px] border-black/10 border-t-black animate-spin rounded-full"></div>
        <span className="text-[9px] uppercase tracking-[0.3em] text-black/40">Cargando piezas</span>
      </div>
    );
  }

  // --- ESTADO VACÍO / ERROR ESTILO BOUTIQUE ---
  if (error || filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4 animate-in fade-in duration-700">
        <p className="text-[10px] uppercase tracking-[0.2em] text-black/50 mb-6 max-w-[280px] leading-relaxed">
          {error || "Ninguna pieza coincide con tu selección actual."}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-[9px] font-bold uppercase tracking-[0.2em] border-b border-black/20 pb-1 hover:border-black transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    );
  }

  return (
    /* Grid estilo Zara: 
      - Móvil: gap horizontal mínimo (gap-x-1) para que parezca catálogo a sangre.
      - Desktop: Separación vertical exagerada (gap-y-20) para dar aire a cada foto.
    */
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-1 gap-y-12 md:gap-x-4 md:gap-y-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}