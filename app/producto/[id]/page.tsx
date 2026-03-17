'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import axios from 'axios';
import { ArrowLeft, Heart, Share2, Minus, Plus, Tag, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface Product {
  id: number;
  nombre: string;
  marca: string;
  descripcion?: string;
  precio: number;
  precio_oferta: number | null;
  en_oferta: boolean;
  stock: number;
  imagen: string;
  imagenes_adicionales?: string[];
  videos?: string[];
  talla?: string;
  color?: string;
  colores_disponibles?: string[];
  precio_mayoreo_1?: number | null;
  cantidad_mayoreo_1?: number;
  precio_mayoreo_2?: number | null;
  cantidad_mayoreo_2?: number;
  precio_mayoreo_3?: number | null;
  cantidad_mayoreo_3?: number;
}

export default function ProductoDetalle() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToFavorites, isInFavorites } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [showFavoriteAlert, setShowFavoriteAlert] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [showShareAlert, setShowShareAlert] = useState(false);
  
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    if (!id) return;

    axios
      .get(`/api/productos/${id}`)
      .then((res) => {
        console.log('Producto recibido - DATOS COMPLETOS:', res.data);
        console.log('imagen principal:', res.data.imagen);
        console.log('imagenes_adicionales:', res.data.imagenes_adicionales);
        setProduct(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar producto:', error);
        setLoading(false);
      });
  }, [id]);

  // Función mejorada para obtener todos los medios
  const getAllMedia = () => {
    if (!product) return [];
    
    const media = [];
    const urlsVistas = new Set(); // Para evitar duplicados
    
    // Función para normalizar URLs (quitar / inicial para comparar)
    const normalizarUrl = (url: string) => {
      return url.startsWith('/') ? url.substring(1) : url;
    };
    
    // Imagen principal - guardamos la versión original para mostrar
    if (product.imagen) {
      const urlNormalizada = normalizarUrl(product.imagen);
      media.push({ type: 'image', url: product.imagen }); // Usamos la original
      urlsVistas.add(urlNormalizada);
      console.log('Imagen principal añadida:', product.imagen);
    }
    
    // Imágenes adicionales - Verificar que sea un array
    if (product.imagenes_adicionales && Array.isArray(product.imagenes_adicionales)) {
      console.log('Imágenes adicionales desde DB:', product.imagenes_adicionales);
      
      product.imagenes_adicionales.forEach(url => {
        if (url && typeof url === 'string') {
          const urlNormalizada = normalizarUrl(url);
          // Verificar si ya existe (comparando sin la / inicial)
          if (!urlsVistas.has(urlNormalizada)) {
            // Asegurar que la URL tenga / al inicio para mostrarla
            const urlParaMostrar = url.startsWith('/') ? url : `/${url}`;
            media.push({ type: 'image', url: urlParaMostrar });
            urlsVistas.add(urlNormalizada);
            console.log('Imagen adicional añadida:', urlParaMostrar);
          } else {
            console.log('Imagen duplicada omitida:', url);
          }
        }
      });
    }
    
    // Videos - Verificar que sea un array
    if (product.videos && Array.isArray(product.videos)) {
      product.videos.forEach(url => {
        if (url && typeof url === 'string') {
          const urlNormalizada = normalizarUrl(url);
          if (!urlsVistas.has(urlNormalizada)) {
            const urlParaMostrar = url.startsWith('/') ? url : `/${url}`;
            media.push({ type: 'video', url: urlParaMostrar });
            urlsVistas.add(urlNormalizada);
          }
        }
      });
    }
    
    console.log('Media final generada:', media);
    return media;
  };

  const allMedia = getAllMedia();
  const hasMultipleMedia = allMedia.length > 1;

  // Resetear índice cuando cambia el producto
  useEffect(() => {
    setCurrentMediaIndex(0);
    setIsVideoPlaying(false);
  }, [id]);

  const nextMedia = () => {
    if (allMedia.length > 0) {
      setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
      setIsVideoPlaying(false);
    }
  };

  const prevMedia = () => {
    if (allMedia.length > 0) {
      setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
      setIsVideoPlaying(false);
    }
  };

  const calcularPrecioUnitario = () => {
    if (!product) return 0;

    const precioBase = product.en_oferta && product.precio_oferta && product.precio_oferta > 0
      ? product.precio_oferta 
      : product.precio;

    const tiers = [
      { cantidad: product.cantidad_mayoreo_1, precio: product.precio_mayoreo_1 },
      { cantidad: product.cantidad_mayoreo_2, precio: product.precio_mayoreo_2 },
      { cantidad: product.cantidad_mayoreo_3, precio: product.precio_mayoreo_3 }
    ].filter(tier => tier.cantidad && tier.precio && tier.cantidad > 0 && tier.precio > 0)
     .sort((a, b) => (b.cantidad || 0) - (a.cantidad || 0));

    for (const tier of tiers) {
      if (quantity >= (tier.cantidad || 0)) {
        return tier.precio || precioBase;
      }
    }

    return precioBase;
  };

  const precioUnitario = calcularPrecioUnitario();
  const precioTotal = precioUnitario * quantity;
  const precioOriginal = product?.precio || 0;
  const ahorroPorUnidad = precioOriginal - precioUnitario;
  const ahorroTotal = ahorroPorUnidad * quantity;
  const tieneDescuentoMayoreo = ahorroPorUnidad > 0;

  const getTierAplicado = () => {
    if (!product) return null;
    
    const tiers = [
      { cantidad: product.cantidad_mayoreo_1, precio: product.precio_mayoreo_1 },
      { cantidad: product.cantidad_mayoreo_2, precio: product.precio_mayoreo_2 },
      { cantidad: product.cantidad_mayoreo_3, precio: product.precio_mayoreo_3 }
    ].filter(tier => tier.cantidad && tier.precio && tier.cantidad > 0 && tier.precio > 0)
     .sort((a, b) => (b.cantidad || 0) - (a.cantidad || 0));

    for (const tier of tiers) {
      if (quantity >= (tier.cantidad || 0)) {
        return tier;
      }
    }
    return null;
  };

  const tierAplicado = getTierAplicado();

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      nombre: product.nombre,
      precio: precioUnitario,
      precio_original: product.precio,
      imagen: product.imagen,
      talla: selectedSize || null,
      color: selectedColor || null,
      cantidad: quantity,
      precio_normal: product.precio,
      en_oferta: product.en_oferta,
      precio_oferta: product.precio_oferta,
      precio_mayoreo_1: product.precio_mayoreo_1,
      cantidad_mayoreo_1: product.cantidad_mayoreo_1,
      precio_mayoreo_2: product.precio_mayoreo_2,
      cantidad_mayoreo_2: product.cantidad_mayoreo_2,
      precio_mayoreo_3: product.precio_mayoreo_3,
      cantidad_mayoreo_3: product.cantidad_mayoreo_3,
    });

    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const handleFavoriteClick = () => {
    if (!product) return;

    const tallasArray =
      product.talla && product.talla.trim() !== ''
        ? product.talla.split(',').map((t) => t.trim())
        : [];
    
    if (tallasArray.length > 0 && !selectedSize) {
      setFavoriteMessage('⚠️ Selecciona una talla primero');
      setShowFavoriteAlert(true);
      setTimeout(() => setShowFavoriteAlert(false), 2000);
      return;
    }

    addToFavorites({
      id: product.id,
      nombre: product.nombre,
      marca: product.marca,
      precio: product.precio,
      precio_oferta: product.precio_oferta,
      en_oferta: product.en_oferta,
      imagen: product.imagen,
      talla: selectedSize,
      color: selectedColor
    });

    const wasInFavorites = isInFavorites(product.id, selectedSize);
    
    setFavoriteMessage(wasInFavorites 
      ? '✓ Producto eliminado de favoritos' 
      : '✓ Producto agregado a favoritos');
    setShowFavoriteAlert(true);
    setTimeout(() => setShowFavoriteAlert(false), 2000);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShowShareAlert(true);
    setTimeout(() => setShowShareAlert(false), 2000);
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <span className="text-xs font-medium tracking-[0.3em] uppercase text-black">
          Cargando
        </span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white text-black">
        <h2 className="text-xl font-light uppercase tracking-widest mb-4">
          Producto no disponible
        </h2>
        <button
          onClick={() => router.back()}
          className="text-xs underline underline-offset-4 hover:opacity-50 transition"
        >
          VOLVER
        </button>
      </div>
    );
  }

  const outOfStock = product.stock === 0;
  const tallasArray = product.talla ? product.talla.split(',').map((t) => t.trim()) : [];
  const requiresSize = tallasArray.length > 0;
  const requiresColor = product.colores_disponibles && product.colores_disponibles.length > 0;

  const currentMedia = allMedia[currentMediaIndex] || { type: 'image', url: product.imagen };

  return (
    <>
      <Navbar />

      {/* ALERTAS */}
      {showAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-3 rounded-lg text-sm shadow-2xl animate-fadeIn">
          ✓ Producto añadido al carrito
        </div>
      )}
      {showFavoriteAlert && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-3 rounded-lg text-sm shadow-2xl animate-fadeIn">
          {favoriteMessage}
        </div>
      )}
      {showShareAlert && (
        <div className="fixed top-40 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-3 rounded-lg text-sm shadow-2xl animate-fadeIn">
          ✓ Enlace copiado al portapapeles
        </div>
      )}

      <main className="min-h-screen bg-white text-black font-sans pt-20">
        <div className="flex flex-col lg:flex-row w-full min-h-screen">
          
          {/* SECCIÓN DE MEDIOS - ESTILO MERCADO LIBRE */}
          <div className="w-full lg:w-[70%] min-h-[50vh] lg:min-h-screen bg-white flex flex-col items-center justify-start px-4 relative order-1">
            {outOfStock && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40">
                <span className="text-3xl font-bold uppercase tracking-widest text-black/20 border-2 border-black/20 p-4 -rotate-12">
                  Agotado
                </span>
              </div>
            )}

          {/* VISUALIZADOR PRINCIPAL */}
