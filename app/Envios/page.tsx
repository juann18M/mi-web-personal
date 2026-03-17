'use client';

import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { ArrowLeft, Package, Truck, Clock, Shield } from 'lucide-react';

export default function EnviosPage() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white text-black font-sans pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest hover:opacity-50 mb-8"
          >
            <ArrowLeft size={14} /> Volver
          </button>

          <h1 className="text-3xl font-light uppercase tracking-[0.2em] mb-8">Envíos</h1>
          
          <div className="space-y-8">
            
            {/* MÉTODOS DE ENVÍO */}
            <div>
              <h2 className="text-lg font-medium uppercase tracking-wider text-black mb-6 flex items-center gap-2">
                <Truck size={20} /> Métodos de envío
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 p-4">
                  <h3 className="font-medium mb-2">Envío estándar</h3>
                  <p className="text-sm text-gray-600 mb-2">Entrega en 3-5 días hábiles</p>
                  
                </div>

                <div className="border border-gray-200 p-4">
                  <h3 className="font-medium mb-2">Envío exprés</h3>
                  <p className="text-sm text-gray-600 mb-2">Entrega en 1-2 días hábiles</p>
                  
                </div>
              </div>
            </div>

            {/* TIEMPOS DE ENTREGA */}
            <div>
              <h2 className="text-lg font-medium uppercase tracking-wider text-black mb-4 flex items-center gap-2">
                <Clock size={20} /> Tiempos de entrega
              </h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Tiempo de preparación: 24-48 horas hábiles</p>
                <p>• Envío estándar: 3-5 días hábiles adicionales</p>
                <p>• Envío exprés: 1-2 días hábiles adicionales</p>
                <p className="text-xs text-gray-400 mt-2">
                  *Los tiempos comienzan a partir de la confirmación del pago
                </p>
              </div>
            </div>

            {/* COBERTURA */}
            <div>
              <h2 className="text-lg font-medium uppercase tracking-wider text-black mb-4 flex items-center gap-2">
                <Package size={20} /> Cobertura
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Realizamos envíos a toda la República Mexicana.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <span className="text-gray-600">• Ciudad de México</span>
                <span className="text-gray-600">• Estado de México</span>
                <span className="text-gray-600">• Monterrey</span>
                <span className="text-gray-600">• Guadalajara</span>
                <span className="text-gray-600">• Puebla</span>
                <span className="text-gray-600">• Querétaro</span>
                <span className="text-gray-600">• Y más...</span>
              </div>
            </div>

            {/* POLÍTICAS */}
            <div>
              <h2 className="text-lg font-medium uppercase tracking-wider text-black mb-4 flex items-center gap-2">
                <Shield size={20} /> Políticas de envío
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                <li>Los pedidos se procesan de Lunes a Domingo.</li>
                <li>Es responsabilidad del cliente proporcionar una dirección correcta.</li>
                <li>Los costos de envío no son reembolsables en caso de devolución.</li>
                <li>Para zonas de difícil acceso pueden aplicar tiempos adicionales.</li>
              </ul>
            </div>

            {/* PREGUNTAS FRECUENTES */}
            <div className="pt-6">
              <h2 className="text-lg font-medium uppercase tracking-wider text-black mb-4">Preguntas frecuentes</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm mb-2">¿Puedo cambiar la dirección de envío?</h3>
                  <p className="text-sm text-gray-600">
                    Sí, siempre que el pedido no haya sido enviado. Contáctanos inmediatamente.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-sm mb-2">¿Qué pasa si no estoy en casa?</h3>
                  <p className="text-sm text-gray-600">
                    La paquetería intentará la entrega hasta 2 veces más. También puedes pasar a recogerlo a la sucursal.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-sm mb-2">¿Hacen envíos internacionales?</h3>
                  <p className="text-sm text-gray-600">
                    Por el momento solo realizamos envíos dentro de México.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}