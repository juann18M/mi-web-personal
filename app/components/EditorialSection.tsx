'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface EditorialProps {
  bloque1_imagen?: string;
  bloque1_titulo?: string;
  bloque1_descripcion?: string;
  bloque2_imagen?: string;
  bloque2_titulo?: string;
  bloque2_descripcion?: string;
  bloque3_imagen?: string;
  bloque3_titulo?: string;
  bloque3_descripcion?: string;
}

export default function EditorialSection() {
  const [editorialData, setEditorialData] = useState<EditorialProps>({
    bloque1_imagen: "/editorial1.jpg",
    bloque1_titulo: "NUEVA TEMPORADA",
    bloque1_descripcion:
      "Siluetas limpias y materiales premium diseñados para la nueva colección primavera verano.",
    bloque2_imagen: "/editorial2.jpg",
    bloque2_titulo: "ESTILO CONTEMPORÁNEO",
    bloque2_descripcion:
      "Diseños minimalistas inspirados en la arquitectura urbana.",
    bloque3_imagen: "/editorial3.jpg",
    bloque3_titulo: "ELEGANCIA MODERNA",
    bloque3_descripcion:
      "Prendas esenciales pensadas para el día a día."
  });

  // Polling cada 5 segundos
  useEffect(() => {
    const fetchEditorial = async () => {
      try {
        const res = await axios.get('/api/editorial');
        setEditorialData(res.data);
      } catch (error) {
        console.error('Error cargando datos editoriales:', error);
      }
    };

    fetchEditorial();
    const interval = setInterval(fetchEditorial, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white text-black py-20 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-28">

        {/* BLOQUE 1 */}
        <div className="grid grid-cols-2 gap-6 md:gap-16 items-center">
          <div className="flex justify-center">
            <img
              src={editorialData.bloque1_imagen}
              className="
                w-auto
                max-h-[220px]
                sm:max-h-[250px]
                md:max-h-[420px]
                object-contain
                transition-all duration-500 ease-in-out
              "
              alt={editorialData.bloque1_titulo || "Editorial image 1"}
            />
          </div>

          <div className="space-y-4">
            <h2 className="
              text-2xl
              sm:text-3xl
              md:text-6xl
              font-light
              leading-tight
              tracking-tight
              transition-all duration-300
            ">
              {editorialData.bloque1_titulo}
            </h2>

            <p className="
              text-gray-600
              text-xs
              sm:text-sm
              md:text-xl
              leading-relaxed
              max-w-xs
              md:max-w-md
              transition-all duration-300
            ">
              {editorialData.bloque1_descripcion}
            </p>
          </div>
        </div>

        {/* BLOQUE 2 */}
        <div className="flex flex-col items-center text-center space-y-8">
          <img
            src={editorialData.bloque2_imagen}
            className="
              w-auto
              max-h-[230px]
              sm:max-h-[260px]
              md:max-h-[460px]
              object-contain
              transition-all duration-500 ease-in-out
            "
            alt={editorialData.bloque2_titulo || "Editorial image 2"}
          />

          <div className="space-y-4 max-w-xs sm:max-w-md md:max-w-2xl">
            <h2 className="
              text-2xl
              sm:text-3xl
              md:text-6xl
              font-light
              tracking-tight
              leading-tight
              transition-all duration-300
            ">
              {editorialData.bloque2_titulo}
            </h2>

            <p className="
              text-gray-600
              text-xs
              sm:text-sm
              md:text-xl
              leading-relaxed
              transition-all duration-300
            ">
              {editorialData.bloque2_descripcion}
            </p>
          </div>
        </div>

        {/* BLOQUE 3 */}
        <div className="grid grid-cols-2 gap-6 md:gap-16 items-center">
          <div className="space-y-4">
            <h2 className="
              text-2xl
              sm:text-3xl
              md:text-6xl
              font-light
              leading-tight
              tracking-tight
              transition-all duration-300
            ">
              {editorialData.bloque3_titulo}
            </h2>

            <p className="
              text-gray-600
              text-xs
              sm:text-sm
              md:text-xl
              leading-relaxed
              max-w-xs
              md:max-w-md
              transition-all duration-300
            ">
              {editorialData.bloque3_descripcion}
            </p>
          </div>

          <div className="flex justify-center">
            <img
              src={editorialData.bloque3_imagen}
              className="
                w-auto
                max-h-[220px]
                sm:max-h-[250px]
                md:max-h-[420px]
                object-contain
                transition-all duration-500 ease-in-out
              "
              alt={editorialData.bloque3_titulo || "Editorial image 3"}
            />
          </div>
        </div>

      </div>
    </section>
  );
}