"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mercadopago");
  const [shippingMethod, setShippingMethod] = useState("express");

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigo_postal: "",
  });

  useEffect(() => {
    if (cart.length === 0) router.push("/cart");
  }, [cart, router]);

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const shippingCost = shippingMethod === "express" ? 149 : 99;
  const totalWithShipping = total + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!form.nombre || !form.email || !form.telefono || !form.direccion || !form.ciudad || !form.estado || !form.codigo_postal) {
        throw new Error("COMPLETA TODOS LOS DATOS DE ENVÍO");
      }

      const token = localStorage.getItem("token");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          cliente: form,
          carrito: cart.map(item => ({
            id: item.id,
            nombre: item.nombre,
            precio: Number(item.precio),
            imagen: item.imagen || item.image || null,
            talla: item.talla,
            cantidad: item.cantidad
          })),
          total: totalWithShipping,
          paymentMethod,
          shippingMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la orden");

      clearCart();
      if (paymentMethod === "mercadopago") {
       window.location.href = `https://link.mercadopago.com.mx/blacksboutique?order_id=${data.orderId}`;
      } else {
        window.location.href = `/transferencia?order=${data.orderId}`;
      }
    } catch (err: any) {
      setError(err.message.toUpperCase());
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-24 md:pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 md:px-12">
          
          <header className="mb-12 border-b border-black pb-6">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase">Finalizar Compra</h1>
            <p className="text-[10px] tracking-widest text-gray-500 mt-2 uppercase">Información de entrega y pago</p>
          </header>

          {error && (
            <div className="mb-8 p-4 border border-black text-[10px] tracking-[0.2em] font-bold text-red-600 uppercase">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* COLUMNA IZQUIERDA: FORMULARIO */}
            <form id="checkout-form" onSubmit={handleSubmit} className="lg:col-span-7 space-y-12">
              
              {/* DATOS PERSONALES */}
              <section>
                <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-8 border-l-2 border-black pl-3">01. Datos de envío</h2>
                <div className="space-y-6">
                  <div className="relative group">
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      placeholder=" "
                      className="peer w-full border-b border-gray-300 py-3 text-xs uppercase tracking-wider focus:outline-none focus:border-black transition-colors placeholder-transparent bg-transparent"
                    />
                    <label className="absolute left-0 -top-3.5 text-[9px] tracking-widest text-gray-400 uppercase transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[9px] peer-focus:text-black pointer-events-none">
                      Nombre completo
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder=" " className="peer w-full border-b border-gray-300 py-3 text-xs uppercase tracking-wider focus:outline-none focus:border-black placeholder-transparent" />
                      <label className="absolute left-0 -top-3.5 text-[9px] tracking-widest text-gray-400 uppercase transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-black">E-mail</label>
                    </div>
                    <div className="relative">
                      <input name="telefono" value={form.telefono} onChange={handleChange} required placeholder=" " className="peer w-full border-b border-gray-300 py-3 text-xs uppercase tracking-wider focus:outline-none focus:border-black placeholder-transparent" />
                      <label className="absolute left-0 -top-3.5 text-[9px] tracking-widest text-gray-400 uppercase transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-black">Teléfono</label>
                    </div>
                  </div>

                  <div className="relative">
                    <input name="direccion" value={form.direccion} onChange={handleChange} required placeholder=" " className="peer w-full border-b border-gray-300 py-3 text-xs uppercase tracking-wider focus:outline-none focus:border-black placeholder-transparent" />
                    <label className="absolute left-0 -top-3.5 text-[9px] tracking-widest text-gray-400 uppercase transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-black">Dirección y Número</label>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="relative">
                      <input name="ciudad" value={form.ciudad} onChange={handleChange} required placeholder=" " className="peer w-full border-b border-gray-300 py-3 text-xs uppercase tracking-wider focus:outline-none focus:border-black placeholder-transparent" />
                      <label className="absolute left-0 -top-3.5 text-[9px] tracking-widest text-gray-400 uppercase transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-black">Ciudad</label>
                    </div>
                    <div className="relative">
                      <input name="estado" value={form.estado} onChange={handleChange} required placeholder=" " className="peer w-full border-b border-gray-300 py-3 text-xs uppercase tracking-wider focus:outline-none focus:border-black placeholder-transparent" />
                      <label className="absolute left-0 -top-3.5 text-[9px] tracking-widest text-gray-400 uppercase transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-black">Estado</label>
                    </div>
                    <div className="relative col-span-2 md:col-span-1">
                      <input name="codigo_postal" value={form.codigo_postal} onChange={handleChange} required placeholder=" " className="peer w-full border-b border-gray-300 py-3 text-xs uppercase tracking-wider focus:outline-none focus:border-black placeholder-transparent" />
                      <label className="absolute left-0 -top-3.5 text-[9px] tracking-widest text-gray-400 uppercase transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-black">CP</label>
                    </div>
                  </div>
                </div>
              </section>

              {/* MÉTODOS DE ENVÍO */}
              <section>
                <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-6 border-l-2 border-black pl-3">02. Envío</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'express', label: 'Express (1-3 días)', price: 149 },
                    { id: 'standard', label: 'Estándar (3-5 días)', price: 99 }
                  ].map((method) => (
                    <label key={method.id} className={`flex justify-between items-center p-5 border cursor-pointer transition-all ${shippingMethod === method.id ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'}`}>
                      <input type="radio" value={method.id} checked={shippingMethod === method.id} onChange={(e) => setShippingMethod(e.target.value)} className="hidden" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">{method.label}</span>
                      <span className="text-[11px] font-medium">${method.price}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* MÉTODOS DE PAGO */}
              <section>
                <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-6 border-l-2 border-black pl-3">03. Pago</h2>
                <div className="space-y-3">
                  {[
                    { id: 'mercadopago', label: 'Mercado Pago / Tarjetas', sub: 'Crédito, Débito, Efectivo' },
                    { id: 'transferencia', label: 'Transferencia Directa', sub: 'SPEI / Depósito Bancario' }
                  ].map((pay) => (
                    <label key={pay.id} className={`flex flex-col p-5 border cursor-pointer transition-all ${paymentMethod === pay.id ? 'border-black ring-1 ring-black' : 'border-gray-200 opacity-60'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold tracking-widest uppercase">{pay.label}</span>
                        <input type="radio" value={pay.id} checked={paymentMethod === pay.id} onChange={(e) => setPaymentMethod(e.target.value)} className="w-3 h-3 accent-black" />
                      </div>
                      <span className="text-[9px] tracking-wider text-gray-500 uppercase mt-1">{pay.sub}</span>
                    </label>
                  ))}
                </div>
              </section>
            </form>

            {/* COLUMNA DERECHA: RESUMEN (STICKY) */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32 space-y-8">
                <section className="bg-[#f9f9f9] p-8">
                  <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-8">Tu Pedido</h2>
                  
                  <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.talla}`} className="flex gap-4">
                        <div className="w-16 h-20 bg-gray-200 flex-shrink-0 overflow-hidden">
                          {item.imagen && <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover mix-blend-multiply" />}
                        </div>
                        <div className="flex flex-col justify-between flex-grow py-1">
                          <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-wide leading-tight">{item.nombre}</h3>
                            <p className="text-[9px] text-gray-500 uppercase mt-1">Cant: {item.cantidad} {item.talla && `/ Talla: ${item.talla}`}</p>
                          </div>
                          <p className="text-[10px] font-medium">${(item.precio * item.cantidad).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 space-y-2 uppercase tracking-[0.1em] text-[10px]">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Envío</span>
                      <span>${shippingCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-black font-bold text-sm pt-4 border-t border-black mt-4">
                      <span>Total</span>
                      <span>${totalWithShipping.toLocaleString()}</span>
                    </div>
                  </div>
                </section>

                {/* BOTÓN DE ACCIÓN (ESCRITORIO) */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="hidden lg:block w-full py-5 bg-black text-white text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {loading ? "Procesando..." : "Confirmar y Pagar"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA FIJA MÓVIL */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black p-4 z-50">
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Total a pagar</span>
            <span className="text-lg font-bold tracking-tighter">${totalWithShipping.toLocaleString()}</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-5 bg-black text-white text-[11px] font-bold tracking-[0.3em] uppercase disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {loading ? "Procesando..." : "Finalizar Compra"}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}