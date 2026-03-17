'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, User, ShoppingBag, X, Heart } from 'lucide-react';
import Link from "next/link";
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useRouter } from 'next/navigation';

// Función para normalizar URLs (agregar / al inicio si no tiene)
const normalizeUrl = (url: string) => {
  if (!url) return '';
  
  // Si ya es una URL completa (http), dejarla igual
  if (url.startsWith('http')) return url;
  
  // Si ya tiene /uploads al inicio, dejarla igual
  if (url.startsWith('/uploads')) return url;
  
  // Si empieza con uploads (sin /), agregar el /
  if (url.startsWith('uploads')) return `/${url}`;
  
  // Si no tiene ninguna de las anteriores, agregar /uploads/
  return `/uploads/${url}`;
};

// Ícono calcado de la imagen (círculo de puntos)
const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black shrink-0 mt-0.5">
    <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
    <circle cx="17.65" cy="6.34" r="1.5" fill="currentColor"/>
    <circle cx="20" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="17.65" cy="17.65" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="20" r="1.5" fill="currentColor"/>
    <circle cx="6.34" cy="17.65" r="1.5" fill="currentColor"/>
    <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="6.34" cy="6.34" r="1.5" fill="currentColor"/>
  </svg>
);

// Interface basada en tu tabla de SQL
interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
  marca?: string;
  en_oferta?: boolean;
}

