"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { useState } from "react";

export default function TransferenciaPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [copied, setCopied] = useState("");

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-white text-black font-sans">
        {/* Header Minimalista */}
        <div className="mt-14 md:mt-20 border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-8 text-center">
            <h1 className="text-xs font-medium uppercase tracking-[0.2em] text-black">
              Transferencia Bancaria
            </h1>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 py-12 pb-24">
          
          {/* Tarjeta principal (Sin bordes, pura tipografía y espacio) */}
          <div className="flex flex-col items-center mb-12">
            {/* Icono Check Fino */}
            <svg className="w-10 h-10 text-black mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <polyline points="20 6 9 17 4 12" />
            </svg>

            <h2 className="text-lg font-light uppercase tracking-widest mb-2">
              Orden Confirmada
            </h2>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-8">
              Nº <span className="text-black font-medium">{orderId || "---"}</span>
            </p>

            <div className="w-full border border-gray-200 p-5 text-center">
              <p className="text-[11px] uppercase tracking-widest text-gray-600 leading-relaxed">
                El pedido será procesado una vez<br/>confirmemos la recepción del pago.
              </p>
            </div>
          </div>

          {/* Datos bancarios */}
          <div className="mb-12">
            <h3 className="text-xs font-medium uppercase tracking-widest text-black mb-6 border-b border-black pb-4">
              Datos de la cuenta
            </h3>

            <div className="flex flex-col">
              {/* Banco */}
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Institución</p>
                  <p className="text-sm font-light tracking-wide">BBVA</p>
                </div>
                <button
                  onClick={() => copyToClipboard("BBVA", "banco")}
                  className="text-[10px] uppercase tracking-widest font-medium text-black hover:text-gray-500 transition-colors"
                >
                  {copied === "banco" ? "Copiado" : "Copiar"}
                </button>
              </div>

              {/* CLABE */}
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">CLABE</p>
                  <p className="text-sm font-light tracking-wide">012 180015705806143</p>
                </div>
                <button
                  onClick={() => copyToClipboard("01218000123456789", "clabe")}
                  className="text-[10px] uppercase tracking-widest font-medium text-black hover:text-gray-500 transition-colors"
                >
                  {copied === "clabe" ? "Copiado" : "Copiar"}
                </button>
              </div>

              {/* Beneficiario */}
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Beneficiario</p>
                  <p className="text-sm font-light tracking-wide">Brayan Zaldivar</p>
                </div>
                <button
                  onClick={() => copyToClipboard("BLACKS", "beneficiario")}
                  className="text-[10px] uppercase tracking-widest font-medium text-black hover:text-gray-500 transition-colors"
                >
                  {copied === "beneficiario" ? "Copiado" : "Copiar"}
                </button>
              </div>

              {/* Referencia */}
              <div className="flex justify-between items-center py-4 border-b border-gray-100">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Referencia</p>
                  <p className="text-sm font-light tracking-wide">ORDER-{orderId}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(`ORDER-${orderId}`, "referencia")}
                  className="text-[10px] uppercase tracking-widest font-medium text-black hover:text-gray-500 transition-colors"
                >
                  {copied === "referencia" ? "Copiado" : "Copiar"}
                </button>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="mb-12">
             <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">
              Instrucciones
            </h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="text-xs font-light text-gray-400">01</span>
                <p className="text-xs font-light tracking-wide text-black leading-relaxed">
                  Realiza la transferencia por el monto total desde el portal de tu banco.
                </p>
              </div>
              <div className="flex gap-4">
                <span className="text-xs font-light text-gray-400">02</span>
                <p className="text-xs font-light tracking-wide text-black leading-relaxed">
                  Conserva tu comprobante de pago para futuras aclaraciones.
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción (Estilo bloque) */}
          <div className="flex flex-col gap-3 mt-8">
            {orderId ? (
              <Link
                href="/orders"
                className="w-full py-4 bg-black text-white text-[11px] uppercase tracking-widest font-medium text-center hover:bg-gray-800 transition-colors"
              >
                Ver Estado del Pedido
              </Link>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-gray-100 text-gray-400 text-[11px] uppercase tracking-widest font-medium text-center cursor-not-allowed"
              >
                ID no disponible
              </button>
            )}
            <Link
              href="/"
              className="w-full py-4 border border-black text-black text-[11px] uppercase tracking-widest font-medium text-center hover:bg-gray-50 transition-colors"
            >
              Volver a la Tienda
            </Link>
          </div>

          {/* Footer Card */}
          <div className="mt-16 text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-400">
              Atención al cliente: 445 355 2516
            </p>
          </div>

        </div>
      </main>
    </>
  );
}