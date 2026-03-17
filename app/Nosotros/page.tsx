'use client';

import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react';

export default function NosotrosPage() {
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

          <h1 className="text-3xl font-light uppercase tracking-[0.2em] mb-8">Nosotros</h1>
          
          <div className="space-y-8 text-sm leading-relaxed text-gray-600">
            
            <div>
              <h2 className="text-lg font-medium uppercase tracking-wider text-black mb-4">Nuestra Historia</h2>
              <p className="mb-4">
                Black's Boutique nació en 2020 con la visión de ofrecer moda contemporánea con un estilo único y vanguardista. 
                Lo que comenzó como una pequeña tienda en línea, hoy se ha convertido en un referente de estilo para aquellos 
                que buscan expresar su personalidad a través de la moda.
              </p>
              <p>
                Nos especializamos en ropa de alta calidad, con diseños exclusivos que fusionan las últimas tendencias con 
                la elegancia atemporal. Cada prenda es seleccionada cuidadosamente para garantizar la máxima satisfacción 
                de nuestros clientes.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-medium uppercase tracking-wider text-black mb-4">Nuestra Misión</h2>
              <p>
                Empoderar a las personas a través de la moda, ofreciendo prendas que no solo visten, sino que expresan 
                identidad y personalidad. Buscamos democratizar el acceso a la moda de calidad, manteniendo estándares 
                éticos en toda nuestra cadena de producción.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-medium uppercase tracking-wider text-black mb-4">Nuestros Valores</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="font-medium text-black">Calidad:</span> Solo trabajamos con los mejores materiales y proveedores.</li>
                <li><span className="font-medium text-black">Autenticidad:</span> Diseños únicos que no encontrarás en otro lugar.</li>
                <li><span className="font-medium text-black">Sostenibilidad:</span> Comprometidos con prácticas responsables.</li>
                <li><span className="font-medium text-black">Servicio:</span> Nuestros clientes son lo más importante.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}