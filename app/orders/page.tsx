"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";

interface OrderItem {
  id: number;
  nombre: string;
  imagen: string | null;
  talla: string | null;
  precio: number;
  cantidad: number;
}

interface Order {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  total: number;
  status: string;
  payment_method: string;
  shipping_method: string;
  created_at: string;
  items: OrderItem[];
}

// Componente de barra de progreso con iconos animados
const OrderStatusTracker = ({ status }: { status: string }) => {
  const statusSteps = [
    { key: "pendiente", label: "PENDIENTE", icon: Clock },
    { key: "procesando", label: "PROCESANDO", icon: Package },
    { key: "enviado", label: "ENVIADO", icon: Truck },
    { key: "entregado", label: "ENTREGADO", icon: CheckCircle }
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.key === status.toLowerCase());
  const isCancelled = status.toLowerCase() === "cancelado";

  if (isCancelled) {
    return (
      <div className="w-full border border-red-200 p-6 mb-6">
        <div className="flex items-center gap-3 text-red-600">
          <XCircle size={20} className="animate-spin-slow" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider">Pedido Cancelado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      {/* Línea de progreso superior */}
      <div className="relative mb-6">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-200 -translate-y-1/2" />
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            // Animaciones específicas para cada icono según su estado
            const getIconAnimation = () => {
              if (!isActive) return "";
              if (step.key === "pendiente" && isCurrent) return "animate-pulse-slow";
              if (step.key === "procesando" && isCurrent) return "animate-spin-slow";
              if (step.key === "enviado" && isCurrent) return "animate-slide";
              if (step.key === "entregado" && isCurrent) return "animate-bounce-subtle";
              if (isActive && !isCurrent) return "animate-pulse-once";
              return "";
            };
            
            return (
              <div key={step.key} className="flex flex-col items-center bg-white px-1">
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 transition-all duration-500 ${
                  isActive ? 'text-black' : 'text-gray-300'
                }`}>
                  <Icon size={18} className={getIconAnimation()} />
                  {/* Pequeño indicador de actividad para el estado actual */}
                  {isCurrent && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full animate-ping-slow" />
                  )}
                </div>
                <p className={`text-[9px] font-medium uppercase tracking-wider mt-2 transition-colors duration-500 ${
                  isActive ? 'text-black' : 'text-gray-300'
                }`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Mensaje de estado con animación */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider text-center flex items-center justify-center gap-2">
          {status === "pendiente" && (
            <>
              <Clock size={12} className="animate-pulse-slow" />
              ESPERANDO CONFIRMACIÓN
            </>
          )}
          {status === "procesando" && (
            <>
              <Package size={12} className="animate-spin-slow" />
              PREPARANDO PEDIDO
            </>
          )}
          {status === "enviado" && (
            <>
              <Truck size={12} className="animate-slide" />
              EN CAMINO A TU DOMICILIO
            </>
          )}
          {status === "entregado" && (
            <>
              <CheckCircle size={12} className="animate-bounce-subtle" />
              ENTREGADO GRACIAS POR TU COMPRA
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default function AllOrdersDetailedPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<{ [key: number]: boolean }>({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [orderStatuses, setOrderStatuses] = useState<{ [key: number]: string }>({});
  const [animateStatus, setAnimateStatus] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length === 0 || !isAuthenticated) return;
    
    const checkStatusUpdates = async () => {
      try {
        const updates = await Promise.all(
          orders.map(async (order) => {
            try {
              const res = await axios.get(`/api/pedidos/${order.id}/estado`);
              return { id: order.id, status: res.data.status };
            } catch (err) {
              return { id: order.id, status: order.status };
            }
          })
        );
        
        let hasUpdates = false;
        updates.forEach(({ id, status }) => {
          if (orderStatuses[id] !== status) {
            setAnimateStatus(prev => ({ ...prev, [id]: true }));
            setTimeout(() => {
              setAnimateStatus(prev => ({ ...prev, [id]: false }));
            }, 2000);
            
            setOrderStatuses(prev => ({ ...prev, [id]: status }));
            
            // Toast minimalista con animación
            toast.custom((t) => (
              <div className="bg-white border border-gray-200 px-4 py-3 shadow-sm flex items-center gap-3 animate-fade-in">
                <div className={`w-1 h-8 ${
                  status === "cancelado" ? "bg-red-500" :
                  status === "entregado" ? "bg-green-500" :
                  status === "enviado" ? "bg-yellow-500" :
                  status === "procesando" ? "bg-blue-500" :
                  "bg-gray-500"
                }`} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider">Pedido #{id}</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider">{getStatusText(status)}</p>
                </div>
              </div>
            ), { duration: 4000 });
            
            hasUpdates = true;
          }
        });
        
        if (hasUpdates) {
          setOrders(prev => prev.map(o => ({ 
            ...o, 
            status: updates.find(u => u.id === o.id)?.status || o.status 
          })));
        }
      } catch (e) { console.error(e); }
    };
    
    const interval = setInterval(checkStatusUpdates, 5000);
    return () => clearInterval(interval);
  }, [orders.length, isAuthenticated, orderStatuses]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { setIsAuthenticated(false); setLoading(false); return; }
      setIsAuthenticated(true);
      const res = await axios.get('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } });
      setOrders(res.data);
      const statusMap: any = {};
      res.data.forEach((o: Order) => { statusMap[o.id] = o.status; });
      setOrderStatuses(statusMap);
    } catch (err: any) {
      if (err.response?.status === 401) setIsAuthenticated(false);
      else setError("ERROR AL CARGAR PEDIDOS");
    } finally { setLoading(false); }
  };

  const getStatusText = (status: string) => {
    const texts: any = { 
      pendiente: 'PENDIENTE', 
      procesando: 'PROCESANDO', 
      enviado: 'ENVIADO', 
      entregado: 'ENTREGADO', 
      cancelado: 'CANCELADO' 
    };
    return texts[status.toLowerCase()] || status.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", { 
      year: "numeric", 
      month: "2-digit", 
      day: "2-digit" 
    }).replace(/\//g, '.');
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-24 md:pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          
          <header className="mb-12 border-b border-gray-200 pb-6">
            <h1 className="text-2xl md:text-3xl font-light uppercase tracking-[0.2em]">Mis Pedidos</h1>
            <p className="text-[9px] text-gray-400 tracking-widest mt-2 uppercase">{orders.length} PEDIDOS</p>
          </header>

          {!isAuthenticated ? (
            <div className="py-20 text-center">
              <h2 className="text-xs uppercase tracking-widest mb-6 font-light">Acceso requerido</h2>
              <Link href="/login" className="inline-block border border-black px-8 py-3 text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-300">
                Iniciar sesión
              </Link>
            </div>
          ) : (
            <div className="space-y-0">
              {orders.map((order) => {
                const isExpanded = expandedOrders[order.id];
                const isAnimating = animateStatus[order.id];
                
                const StatusIcon = 
                  order.status.toLowerCase() === "cancelado" ? XCircle :
                  order.status.toLowerCase() === "entregado" ? CheckCircle :
                  order.status.toLowerCase() === "enviado" ? Truck :
                  order.status.toLowerCase() === "procesando" ? Package : Clock;
                
                // Animación para el icono del estado en el header
                const getHeaderIconAnimation = () => {
                  if (order.status.toLowerCase() === "enviado") return "animate-slide";
                  if (order.status.toLowerCase() === "procesando") return "animate-spin-slow";
                  if (order.status.toLowerCase() === "pendiente") return "animate-pulse-slow";
                  if (order.status.toLowerCase() === "entregado") return "animate-bounce-subtle";
                  if (order.status.toLowerCase() === "cancelado") return "animate-spin-slow";
                  return "";
                };
                
                return (
                  <div 
                    key={order.id} 
                    className={`border-b border-gray-100 transition-all duration-500 ${
                      isAnimating ? 'bg-gray-50' : ''
                    }`}
                  >
                    <button 
                      onClick={() => setExpandedOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                      className="w-full py-6 flex justify-between items-center text-left hover:bg-gray-50 transition-colors duration-300 px-2 -mx-2"
                    >
                      <div className="space-y-1">
                        <span className="block text-xs font-medium uppercase tracking-wide">PEDIDO #{order.id}</span>
                        <span className="block text-[9px] text-gray-400 tracking-widest">{formatDate(order.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-sm font-light">${order.total.toLocaleString()}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <StatusIcon size={12} className={`${
                              order.status.toLowerCase() === "cancelado" ? "text-red-500" :
                              order.status.toLowerCase() === "entregado" ? "text-green-500" :
                              order.status.toLowerCase() === "enviado" ? "text-yellow-600" :
                              order.status.toLowerCase() === "procesando" ? "text-blue-500" :
                              "text-gray-400"
                            } ${getHeaderIconAnimation()}`} />
                            <span className="text-[9px] font-medium tracking-[0.15em] uppercase">{getStatusText(order.status)}</span>
                          </div>
                          <svg className={`w-3 h-3 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    <div className={`overflow-hidden transition-all duration-700 ease-in-out ${
                      isExpanded ? 'max-h-[5000px] opacity-100 pb-10' : 'max-h-0 opacity-0'
                    }`}>
                      
                      {/* TRACKER DE ESTADO CON ICONOS ANIMADOS */}
                      <div className="mb-8 px-2">
                        <OrderStatusTracker status={order.status} />
                      </div>
                      
                      {/* Grid de Productos */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="group">
                            <div className="bg-[#f5f5f5] aspect-[2/3] mb-3 overflow-hidden">
                              {item.imagen ? (
                                <img 
                                  src={item.imagen} 
                                  alt={item.nombre} 
                                  className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400 uppercase">
                                  Sin imagen
                                </div>
                              )}
                            </div>
                            <h3 className="text-[10px] font-medium uppercase tracking-wide mb-1">{item.nombre}</h3>
                            <p className="text-[8px] text-gray-500 uppercase tracking-wider">
                              {item.talla && `TALLA ${item.talla} · `}{item.cantidad} UNIDAD{item.cantidad > 1 ? 'ES' : ''}
                            </p>
                            <p className="text-[10px] font-light mt-2">${(item.precio * item.cantidad).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>

                      {/* Detalles de envío y pago */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[9px] uppercase tracking-wider border-t border-gray-100 pt-6">
                        <div>
                          <p className="font-medium mb-3 text-black/60">ENVÍO</p>
                          <div className="space-y-1 text-gray-500 leading-relaxed">
                            <p className="text-black font-medium">{order.nombre}</p>
                            <p>{order.direccion}</p>
                            <p>{order.ciudad}, {order.estado} CP {order.codigo_postal}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium mb-3 text-black/60">PAGO</p>
                          <div className="space-y-2 text-gray-500">
                            <p>{order.payment_method === "mercadopago" ? "MERCADO PAGO" : "TRANSFERENCIA"}</p>
                            <p>{order.shipping_method === "express" ? "ENVÍO EXPRESS" : "ENVÍO ESTÁNDAR"}</p>
                          </div>
                        </div>

                        <div>
                          <p className="font-medium mb-3 text-black/60">RESUMEN</p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-gray-500">
                              <span>Subtotal</span>
                              <span>${(order.total - (order.shipping_method === "express" ? 149 : 99)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span>Envío</span>
                              <span>${order.shipping_method === "express" ? "149" : "99"}</span>
                            </div>
                            <div className="flex justify-between text-black font-medium pt-3 border-t border-gray-200 mt-2">
                              <span>Total</span>
                              <span>${order.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Estilos personalizados para animaciones */}
      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(-3px); }
          50% { transform: translateX(3px); }
          100% { transform: translateX(-3px); }
        }
        .animate-slide {
          animation: slide 1.5s ease-in-out infinite;
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 1.5s ease-in-out infinite;
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out infinite;
        }
        
        @keyframes ping-slow {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        @keyframes pulse-once {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        .animate-pulse-once {
          animation: pulse-once 1s ease-in-out;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}