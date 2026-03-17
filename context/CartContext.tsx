'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  precio_original: number;
  imagen: string;
  talla?: string | null;
  cantidad: number;
  precio_normal: number;
  en_oferta?: boolean;
  precio_oferta?: number | null;
  precio_mayoreo_1?: number | null;
  cantidad_mayoreo_1?: number;
  precio_mayoreo_2?: number | null;
  cantidad_mayoreo_2?: number;
  precio_mayoreo_3?: number | null;
  cantidad_mayoreo_3?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, talla?: string | null) => void;
  increaseQuantity: (id: number, talla?: string | null) => void;
  decreaseQuantity: (id: number, talla?: string | null) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calcularPrecioUnitario = (item: CartItem, cantidad: number): number => {
  // Precio base
  const precioBase = item.en_oferta && item.precio_oferta 
    ? item.precio_oferta 
    : item.precio_normal;

  // Niveles de mayoreo
  const tiers = [
    { cantidad: item.cantidad_mayoreo_1, precio: item.precio_mayoreo_1 },
    { cantidad: item.cantidad_mayoreo_2, precio: item.precio_mayoreo_2 },
    { cantidad: item.cantidad_mayoreo_3, precio: item.precio_mayoreo_3 }
  ]
    .filter(tier => tier.cantidad && tier.precio && tier.cantidad > 0 && tier.precio > 0)
    .sort((a, b) => (b.cantidad || 0) - (a.cantidad || 0));

  for (const tier of tiers) {
    if (cantidad >= (tier.cantidad || 0)) {
      return tier.precio || precioBase;
    }
  }

  return precioBase;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(p => p.id === item.id && p.talla === item.talla);

      if (existing) {
        const newCantidad = existing.cantidad + item.cantidad;
        const nuevoPrecio = calcularPrecioUnitario(existing, newCantidad);
        
        return prev.map(p =>
          p.id === item.id && p.talla === item.talla
            ? { 
                ...p, 
                cantidad: newCantidad, 
                precio: nuevoPrecio,
                precio_original: p.precio_original // Mantener precio original
              }
            : p
        );
      }

      // Calcular precio inicial para esta cantidad
      const precioInicial = calcularPrecioUnitario(item, item.cantidad);
      
      return [...prev, { 
        ...item, 
        precio: precioInicial, // Este es el precio con descuento
        precio_original: item.precio_normal // Este es el precio sin descuento
      }];
    });
  };

  const increaseQuantity = (id: number, talla?: string | null) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === id && item.talla === talla) {
          const newCantidad = item.cantidad + 1;
          const nuevoPrecio = calcularPrecioUnitario(item, newCantidad);
          return { 
            ...item, 
            cantidad: newCantidad, 
            precio: nuevoPrecio,
            precio_original: item.precio_original // Mantener precio original
          };
        }
        return item;
      })
    );
  };

  const decreaseQuantity = (id: number, talla?: string | null) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id && i.talla === talla);
      
      if (item && item.cantidad === 1) {
        return prev.filter(i => !(i.id === id && i.talla === talla));
      }
      
      return prev.map(item => {
        if (item.id === id && item.talla === talla) {
          const newCantidad = item.cantidad - 1;
          const nuevoPrecio = calcularPrecioUnitario(item, newCantidad);
          return { 
            ...item, 
            cantidad: newCantidad, 
            precio: nuevoPrecio,
            precio_original: item.precio_original // Mantener precio original
          };
        }
        return item;
      });
    });
  };

  const removeFromCart = (id: number, talla?: string | null) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.talla === talla)));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}