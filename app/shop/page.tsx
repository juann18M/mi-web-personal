'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar'; 
import ProductGrid from './components/ProductGrid';
import Filters from './components/Filters';
import { SlidersHorizontal, Plus } from 'lucide-react';

export default function ShopPage() {
  const [filters, setFilters] = useState({
    categoria: 'todos',
    subcategoria: 'todos',
    tipo_arete: 'todos',
    sort: 'default',
    marca: 'todos',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [siteConfig, setSiteConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Cargar configuración del sitio
  useEffect(() => {
    axios.get("/api/config")
      .then((res) => {
        setSiteConfig(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar configuración:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isFilterOpen]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({ 
      categoria: 'todos', 
      subcategoria: 'todos',
      tipo_arete: 'todos',
      sort: 'default', 
      marca: 'todos' 
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categoria !== 'todos') count++;
    if (filters.subcategoria !== 'todos') count++;
    if (filters.tipo_arete !== 'todos') count++;
    if (filters.sort !== 'default') count++;
    if (filters.marca !== 'todos') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
        </div>
      </main>
    );
  }

  // Función para obtener el texto descriptivo según los filtros
  const getHeaderText = () => {
    if (filters.categoria === 'todos') return 'Todos los productos';
    if (filters.categoria === 'hombre') return 'Caballero';
    if (filters.categoria === 'mujer') return 'Dama';
    if (filters.categoria === 'accesorios') {
      if (filters.subcategoria !== 'todos') {
        if (filters.subcategoria === 'Aretes' && filters.tipo_arete !== 'todos') {
          return `Aretes - ${filters.tipo_arete}`;
        }
        return filters.subcategoria;
      }
      return 'Accesorios';
    }
    return filters.categoria;
  };

  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white font-sans antialiased">
      <Navbar />
      
      {/* --- MINIMALIST COMPACT HEADER --- */}
      <header className="pt-24 pb-8 px-4 md:px-8 bg-white">
        <div className="max-w-[1800px] mx-auto border-b border-black/[0.03] pb-8">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-black/40">
              {siteConfig?.eslogan || 'Nueva Coleccion / 2026'}
            </span>
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
              {/* Título refinado: pequeño, elegante y con degradado suave */}
              <h1 className="text-2xl md:text-3xl font-light tracking-[-0.02em] uppercase italic">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-black via-zinc-600 to-zinc-400">
                  {siteConfig?.subtitulo || 'Piezas Esenciales'}
                </span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-black/50 md:text-right">
                {getHeaderText()} — Seccion 01
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* --- MINIMALIST TOOLBAR --- */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em]">
            
            <button
              onClick={() => setIsFilterOpen(true)}
              className="group flex items-center gap-3 hover:opacity-50 transition-opacity"
            >
              <div className="relative">
                <SlidersHorizontal size={14} strokeWidth={1.5} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-black rounded-full" />
                )}
              </div>
              <span>{siteConfig?.buscar_texto?.replace(' Q', '') || 'Filtrar'}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="font-mono tracking-tighter opacity-60">
                {totalProducts.toString().padStart(2, '0')}
              </span>
              <span className="opacity-30">Items</span>
            </div>
          </div>
        </div>
      </nav>

      {/* --- PRODUCT CANVAS --- */}
      <section className="max-w-[1800px] mx-auto px-2 md:px-4 py-8">
        <ProductGrid 
  filters={filters} 
  onTotalChange={setTotalProducts}
/>
      </section>

      {/* --- FILTER PANEL (MODAL MOBILE / SIDEBAR DESKTOP) --- */}
      <div className={`fixed inset-0 z-[100] transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isFilterOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-black/30 md:bg-black/10 transition-opacity duration-500 ${isFilterOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsFilterOpen(false)}
        />

        <aside className={`absolute flex flex-col bg-white overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          inset-x-4 top-[15%] bottom-[15%] rounded-2xl shadow-2xl
          md:inset-y-0 md:right-0 md:left-auto md:w-[400px] md:h-full md:top-0 md:bottom-0 md:rounded-none md:shadow-none
          ${isFilterOpen 
            ? 'opacity-100 scale-100 translate-y-0 md:translate-x-0' 
            : 'opacity-0 scale-95 translate-y-8 md:opacity-100 md:scale-100 md:translate-y-0 md:translate-x-full'
          }
        `}>
          <div className="flex items-center justify-between p-6 md:p-8 border-b border-black/5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em]">Filtros</h2>
            <button onClick={() => setIsFilterOpen(false)} className="hover:rotate-90 transition-transform duration-500">
              <Plus size={24} strokeWidth={1} className="rotate-45" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <Filters 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />
          </div>

          <div className="p-6 md:p-8 bg-white border-t border-black/5 flex flex-col gap-3">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              Aplicar
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="w-full py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40 hover:text-black transition-colors"
              >
                Limpiar selección
              </button>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}