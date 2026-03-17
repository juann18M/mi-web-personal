'use client';

import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { ShoppingBag, X, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function FavoritosPage() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const { addToCart } = useCart();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const triggerAlert = (msg: string) => {
    setAlertMessage(msg);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleAddAllToCart = () => {
    favorites.forEach(item => {
      addToCart({
        id: item.id,
        nombre: item.nombre,
        precio: item.en_oferta && item.precio_oferta ? item.precio_oferta : item.precio,
        precio_original: item.precio,   // obligatorio
        precio_normal: item.precio,     // obligatorio
        imagen: item.imagen,
        talla: item.talla || null,
        cantidad: 1,
      });
    });
    triggerAlert('Todos los productos añadidos al carrito');
  };

  const handleAddToCart = (item: typeof favorites[0]) => {
    addToCart({
      id: item.id,
      nombre: item.nombre,
      precio: item.en_oferta && item.precio_oferta ? item.precio_oferta : item.precio,
      precio_original: item.precio,   // obligatorio
      precio_normal: item.precio,     // obligatorio
      imagen: item.imagen,
      talla: item.talla || null,
      cantidad: 1,
    });
    triggerAlert('Producto añadido al carrito');
  };

  return (
    <>
      <Navbar />
      
      {/* Toast Notification Minimalista */}
      <div 
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
          showAlert ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-zinc-900 text-white px-8 py-4 text-xs uppercase tracking-widest shadow-2xl">
          {alertMessage}
        </div>
      </div>

      <main className="min-h-screen bg-white text-black font-sans pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12">
          
          {/* Header Tipo Editorial */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-gray-100 pb-6 gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-light uppercase tracking-[0.2em] mb-2">
                Favoritos
              </h1>
              <span className="text-xs text-gray-400 uppercase tracking-widest block">
                {favorites.length} {favorites.length === 1 ? 'Artículo' : 'Artículos'} guardados
              </span>
            </div>
            
            {favorites.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <button
                  onClick={clearFavorites}
                  className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors border-b border-transparent hover:border-black pb-1 self-start"
                >
                  Vaciar lista
                </button>
                <button
                  onClick={handleAddAllToCart}
                  className="bg-black text-white px-8 py-3 text-xs uppercase tracking-[0.15em] hover:bg-zinc-800 transition-colors duration-300 w-full sm:w-auto text-center"
                >
                  Añadir todo
                </button>
              </div>
            )}
          </div>

          {/* Grid de Productos */}
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 animate-fadeIn">
              <p className="text-gray-400 uppercase text-sm tracking-[0.2em] mb-8 text-center">
                Tu lista de deseos está vacía
              </p>
              <Link 
                href="/shop"
                className="group flex items-center gap-4 border border-black px-10 py-4 text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300"
              >
                Ir a la colección
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
              {favorites.map((item, index) => {
                const precioFinal = item.en_oferta && item.precio_oferta 
                  ? item.precio_oferta 
                  : item.precio;

                return (
                  <div key={`${item.id}-${item.talla}-${index}`} className="group flex flex-col relative animate-fadeIn">
                    
                    {/* Botón Eliminar (Sutil, esquina superior) */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromFavorites(item.id, item.talla);
                      }}
                      className="absolute top-0 right-0 z-20 p-3 text-gray-400 hover:text-black transition-colors duration-300 bg-transparent mix-blend-multiply"
                      aria-label="Eliminar"
                    >
                      <X size={18} strokeWidth={1.5} />
                    </button>

                    {/* Imagen con Aspect Ratio Vertical */}
                    <Link href={`/producto/${item.id}`} className="block overflow-hidden bg-gray-50 relative aspect-[3/4.2] mb-5">
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      {/* Overlay "Quick Add" solo en Desktop al hover */}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hidden lg:block" />
                    </Link>

                    {/* Información del Producto */}
                    <div className="flex flex-col grow">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <Link href={`/producto/${item.id}`}>
                          <h3 className="text-[11px] md:text-xs uppercase tracking-[0.1em] font-medium leading-relaxed hover:underline decoration-1 underline-offset-4 line-clamp-2">
                            {item.nombre}
                          </h3>
                        </Link>
                        
                        <div className="flex flex-col items-end shrink-0">
                          {item.en_oferta && item.precio_oferta ? (
                            <>
                              <span className="text-[11px] md:text-xs text-red-600 font-medium tracking-wide">
                                ${item.precio_oferta.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-gray-400 line-through decoration-gray-300">
                                ${item.precio.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="text-[11px] md:text-xs font-medium tracking-wide">
                              ${item.precio.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-end mt-auto pt-2">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                          {item.talla ? `Talla: ${item.talla}` : 'Talla única'}
                        </p>
                        
                        {/* Botón Añadir: Texto simple subrayado para mantener limpieza visual */}
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="text-[10px] uppercase tracking-widest font-semibold border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors"
                        >
                          + Añadir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}