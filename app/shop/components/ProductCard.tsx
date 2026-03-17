"use client";

import Link from "next/link";

interface Product {
  id: number;
  nombre: string;
  marca: string;
  precio: number;
  precio_oferta: number | null;
  en_oferta: boolean;
  stock: number;
  imagen: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const lowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock === 0;

  return (
    <Link href={`/producto/${product.id}`} className="group">
      <div className="flex flex-col">

        {/* Imagen */}
        <div className="relative w-full aspect-[4/5] bg-white flex items-center justify-center overflow-hidden">

          <img
            src={product.imagen || "https://via.placeholder.com/600x800?text=+"}
            alt={product.nombre}
            className={`h-[70%] w-auto object-contain transition-transform duration-500 ${
              outOfStock ? "opacity-40 grayscale" : ""
            }`}
          />

          {/* Badge elegante */}
          {!!product.en_oferta && !outOfStock && (
            <div className="absolute top-4 left-4">
              <span className="text-[9px] tracking-[0.5em] uppercase text-black border-b border-black/20 pb-0.5 px-0">
                Oferta
              </span>
            </div>
          )}

          {outOfStock && (
            <div className="absolute top-4 left-4">
              <span className="text-[10px] tracking-[0.35em] uppercase bg-black text-white px-3 py-1">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* Información */}
        <div className="flex flex-col gap-1 pt-4 px-1">

          <h3 className="text-[11px] tracking-[0.25em] uppercase text-black">
            {product.marca}
          </h3>

          <p className="text-[13px] text-black/70 font-light capitalize">
            {product.nombre.toLowerCase()}
          </p>

          <div className="mt-1 text-[13px] tracking-wide">
            {!!product.en_oferta && product.precio_oferta ? (
              <div className="flex gap-2 items-center">
                <span className="line-through text-black/50"> {/* Cambiado de /30 a /50 */}
                  ${product.precio}
                </span>
                <span className="text-red-600 font-medium">
                  ${product.precio_oferta}
                </span>
              </div>
            ) : (
              <span className="text-black font-medium">
                ${product.precio}
              </span>
            )}
          </div>

          {lowStock && !outOfStock && (
            <p className="text-[10px] text-black/40 italic mt-1 tracking-wide">
              Pocas unidades
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}