<div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[75vh] flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden group">
  
  {currentMedia.type === 'image' ? (
    <img
      src={currentMedia.url}
      alt={product.nombre || "Producto"}
      className="w-full h-full object-contain p-2 md:p-4"
    />
  ) : (
    <div className="relative w-full h-full flex items-center justify-center p-2 md:p-4">
      {/* Detectar si es YouTube */}
      {currentMedia.url.includes('youtube') || currentMedia.url.includes('youtu.be') ? (
        <div className="relative w-full max-w-5xl aspect-video rounded-lg overflow-hidden shadow-sm">
          <iframe
            src={getYouTubeEmbedUrl(currentMedia.url)}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        // VIDEO LOCAL
        <video
          src={currentMedia.url}
          className="w-full h-full object-contain rounded-lg"
          controls
          controlsList="nodownload"
          onPlay={() => setIsVideoPlaying(true)}
          onPause={() => setIsVideoPlaying(false)}
          poster={product.imagen}
        >
          Tu navegador no soporta el elemento de video.
        </video>
      )}
    </div>
  )}

  {/* CONTROLES DEL CARRUSEL */}
  {hasMultipleMedia && (
    <>
      <button
        onClick={prevMedia}
        aria-label="Anterior"
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 md:p-3 rounded-full shadow-md transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-20 focus:outline-none focus:ring-2 focus:ring-black"
      >
        <ChevronLeft size={20} className="md:w-6 md:h-6" />
      </button>
      <button
        onClick={nextMedia}
        aria-label="Siguiente"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 md:p-3 rounded-full shadow-md transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-20 focus:outline-none focus:ring-2 focus:ring-black"
      >
        <ChevronRight size={20} className="md:w-6 md:h-6" />
      </button>
    </>
  )}

  {/* INDICADOR DE POSICIÓN */}
  {hasMultipleMedia && (
    <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium tracking-wide z-20 flex items-center gap-2 backdrop-blur-sm">
      <span>{currentMediaIndex + 1} / {allMedia.length}</span>
      {currentMedia.type === 'video' && (
        <>
          <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
          
        </>
      )}
    </div>
  )}