type Message = {
  id: string;
  type: 'user' | 'bot';
  text: string;
  products?: Product[];
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cart } = useCart();
  const { favorites } = useFavorites();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Chat States
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. CARGAR PRODUCTOS REALES (Sync con tu DB)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/productos');
        if (res.ok) {
          const data = await res.json();
          console.log('Productos cargados en ChatBot:', data);
          setAllProducts(data);
        }
      } catch (error) {
        console.error("Error al sincronizar productos:", error);
      }
    };
    if (isSearchOpen) loadProducts();
  }, [isSearchOpen]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserEmail(payload.email);
      } catch (e) { console.error("Error decoding token", e); }
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = (isMenuOpen || isSearchOpen) ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen, isSearchOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const normalizeText = (text: string) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const knowledgeBase = {
    sucursales: '📍 BLACKS Centro: Calle Isidro Huarte #23 \n📍 BLACKS Centro: Calle Isidro Huarte #27 \n 📍 BLACKS Centro: Calle Isidro Huarte \n 📍 BLACKS Centro: Calle Santiago Tapia \n📍 BLACKS: Av Guadalupe Victoria \n 📍 BLACKS : Av Guadalupe Victoria\n Te esperamos con un Horario de Lunes a Sabado 9 AM a 8PM Domingos de 9AM a 6PM',
    envios: '🚚 Tenemos envíos a todo Morelia (3-5 días hábiles) Al realizar un Pedido se te hara llegar tu guia de rastreo.',
    devoluciones: '↩️ Tienes 3 días para devoluciones con etiqueta y empaque original.',
    pagos: '💳 Aceptamos Tarjetas, OXXO y Transferencia.'
  };

  // 2. BUSCADOR INTELIGENTE DINÁMICO
  const findAnswer = (query: string): { text: string; products?: Product[] } => {
    const q = normalizeText(query);
    
    // Filtro para OFERTAS (Incluso con errores como "oertas")
    if (q.includes('oferta') || q.includes('oerta') || q.includes('descuento') || q.includes('rebaja') || q.includes('promo')) {
        const inSale = allProducts.filter(p => p.en_oferta);
        return { 
            text: inSale.length > 0 ? `Estas son nuestras piezas con precio especial:` : `Por ahora no tenemos ofertas activas, pero mira lo más nuevo:`, 
            products: inSale.length > 0 ? inSale.slice(0, 8) : allProducts.slice(0, 6)
        };
    }

    // Búsqueda por palabras sueltas (Fuzzy Search)
    const searchWords = q.split(' ').filter(word => word.length > 2);
    const matched = allProducts.filter(p => {
        const productData = normalizeText(`${p.nombre} ${p.categoria} ${p.descripcion} ${p.marca || ''}`);
        // Verifica que TODAS las palabras buscadas existan en los datos del producto
        return searchWords.every(word => productData.includes(word));
    });

    if (matched.length > 0 && q.length > 2) {
      return { 
        text: `He encontrado estas piezas para ti:`, 
        products: matched.slice(0, 8) 
      };
    }

    // FAQ
    if (q.includes('donde') || q.includes('sucursal') || q.includes('ubicacion')) return { text: knowledgeBase.sucursales };
    if (q.includes('envio') || q.includes('tarda') || q.includes('costo')) return { text: knowledgeBase.envios };
    if (q.includes('pago') || q.includes('tarjeta') || q.includes('metodo')) return { text: knowledgeBase.pagos };
    if (q.includes('devolucion') || q.includes('cambio')) return { text: knowledgeBase.devoluciones };
    if (q.includes('hola') || q.includes('buen')) return { text: '¡Hola! Bienvenido a BLACKS. ¿Buscas alguna prenda o accesorio en especial?' };
    
    return { text: 'Perdona, no encontré resultados exactos. ¿Podrías intentar con otra palabra, como una categoría o marca?' };
  };

  const processQuery = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', text: text.trim() }]);
    setSearchQuery('');
    setIsLoading(true);

    setTimeout(() => {
      const result = findAnswer(text);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', text: result.text, products: result.products }]);
      setIsLoading(false);
    }, 600);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    processQuery(searchQuery);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setTimeout(() => { 
      setSearchQuery(''); 
      setMessages([]); 
    }, 300);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserEmail(null);
    setShowDropdown(false);
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* NAVBAR PRINCIPAL */}
      <nav className="fixed top-0 left-0 w-full z-[9999] bg-transparent transition-all duration-300">
        <div className="max-w-[1920px] mx-auto px-4 md:px-12 h-16 md:h-20 flex items-center justify-between">
          <div className="flex-1 flex items-center gap-4 md:gap-8">
            <button onClick={toggleMenu} className="p-1 -ml-1 hover:opacity-50 transition-opacity">
              <Menu size={24} strokeWidth={1.2} />
            </button>
            <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em]">
              <Link href="/" className="hover:opacity-50 transition-opacity">HOME</Link>
              <Link href="/shop" className="hover:opacity-50 transition-opacity">SHOP</Link>
              <Link href="/orders" className="hover:opacity-50 transition-opacity whitespace-nowrap">MIS PEDIDOS</Link>
            </div>
          </div>

          <div className="flex-none mx-2">
            <Link href="/">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-none hover:opacity-70 transition-opacity">BLACKS</h1>
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-end gap-2 md:gap-6">
            <button onClick={() => setIsSearchOpen(true)} className="flex items-center gap-2 group p-1">
              <span className="hidden md:block text-[11px] font-bold tracking-[0.2em] border-b border-transparent group-hover:border-black transition-all">BUSCAR</span>
              <Search size={18} strokeWidth={1.2} />
            </button>
            <Link href="/favoritos" className="relative p-1 hover:opacity-50 transition-opacity">
              <Heart size={20} strokeWidth={1.2} />
              {favorites.length > 0 && <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-black rounded-full" />}
            </Link>
            {/* Usuario en PC - entre corazón y cesta */}
            <div className="relative hidden sm:block">
              {!userEmail ? (
                <Link href="/login" className="p-1 block hover:opacity-50 transition-opacity"><User size={20} strokeWidth={1.2} /></Link>
              ) : (
                <button onClick={() => setShowDropdown(!showDropdown)} className="w-7 h-7 bg-zinc-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {userEmail.charAt(0).toUpperCase()}
                </button>
              )}
              {showDropdown && (
                <div className="absolute right-0 mt-4 bg-white border border-zinc-100 shadow-2xl p-5 min-w-[220px]">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Cuenta</p>
                  <p className="text-xs font-medium mb-4 truncate">{userEmail}</p>
                  <button onClick={handleLogout} className="text-[11px] uppercase tracking-widest font-bold text-red-600 hover:underline">Cerrar sesión</button>
                </div>
              )}
            </div>
            <Link href="/cart" className="relative p-1 hover:opacity-50 transition-opacity">
              <ShoppingBag size={20} strokeWidth={1.2} />
              <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-black text-white rounded-full w-4 h-4 flex items-center justify-center">
                {cart.reduce((total, item) => total + item.cantidad, 0)}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* OVERLAY DEL ASISTENTE VIRTUAL */}
      <div className={`fixed inset-0 z-[9998] bg-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSearchOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        {/* Botón X movido más abajo para no chocar con el logo */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10">
          <button onClick={closeSearch} className="p-2 hover:opacity-50 transition-opacity">
            <X size={44} strokeWidth={0.5} className="text-black" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-6 pt-48 pb-32 flex flex-col scrollbar-hide h-screen">
          {/* SECCIÓN DE SUGERENCIAS INICIALES */}
          {messages.length === 0 && (
            <div className="mt-auto mb-12 flex flex-col items-center">
               <p className="text-sm text-gray-400 mb-8 font-light italic">¿En qué puedo ayudarte hoy?</p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md px-4">
                 <button onClick={() => processQuery("Ver ofertas")} className="text-[10px] uppercase tracking-[0.2em] border border-gray-100 rounded-full px-6 py-4 hover:bg-black hover:text-white transition-all text-gray-500 font-bold"> Ver promociones</button>
                 <button onClick={() => processQuery("¿Dónde están ubicados?")} className="text-[10px] uppercase tracking-[0.2em] border border-gray-100 rounded-full px-6 py-4 hover:bg-black hover:text-white transition-all text-gray-500 font-bold">📍 Sucursales</button>
                 <button onClick={() => processQuery("¿Cuánto tarda el envío?")} className="text-[10px] uppercase tracking-[0.2em] border border-gray-100 rounded-full px-6 py-4 hover:bg-black hover:text-white transition-all text-gray-500 font-bold">Info de envíos</button>
                 <button onClick={() => processQuery("Métodos de pago")} className="text-[10px] uppercase tracking-[0.2em] border border-gray-100 rounded-full px-6 py-4 hover:bg-black hover:text-white transition-all text-gray-500 font-bold"> Métodos de pago</button>
               </div>
               <p className="mt-10 text-[9px] text-gray-300 uppercase tracking-[0.3em] font-medium">O busca algo como "Anillos de plata"</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`mb-10 flex w-full flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex gap-4 max-w-2xl ${msg.type === 'user' ? 'justify-end pr-4' : 'justify-start'}`}>
                {msg.type === 'bot' && <BotIcon />}
                <div className={`text-[15px] leading-relaxed ${msg.type === 'user' ? 'text-black font-medium' : 'text-gray-500 font-light whitespace-pre-line'}`}>
                  {msg.text}
                </div>
              </div>

              {/* RENDERIZADO DINÁMICO CON LINK FUNCIONAL */}
              {msg.products && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                  {msg.products.map((prod) => (
                    <Link 
                      key={prod.id} 
                      href={`/producto/${prod.id}`} 
                      onClick={closeSearch} 
                      className="w-full group cursor-pointer"
                    >
                      <div className="aspect-[3/4] bg-white-100 mb-3 overflow-hidden">
                        <img 
                          src={normalizeUrl(prod.imagen)} 
                          alt={prod.nombre} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            console.error('Error cargando imagen:', prod.imagen);
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                          }}
                        />
                      </div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest truncate">{prod.nombre}</h3>
                      <p className="text-[10px] text-gray-400 mt-1">${prod.precio} MXN</p>
                      <div className="mt-2 text-[8px] font-bold border-b border-black w-fit opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Ver detalle</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-4 mb-10">
              <BotIcon />
              <div className="flex gap-1.5 items-center h-6">
                <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
          <form onSubmit={handleSearch}>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full text-center text-[15px] text-gray-500 bg-transparent outline-none py-2 border-b border-transparent focus:border-gray-200 transition-colors"
              autoFocus
            />
          </form>
        </div>
      </div>

      {/* MENÚ MÓVIL - CON USUARIO DENTRO */}
      <div className={`fixed inset-0 z-[9998] bg-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="h-full flex flex-col max-w-[1920px] mx-auto px-6 py-6">
          <div className="flex justify-end items-center mb-12">
           
          </div>

          {/* SECCIÓN USUARIO EN MÓVIL */}
          <div className="mb-8 pb-6 border-b border-zinc-100">
            {!userEmail ? (
              <Link 
                href="/login" 
                className="inline-flex items-center gap-3 text-base font-medium hover:opacity-50 transition-opacity"
                onClick={toggleMenu}
              >
                <User size={20} strokeWidth={1.2} />
                INICIAR SESIÓN
              </Link>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-sm font-bold">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Conectado como:</p>
                    <p className="text-sm font-medium">{userEmail}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }} 
                  className="text-xs text-red-600 hover:text-red-700 font-medium ml-12"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          <nav className="flex flex-col gap-8">
            {[
              { label: 'HOME', href: '/' },
              { label: 'SHOP', href: '/shop' },
              { label: 'MIS PEDIDOS', href: '/orders' },
              { label: 'FAVORITOS', href: '/favoritos', count: favorites.length }
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-3xl font-light uppercase tracking-widest hover:opacity-50 transition-opacity flex items-center gap-3"
                onClick={toggleMenu}
              >
                {link.label}
                {link.count !== undefined && link.count > 0 && (
                  <span className="text-xs bg-black text-white rounded-full w-5 h-5 flex items-center justify-center">
                    {link.count}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pb-6">
            <p className="text-[10px] text-zinc-400 tracking-[0.2em]">© 2026 BLACKS BOUTIQUE </p>
          </div>
        </div>
      </div>
    </>
  );
}