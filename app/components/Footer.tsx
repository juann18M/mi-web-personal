'use client';

import { Instagram, Facebook, Youtube } from "lucide-react";
import Link from "next/link"; // <-- IMPORTANTE: agregar esta importación

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center space-y-8">

        {/* REDES */}
        <div className="flex items-center gap-8 text-gray-500">

          <a href="#" className="hover:text-black transition">
            <Facebook size={18} strokeWidth={1.2} />
          </a>

          <a href="#" className="hover:text-black transition">
            <Instagram size={18} strokeWidth={1.2} />
          </a>

          {/* TIKTOK SVG */}
          <a href="#" className="hover:text-black transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-[18px] h-[18px]"
            >
              <path d="M16.5 3c.4 2.1 1.9 3.7 4 4v3.1c-1.4 0-2.7-.4-3.9-1.1v6.4c0 3.6-2.9 6.6-6.6 6.6S3.4 19 3.4 15.4s2.9-6.6 6.6-6.6c.4 0 .8 0 1.2.1v3.3c-.4-.1-.8-.2-1.2-.2-1.8 0-3.3 1.5-3.3 3.3S8.2 18.6 10 18.6s3.3-1.5 3.3-3.3V3h3.2z"/>
            </svg>
          </a>

        </div>

        {/* LINKS BÁSICOS */}
        <div className="flex flex-wrap justify-center gap-6 text-xs tracking-widest uppercase text-gray-500">
          <Link href="/Nosotros" className="hover:text-black transition">Nosotros</Link>
          <Link href="/Contacto" className="hover:text-black transition">Contacto</Link>
          <Link href="/Envios" className="hover:text-black transition">Envíos</Link>
        </div>

        {/* COPYRIGHT */}
        <p className="text-xs text-gray-400 tracking-wide">
          © {new Date().getFullYear()} BLACK'S BOUTIQUE. Todos los derechos reservados.
        </p>

      </div>
    </footer>
  );
}