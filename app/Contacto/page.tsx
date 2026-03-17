'use client';

import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactoPage() {
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

          <h1 className="text-3xl font-light uppercase tracking-[0.2em] mb-12">Contacto</h1>
          
          {/* INFORMACIÓN DE CONTACTO - CENTRADA Y MEJORADA */}
          <div className="max-w-2xl mx-auto">
            
            {/* TARJETA DE INFORMACIÓN PRINCIPAL */}
            <div className="bg-gray-50 p-8 rounded-lg mb-8">
              <p className="text-sm text-gray-600 text-center mb-8 leading-relaxed">
                Estamos aquí para ayudarte. Elige el medio que prefieras y 
                nos pondremos en contacto contigo lo antes posible.
              </p>

              <div className="space-y-6">
                
                {/* DIRECCIÓN */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                  <MapPin size={20} className="text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-medium uppercase text-sm mb-1 text-black">Dirección</h3>
                    <p className="text-sm text-gray-600">
                      Calle Isidro Huarte #27 <br />
                      Colonia Centro<br />
                      Morelia Mich, CP 
                    </p>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                  <Mail size={20} className="text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-medium uppercase text-sm mb-1 text-black">Email</h3>
                    <p className="text-sm text-gray-600">contacto@blacksboutique.com</p>
                    <p className="text-sm text-gray-600">ventas@blacksboutique.com</p>
                  </div>
                </div>

                {/* TELÉFONO */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                  <Phone size={20} className="text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-medium uppercase text-sm mb-1 text-black">Teléfono</h3>
                    <p className="text-sm text-gray-600">+52 4436419745</p>
                    <p className="text-sm text-gray-600">+52 4436146936</p>
                  </div>
                </div>

                {/* HORARIO */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg">
                  <Clock size={20} className="text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-medium uppercase text-sm mb-1 text-black">Horario de atención</h3>
                    <p className="text-sm text-gray-600">Lunes a Sabado: 9:00 am - 8:00 pm</p>
                    <p className="text-sm text-gray-600">Domingos: 9:00 am - 6:00 pm</p>
                  </div>
                </div>

              </div>
            </div>

            {/* MENSAJE DE RESPUESTA RÁPIDA */}
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Tiempo de respuesta: 24-48 horas hábiles
              </p>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}