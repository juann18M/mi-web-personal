// context/FavoritesContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface FavoriteItem {
  id: number;
  nombre: string;
  marca: string;
  precio: number;
  precio_oferta: number | null;
  en_oferta: boolean;
  imagen: string;
  talla?: string | null;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: number, talla?: string | null) => void;
  isInFavorites: (id: number, talla?: string | null) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Cargar favoritos del localStorage al iniciar
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (item: FavoriteItem) => {
    setFavorites(prev => {
      // Verificar si ya existe (considerando talla)
      const exists = prev.some(fav => 
        fav.id === item.id && fav.talla === item.talla
      );
      
      if (exists) {
        // Si existe, lo removemos (toggle)
        return prev.filter(fav => 
          !(fav.id === item.id && fav.talla === item.talla)
        );
      } else {
        // Si no existe, lo agregamos
        return [...prev, item];
      }
    });
  };

  const removeFromFavorites = (id: number, talla?: string | null) => {
    setFavorites(prev => prev.filter(fav => 
      !(fav.id === id && fav.talla === talla)
    ));
  };

  const isInFavorites = (id: number, talla?: string | null) => {
    return favorites.some(fav => fav.id === id && fav.talla === talla);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isInFavorites,
      clearFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}