</div>

{/* MINIATURAS - CON VISTA PREVIA DE VIDEO */}
{hasMultipleMedia && (
  <div className="w-full overflow-x-auto py-4 snap-x snap-mandatory hide-scrollbar">
    <div className="flex gap-2 md:gap-3 justify-start md:justify-center px-4 md:px-0 min-w-max md:min-w-0">
      {allMedia.map((media, index) => (
        <button
          key={index}
          aria-label={`Ver miniatura ${index + 1}`}
          onClick={() => {
            setCurrentMediaIndex(index);
            setIsVideoPlaying(false);
          }}
          className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all snap-center focus:outline-none ${
            currentMediaIndex === index
              ? 'border-black scale-105 shadow-md z-10'
              : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-200'
          }`}
        >
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover bg-white"
            />
          ) : (
            <div className="relative w-full h-full bg-black">
              {media.url.includes('youtube') || media.url.includes('youtu.be') ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-600 rounded-full p-1.5 md:p-2 shadow-sm">
                    <Play size={14} className="text-white md:w-5 md:h-5" fill="currentColor" />
                  </div>
                </div>
              ) : (
                <>
                  <video
                    src={media.url}
                    className="w-full h-full object-cover opacity-80"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-colors hover:bg-black/10">
                    <div className="bg-white/90 rounded-full p-1.5 md:p-2 shadow-sm">
                      <Play size={12} className="text-black ml-0.5 md:w-4 md:h-4" fill="currentColor" />
                    </div>
                  </div>
                </>
              )}
              <span className="absolute bottom-1 right-1 bg-red-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10 backdrop-blur-sm">
                VID
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  </div>
)}

            {/* Mensaje informativo */}
            {!hasMultipleMedia && allMedia.length === 1 && (
              <div className="w-full py-2 text-center text-xs text-gray-400">
                1 imagen disponible
              </div>
            )}
          </div>

          {/* INFO - LATERAL DERECHO */}
          <div className="w-full lg:w-[30%] px-6 pb-12 lg:px-12 lg:pt-32 flex flex-col justify-start order-2 bg-white lg:min-h-screen lg:sticky lg:top-0">
            <div className="space-y-6">
              
              <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] uppercase tracking-widest hover:opacity-50">
                <ArrowLeft size={14} /> Volver
              </button>

              <span className="text-xs uppercase tracking-widest text-gray-400">{product.marca}</span>

              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-normal uppercase tracking-wide">{product.nombre}</h1>
                <button onClick={handleFavoriteClick} className={`transition-colors ${
                  isInFavorites(product.id, selectedSize) ? 'text-red-500' : 'text-black hover:text-red-500'
                }`} disabled={outOfStock}>
                  <Heart size={20} strokeWidth={1.5} fill={isInFavorites(product.id, selectedSize) ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* PRECIOS */}
              <div className="text-sm tracking-wide flex flex-col gap-2">
                {tieneDescuentoMayoreo ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-[#c00] font-medium text-lg">MXN {precioUnitario.toLocaleString()}</span>
                      <span className="line-through text-gray-400 text-xs">MXN {precioOriginal.toLocaleString()}</span>
                      <span className="text-[10px] border border-[#c00] text-[#c00] px-1 uppercase">
                        -{Math.round((ahorroPorUnidad / precioOriginal) * 100)}%
                      </span>
                    </div>
                    {tierAplicado && (
                      <div className="flex items-center gap-1 text-[10px] text-[#c00] bg-red-50 p-2 rounded">
                        <Tag size={12} />
                        <span className="uppercase tracking-wider">Descuento por {tierAplicado.cantidad}+ unidades</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {product.en_oferta && product.precio_oferta && product.precio_oferta > 0 ? (
                      <div className="flex items-center gap-3">
                        <span className="text-[#c00] font-medium text-lg">MXN {product.precio_oferta.toLocaleString()}</span>
                        <span className="line-through text-gray-400 text-xs">MXN {product.precio.toLocaleString()}</span>
                        <span className="text-[10px] border border-[#c00] text-[#c00] px-1 uppercase">Sale</span>
                      </div>
                    ) : (
                      <span className="font-medium text-lg">MXN {product.precio.toLocaleString()}</span>
                    )}
                  </>
                )}
                <span className="text-[10px] text-gray-400 uppercase">Incluye impuestos</span>
              </div>

              {/* CANTIDAD */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Cantidad</span>
                  <span className="text-[10px] text-gray-400">Stock: {product.stock}</span>
                </div>
                <div className="flex items-center border border-gray-300 w-fit">
                  <button onClick={decrementQuantity} disabled={quantity <= 1 || outOfStock} className="px-4 py-2 hover:bg-gray-100 transition disabled:opacity-30">
                    <Minus size={14} />
                  </button>
                  <span className="w-16 text-center text-sm font-medium">{quantity}</span>
                  <button onClick={incrementQuantity} disabled={quantity >= product.stock || outOfStock} className="px-4 py-2 hover:bg-gray-100 transition disabled:opacity-30">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* TABLA DE MAYOREO */}
              {([product.cantidad_mayoreo_1, product.cantidad_mayoreo_2, product.cantidad_mayoreo_3].some(c => c && c > 0)) && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Precios por mayoreo</p>
                  <div className="space-y-1">
                    {product.cantidad_mayoreo_1 && product.precio_mayoreo_1 && (
                      <div className={`flex justify-between text-[11px] ${quantity >= product.cantidad_mayoreo_1 ? 'text-black font-medium' : 'text-gray-400'}`}>
                        <span>{product.cantidad_mayoreo_1}+ unidades:</span>
                        <span>MXN {product.precio_mayoreo_1.toLocaleString()} c/u</span>
                      </div>
                    )}
                    {product.cantidad_mayoreo_2 && product.precio_mayoreo_2 && (
                      <div className={`flex justify-between text-[11px] ${quantity >= product.cantidad_mayoreo_2 ? 'text-black font-medium' : 'text-gray-400'}`}>
                        <span>{product.cantidad_mayoreo_2}+ unidades:</span>
                        <span>MXN {product.precio_mayoreo_2.toLocaleString()} c/u</span>
                      </div>
                    )}
                    {product.cantidad_mayoreo_3 && product.precio_mayoreo_3 && (
                      <div className={`flex justify-between text-[11px] ${quantity >= product.cantidad_mayoreo_3 ? 'text-black font-medium' : 'text-gray-400'}`}>
                        <span>{product.cantidad_mayoreo_3}+ unidades:</span>
                        <span>MXN {product.precio_mayoreo_3.toLocaleString()} c/u</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* RESUMEN DE AHORRO */}
              {tieneDescuentoMayoreo && (
                <div className="pt-2 border-t border-gray-100 bg-gray-50 p-3 rounded">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Precio unitario:</span>
                    <span className="font-medium">MXN {precioUnitario.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-600">Total ({quantity} unidades):</span>
                    <span className="font-bold">MXN {precioTotal.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-dashed border-gray-300">
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>Sin descuento:</span>
                      <span className="line-through">MXN {(precioOriginal * quantity).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[#c00] font-medium mt-1">
                      <span>Ahorras:</span>
                      <span>MXN {ahorroTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* DESCRIPCIÓN */}
              {product.descripcion && (
                <p className="text-xs leading-relaxed text-gray-600 text-justify border-t border-gray-100 pt-4">
                  {product.descripcion}
                </p>
              )}

              {/* TALLAS */}
              {requiresSize && (
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Seleccionar Talla</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {tallasArray.map((size) => (
                      <button key={size} disabled={outOfStock} onClick={() => setSelectedSize(size)}
                        className={`h-9 text-[11px] border uppercase transition-all duration-200 ${
                          selectedSize === size ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black hover:bg-black hover:text-white'
                        } ${outOfStock ? 'border-gray-100 text-gray-300 cursor-not-allowed' : ''}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COLORES DISPONIBLES */}
              {requiresColor && product.colores_disponibles && (
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Seleccionar Color</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colores_disponibles.map((color) => (
                      <button
                        key={color}
                        disabled={outOfStock}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 text-[11px] border uppercase transition-all duration-200 ${
                          selectedColor === color
                            ? 'bg-black text-white border-black'
                            : 'border-gray-300 hover:border-black hover:bg-black hover:text-white'
                        } ${outOfStock ? 'border-gray-100 text-gray-300 cursor-not-allowed' : ''}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* BOTÓN PRINCIPAL */}
              <div className="pt-4 space-y-3">
                <button onClick={handleAddToCart} disabled={outOfStock || (requiresSize && !selectedSize)}
                  className={`w-full py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                    outOfStock || (requiresSize && !selectedSize) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-zinc-800'
                  }`}>
                  {outOfStock ? 'Agotado' : requiresSize && !selectedSize ? 'Selecciona una talla' : `Añadir · MXN ${precioTotal.toLocaleString()}`}
                </button>

                <div className="flex gap-4 justify-center pt-2">
                  <button onClick={handleShare} className="flex items-center gap-2 text-[10px] uppercase tracking-widest hover:opacity-50">
                    <Share2 size={14} /> Compartir
                  </button>
                </div>
              </div>

              {/* INFO EXTRA */}
              <div className="pt-6 text-[10px] text-gray-400 uppercase tracking-widest">
                <p>Ref: {product.id}</p>
                {product.color && <p>Color: {product.color}</p>}
                {product.stock > 0 && product.stock < 5 && (
                  <p className="text-[#d87c4f] mt-1">¡Pocas unidades!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}