'use client';

import { useState, useEffect } from 'react';
import { SUBCATEGORIAS } from '../../../constants/subcategorias';
import { TIPOS_ARETES } from '../../../constants/tiposAretes';

interface FiltersProps {
  filters?: {
    categoria: string;
    subcategoria: string;
    tipo_arete: string;
    sort: string;
    marca: string;
  };
  onFilterChange: (filters: any) => void;

  categoriasVisibles?: string[]; // 👈 NUEVO
}

export default function Filters({ 
  filters, 
  onFilterChange, 
  categoriasVisibles = ['todos', 'hombre', 'mujer', 'accesorios'] 
}: FiltersProps) {
  // Valores por defecto si filters es undefined
  const defaultFilters = {
    categoria: 'todos',
    subcategoria: 'todos',
    tipo_arete: 'todos',
    sort: 'default',
    marca: 'todos'
  };

  // Usar filters o defaultFilters
  const currentFilters = filters || defaultFilters;

  const [selectedCategoria, setSelectedCategoria] = useState(currentFilters.categoria);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState(currentFilters.subcategoria);
  const [selectedTipoArete, setSelectedTipoArete] = useState(currentFilters.tipo_arete);

  // Actualizar estado local cuando cambian los props
  useEffect(() => {
    if (filters) {
      setSelectedCategoria(filters.categoria);
      setSelectedSubcategoria(filters.subcategoria);
      setSelectedTipoArete(filters.tipo_arete);
    }
  }, [filters]);

  const handleCategoriaChange = (categoria: string) => {
    setSelectedCategoria(categoria);
    onFilterChange({
      ...currentFilters,
      categoria,
      subcategoria: 'todos',
      tipo_arete: 'todos'
    });
  };

  const handleSubcategoriaChange = (subcategoria: string) => {
    setSelectedSubcategoria(subcategoria);
    onFilterChange({
      ...currentFilters,
      subcategoria,
      tipo_arete: 'todos'
    });
  };

  const handleTipoAreteChange = (tipo_arete: string) => {
    setSelectedTipoArete(tipo_arete);
    onFilterChange({
      ...currentFilters,
      tipo_arete
    });
  };

  const categoriaNombres = {
    'todos': 'Todos los productos',
    'hombre': 'Caballero',
    'mujer': 'Dama',
    'accesorios': 'Accesorios'
  };

  // Función para obtener las subcategorías según la categoría seleccionada
  const getSubcategorias = () => {
    switch(selectedCategoria) {
      case 'hombre':
        return SUBCATEGORIAS.hombre;
      case 'mujer':
        return SUBCATEGORIAS.mujer;
      case 'accesorios':
        return SUBCATEGORIAS.accesorios;
      default:
        return [];
    }
  };

  const subcategoriasDisponibles = [
  ...new Set(getSubcategorias())
];

  return (
    <div className="space-y-8">
      {/* Categorías principales */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-4">Categoría</h3>
        <div className="space-y-2">
         {categoriasVisibles.map((cat) => (
            <label key={cat} className="flex items-center gap-3 text-sm cursor-pointer group">
              <input
                type="radio"
                name="categoria"
                value={cat}
                checked={selectedCategoria === cat}
                onChange={(e) => handleCategoriaChange(e.target.value)}
                className="w-4 h-4 accent-black"
              />
              <span className="group-hover:text-black/70 transition-colors">
                {categoriaNombres[cat as keyof typeof categoriaNombres]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Subcategorías - para TODAS las categorías (excepto 'todos') */}
      {selectedCategoria !== 'todos' && subcategoriasDisponibles.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider mb-4">
            {selectedCategoria === 'hombre' ? 'Tipo de Prenda' : 
             selectedCategoria === 'mujer' ? 'Tipo de Prenda' : 
             'Subcategoría'}
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            <label className="flex items-center gap-3 text-sm cursor-pointer group">
              <input
                type="radio"
                name="subcategoria"
                value="todos"
                checked={selectedSubcategoria === 'todos'}
                onChange={(e) => handleSubcategoriaChange(e.target.value)}
                className="w-4 h-4 accent-black"
              />
              <span className="group-hover:text-black/70 transition-colors">
                {selectedCategoria === 'hombre' ? 'Todas las prendas' :
                 selectedCategoria === 'mujer' ? 'Todas las prendas' :
                 'Todos los accesorios'}
              </span>
            </label>
            
            {subcategoriasDisponibles.map((sub) => (
              <label key={sub} className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="radio"
                  name="subcategoria"
                  value={sub}
                  checked={selectedSubcategoria === sub}
                  onChange={(e) => handleSubcategoriaChange(e.target.value)}
                  className="w-4 h-4 accent-black"
                />
                <span className="group-hover:text-black/70 transition-colors">
                  {sub}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Tipos específicos de areetes - solo para accesorios y subcategoria Aretes */}
      {selectedCategoria === 'accesorios' && selectedSubcategoria === 'Aretes' && (
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider mb-4">Tipo de Aretes</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 text-sm cursor-pointer group">
              <input
                type="radio"
                name="tipo_arete"
                value="todos"
                checked={selectedTipoArete === 'todos'}
                onChange={(e) => handleTipoAreteChange(e.target.value)}
                className="w-4 h-4 accent-black"
              />
              <span className="group-hover:text-black/70 transition-colors">
                Todos los tipos
              </span>
            </label>
            
            {TIPOS_ARETES.map((tipo) => (
              <label key={tipo} className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="radio"
                  name="tipo_arete"
                  value={tipo}
                  checked={selectedTipoArete === tipo}
                  onChange={(e) => handleTipoAreteChange(e.target.value)}
                  className="w-4 h-4 accent-black"
                />
                <span className="group-hover:text-black/70 transition-colors">
                  {tipo}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Ordenar */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-4">Ordenar por</h3>
        <select
          value={currentFilters.sort}
          onChange={(e) => onFilterChange({ ...currentFilters, sort: e.target.value })}
          className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-1 ring-black"
        >
          <option value="default">Predeterminado</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
          <option value="name_asc">Nombre: A-Z</option>
          <option value="name_desc">Nombre: Z-A</option>
        </select>
      </div>
    </div>
  );
}