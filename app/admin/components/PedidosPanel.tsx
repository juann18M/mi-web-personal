'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

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
  user_id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  total: number;
  status: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
  payment_method: string;
  shipping_method: string;
  created_at: string;
  items: OrderItem[];
}

export default function PedidosPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('orden');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    procesando: 0,
    enviados: 0,
    entregados: 0,
    cancelados: 0,
    ingresosHoy: 0
  });

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [selectedFilter, searchTerm, searchBy, fechaInicio, fechaFin, orders]);

  useEffect(() => {
    const checkNewOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await axios.get('/api/admin/pedidos/ultimo', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.data.hayNuevo) {
          toast.success('¡Nuevo pedido recibido!', {
            duration: 4000,
            position: 'top-center',
          });
          fetchOrders();
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Error checking new orders:', error);
      }
    };

    const interval = setInterval(checkNewOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('No hay sesión activa');
        return;
      }

      const res = await axios.get('/api/admin/pedidos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setOrders(res.data.orders || []);
      setStats(res.data.stats || {
        total: 0, pendientes: 0, procesando: 0, enviados: 0, entregados: 0, cancelados: 0, ingresosHoy: 0
      });
    } catch (error: any) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        toast.error('Sesión expirada, inicia sesión nuevamente');
      } else {
        toast.error('Error al cargar los pedidos');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (selectedFilter !== 'todos') {
      filtered = filtered.filter(order => order.status === selectedFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order => {
        switch (searchBy) {
          case 'orden': return order.id.toString().includes(searchTerm);
          case 'email': return order.email.toLowerCase().includes(searchTerm.toLowerCase());
          case 'nombre': return order.nombre.toLowerCase().includes(searchTerm.toLowerCase());
          case 'telefono': return order.telefono.includes(searchTerm);
          default: return true;
        }
      });
    }

    if (fechaInicio) {
      filtered = filtered.filter(order => new Date(order.created_at) >= new Date(fechaInicio));
    }
    if (fechaFin) {
      filtered = filtered.filter(order => new Date(order.created_at) <= new Date(fechaFin));
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.error('No hay sesión activa');

      await axios.patch(`/api/admin/pedidos/${orderId}`, 
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      toast.success(`Estado actualizado a ${getStatusText(newStatus)}`);
      
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
      );
      setOrders(updatedOrders);
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as Order['status'] });
      }
    } catch (error: any) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        toast.error('Sesión expirada, inicia sesión nuevamente');
      } else {
        toast.error('Error al actualizar el estado');
      }
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (order?.status !== 'entregado') return toast.error('Solo puedes eliminar pedidos entregados');
    if (!confirm('¿Eliminar este pedido completado? Esta acción no se puede deshacer.')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.error('No hay sesión activa');

      await axios.delete(`/api/admin/pedidos/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('Pedido eliminado correctamente');
      setOrders(orders.filter(order => order.id !== orderId));
      setSelectedOrder(null);
    } catch (error: any) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        toast.error('Sesión expirada, inicia sesión nuevamente');
      } else {
        toast.error('Error al eliminar el pedido');
      }
    }
  };

  const getStatusDotColor = (status: string) => {
    const styles = {
      pendiente: 'bg-yellow-400',
      procesando: 'bg-blue-400',
      enviado: 'bg-purple-400',
      entregado: 'bg-green-400',
      cancelado: 'bg-red-400'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-300';
  };

  const getStatusText = (status: string) => {
    const texts = { pendiente: 'Pendiente', procesando: 'Procesando', enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado' };
    return texts[status as keyof typeof texts] || status;
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 text-gray-900 bg-white min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 font-sans">
      
      {/* Dashboard de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-px bg-gray-200 border border-gray-200">
        <div className="bg-white p-4 lg:p-5 flex flex-col justify-between">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 lg:mb-2">Total</p>
          <p className="text-xl lg:text-2xl font-light">{stats?.total ?? 0}</p>
        </div>
        <div className="bg-white p-4 lg:p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 truncate">Pendientes</p>
          </div>
          <p className="text-xl lg:text-2xl font-light">{stats?.pendientes ?? 0}</p>
        </div>
        <div className="bg-white p-4 lg:p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 truncate">Procesando</p>
          </div>
          <p className="text-xl lg:text-2xl font-light">{stats?.procesando ?? 0}</p>
        </div>
        <div className="bg-white p-4 lg:p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 truncate">Enviados</p>
          </div>
          <p className="text-xl lg:text-2xl font-light">{stats?.enviados ?? 0}</p>
        </div>
        <div className="bg-white p-4 lg:p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 truncate">Entregados</p>
          </div>
          <p className="text-xl lg:text-2xl font-light">{stats?.entregados ?? 0}</p>
        </div>
        <div className="bg-white p-4 lg:p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 truncate">Cancelados</p>
          </div>
          <p className="text-xl lg:text-2xl font-light">{stats?.cancelados ?? 0}</p>
        </div>
        <div className="bg-black text-white col-span-2 sm:col-span-3 lg:col-span-1 p-4 lg:p-5 flex flex-col justify-between">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1 lg:mb-2">Ingresos Hoy</p>
          <p className="text-xl lg:text-2xl font-light">{formatCurrency(stats?.ingresosHoy)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-4 lg:space-y-6">
        {/* Tabs de estado scrolleables en móvil */}
        <div className="flex overflow-x-auto whitespace-nowrap gap-2 lg:gap-4 border-b border-gray-200 pb-2 scrollbar-hide">
          {[
            { id: 'todos', label: 'Todos', count: stats?.total ?? 0 },
            { id: 'pendiente', label: 'Pendientes', count: stats?.pendientes ?? 0 },
            { id: 'procesando', label: 'Procesando', count: stats?.procesando ?? 0 },
            { id: 'enviado', label: 'Enviados', count: stats?.enviados ?? 0 },
            { id: 'entregado', label: 'Entregados', count: stats?.entregados ?? 0 },
            { id: 'cancelado', label: 'Cancelados', count: stats?.cancelados ?? 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 lg:px-4 py-2 text-[10px] lg:text-[11px] uppercase tracking-widest transition-all border-b-2 flex-shrink-0 ${
                selectedFilter === tab.id 
                  ? 'border-black text-black font-semibold' 
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Búsqueda y Fechas apilables */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 lg:gap-4">
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 sm:gap-0">
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 bg-white border border-gray-200 sm:border-r-0 text-xs uppercase tracking-wider text-gray-600 focus:outline-none focus:border-black transition-colors"
            >
              <option value="orden">Orden</option>
              <option value="email">Email</option>
              <option value="nombre">Nombre</option>
              <option value="telefono">Teléfono</option>
            </select>
            <input
              type="text"
              placeholder="BUSCAR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full flex-1 px-4 py-3 bg-white border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-400 placeholder:text-xs placeholder:uppercase placeholder:tracking-widest"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 md:col-span-2 gap-3 lg:gap-4">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 lg:px-4 py-3 bg-white border border-gray-200 text-xs lg:text-sm focus:outline-none focus:border-black transition-colors text-gray-600"
            />
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 lg:px-4 py-3 bg-white border border-gray-200 text-xs lg:text-sm focus:outline-none focus:border-black transition-colors text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="border border-gray-200 bg-white">
        <div className="p-4 lg:p-5 flex flex-wrap gap-2 justify-between items-center border-b border-gray-200">
          <h2 className="text-xs font-semibold tracking-widest uppercase">Lista de Pedidos</h2>
          <div className="flex items-center gap-3 lg:gap-4">
            {lastUpdate > new Date(Date.now() - 10000) && (
              <span className="text-[9px] lg:text-[10px] uppercase tracking-widest text-green-600 animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> <span className="hidden sm:inline">Actualizado</span>
              </span>
            )}
            <p className="text-[9px] lg:text-[10px] uppercase tracking-widest text-gray-500">
              {currentOrders.length} / {filteredOrders.length}
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {currentOrders.length === 0 ? (
            <div className="p-12 lg:p-16 text-center">
              <p className="text-[10px] lg:text-xs uppercase tracking-widest text-gray-400">No hay pedidos que coincidan</p>
            </div>
          ) : (
            currentOrders.map((order) => (
              <div key={order.id} className="p-4 lg:p-5 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                  
                  {/* Información principal adaptada */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between lg:justify-start items-center gap-4 mb-3 lg:mb-2">
                      <span className="text-sm font-semibold tracking-wide">#{order.id}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${getStatusDotColor(order.status)}`}></span>
                        <span className="text-[9px] lg:text-[10px] font-medium uppercase tracking-widest text-gray-600">
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-y-1 gap-x-8 text-xs lg:text-sm text-gray-600 mb-3 lg:mb-2">
                      <span className="font-medium text-black truncate">{order.nombre}</span>
                      <span className="truncate">{order.email}</span>
                      <span>{order.telefono}</span>
                      <span className="text-gray-400 text-[10px] lg:text-xs">{formatDate(order.created_at)}</span>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] lg:text-[11px] uppercase tracking-widest text-gray-400">
                      <span>{order.items?.length || 0} ARTÍCULOS</span>
                      <span className="hidden sm:inline">|</span>
                      <span>{order.payment_method === 'mercadopago' ? 'MERCADO PAGO' : 'TRANSFERENCIA'}</span>
                      <span className="hidden sm:inline">|</span>
                      <span>ENVÍO {order.shipping_method === 'express' ? 'EXPRESS' : 'ESTÁNDAR'}</span>
                    </div>
                  </div>

                  {/* Acciones y Total separados en móvil */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-6 lg:justify-end mt-2 pt-3 border-t border-gray-100 lg:border-t-0 lg:mt-0 lg:pt-0">
                    
                    <div className="flex justify-between items-center w-full sm:w-auto lg:text-right">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 sm:mb-1">Total</p>
                      <p className="text-base lg:text-lg font-light tracking-wide sm:ml-4 lg:ml-0">{formatCurrency(order?.total)}</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="flex-1 sm:flex-none px-2 lg:px-3 py-2 bg-transparent border border-gray-200 text-[10px] lg:text-[11px] uppercase tracking-widest text-gray-700 focus:outline-none focus:border-black transition-colors cursor-pointer"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="procesando">Procesando</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>

                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="p-2 border border-gray-200 hover:border-black transition-colors flex items-center justify-center bg-white flex-shrink-0"
                        aria-label="Ver detalles"
                      >
                        <svg className={`w-4 h-4 transform transition-transform duration-300 ${selectedOrder?.id === order.id ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {order.status === 'entregado' && (
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-500 transition-colors bg-white flex-shrink-0"
                          title="Eliminar pedido"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalles expandibles */}
                {selectedOrder?.id === order.id && (
                  <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                      
                      {/* Productos */}
                      <div className="lg:col-span-2">
                        <h3 className="text-[10px] font-semibold text-black uppercase tracking-widest mb-3 lg:mb-4">Artículos</h3>
                        <div className="space-y-3 lg:space-y-4">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex gap-3 lg:gap-4 p-3 lg:p-4 border border-gray-100 bg-gray-50/50">
                              <div className="w-14 h-16 lg:w-16 lg:h-20 bg-gray-100 flex-shrink-0">
                                {item.imagen ? (
                                  <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-[7px] lg:text-[8px] text-gray-400 uppercase tracking-widest">NO IMG</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 flex flex-col justify-between py-0.5 lg:py-1">
                                <div>
                                  <p className="text-[11px] lg:text-xs font-semibold uppercase tracking-wide leading-tight">{item.nombre}</p>
                                  <div className="flex gap-3 lg:gap-4 text-[9px] lg:text-[11px] text-gray-500 uppercase tracking-widest mt-1.5 lg:mt-2">
                                    <span>CANT: {item.cantidad}</span>
                                    {item.talla && <span>TALLA: {item.talla}</span>}
                                  </div>
                                </div>
                                <p className="text-xs lg:text-sm">{formatCurrency(item.precio * item.cantidad)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resumen y Envío */}
                      <div className="space-y-6 lg:space-y-8">
                        <div>
                          <h3 className="text-[10px] font-semibold text-black uppercase tracking-widest mb-3 lg:mb-4">Envío</h3>
                          <div className="text-[11px] lg:text-xs text-gray-600 space-y-1 lg:space-y-1.5 leading-relaxed">
                            <p className="text-black uppercase tracking-wide">{order.nombre}</p>
                            <p>{order.direccion}</p>
                            <p>{order.ciudad}, {order.estado}</p>
                            <p>CP {order.codigo_postal}</p>
                            <p className="pt-1.5 lg:pt-2 text-gray-400">{order.telefono}</p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-[10px] font-semibold text-black uppercase tracking-widest mb-3 lg:mb-4">Resumen</h3>
                          <div className="space-y-2 lg:space-y-3 text-xs lg:text-sm">
                            <div className="flex justify-between text-gray-500">
                              <span>Subtotal</span>
                              <span>{formatCurrency(order.total - (order.shipping_method === 'express' ? 149 : 99))}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span>Envío</span>
                              <span>{formatCurrency(order.shipping_method === 'express' ? 149 : 99)}</span>
                            </div>
                            <div className="flex justify-between font-semibold pt-3 lg:pt-4 border-t border-gray-200">
                              <span className="uppercase tracking-widest text-[10px] lg:text-xs">Total</span>
                              <span>{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-3 lg:p-4 border-t border-gray-200 flex justify-center gap-1 bg-gray-50 overflow-x-auto">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 lg:px-4 py-2 border border-gray-200 bg-white text-[10px] lg:text-xs disabled:opacity-30 hover:border-black transition-colors"
            >
              ANT
            </button>
            <div className="flex gap-1 px-1 lg:px-2 items-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center text-[10px] lg:text-xs transition-colors ${
                    currentPage === page 
                      ? 'bg-black text-white' 
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 lg:px-4 py-2 border border-gray-200 bg-white text-[10px] lg:text-xs disabled:opacity-30 hover:border-black transition-colors"
            >
              SIG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}