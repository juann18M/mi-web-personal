'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface HeroProps {
  titulo?: string;
  subtitulo?: string;
  imagen?: string;
  imagen_mobile?: string;
  boton_1_texto?: string;
  boton_2_texto?: string;
}

export default function Hero() {
  const [heroData, setHeroData] = useState<HeroProps>({
    titulo: "NUEVA COLECCIÓN",
    subtitulo: "PRIMAVERA / VERANO 2026",
    imagen: "/hero-desktop.jpg",
    imagen_mobile: "",
    
  });

  // Polling cada 5 segundos
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await axios.get('/api/hero');
        setHeroData(res.data);
      } catch (error) {
        console.error('Error fetching hero:', error);
      }
    };

    // Fetch inicial
    fetchHero();

    // Configurar polling
    const interval = setInterval(fetchHero, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full bg-white overflow-hidden">
      <div className="relative w-full h-[90svh] md:h-screen">
        <picture>
          <source
            media="(max-width:768px)"
            srcSet={heroData.imagen_mobile || heroData.imagen}
          />
          <img
            src={heroData.imagen}
            alt="Hero Collection"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </picture>

        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-0 left-0 w-full h-40 md:h-56 bg-gradient-to-b from-transparent via-white/40 to-white pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-center px-6 z-10">
          <div className="text-center text-white w-full max-w-6xl">
            <h1 className="
              text-5xl 
              sm:text-6xl 
              md:text-8xl 
              lg:text-[110px]
              font-black 
              uppercase 
              leading-[0.9] 
              tracking-tight 
              drop-shadow-[0_8px_25px_rgba(0,0,0,0.6)]
              mb-6
            ">
              {heroData.titulo}
            </h1>

            <p className="
              text-[10px] 
              sm:text-xs 
              md:text-sm 
              tracking-[0.5em] 
              font-semibold 
              uppercase 
              opacity-90 
              mb-12
              drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]
            ">
              {heroData.subtitulo}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}