'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // 🔥 Guardamos token en localStorage (luego lo mejoramos a cookie segura)
      localStorage.setItem('token', data.token);

      // Redirigir al carrito
      router.push('/cart');
    } catch (err) {
      setError('Error al iniciar sesión');
    }

    setLoading(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row">
      
      {/* LADO IZQUIERDO - ESTILO ZARA (mismo que registro) */}
      <div className="h-[40vh] md:h-full md:w-1/2 bg-white flex items-center justify-center relative overflow-hidden">
        {/* Elementos decorativos estilo Zara */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border border-black rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 border border-black rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-black"></div>
        </div>
        
        {/* Texto principal */}
        <div className="relative z-10 text-center">
          <div className="mb-2 md:mb-4">
            <span className="text-[8px] md:text-[10px] font-light tracking-[0.5em] text-gray-400 uppercase">
              Colección
            </span>
          </div>
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-[-0.05em] text-black leading-none">
            BLACK'S
          </h1>
          <div className="mt-2 md:mt-4 flex justify-center space-x-2">
            <span className="w-8 h-[1px] bg-black"></span>
            <span className="text-[10px] md:text-xs font-light tracking-[0.3em] text-gray-500 uppercase">desde 2026</span>
            <span className="w-8 h-[1px] bg-black"></span>
          </div>
        </div>
      </div>

      {/* LADO DERECHO - FORMULARIO LOGIN ESTILO ZARA */}
      <div className="h-[60vh] md:h-full md:w-1/2 bg-white flex items-center justify-center px-6 md:px-12 lg:px-20 overflow-y-auto">
        <div className="w-full max-w-md">
          
          {/* Header minimalista Zara */}
          <div className="mb-12 md:mb-16">
            <span className="text-[8px] font-light tracking-[0.4em] text-gray-400 uppercase block mb-3">
              Bienvenido de vuelta
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-[-0.02em] text-black">
              Iniciar sesión
            </h2>
            <div className="w-12 h-[1px] bg-black mt-3"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-8 md:space-y-10">
            
            {/* Email - Estilo Zara */}
            <div>
              <label className="block text-[9px] font-light tracking-[0.2em] text-gray-500 uppercase mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                className="w-full py-3 text-sm text-black bg-transparent border-b border-gray-300 focus:border-black outline-none transition-colors"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password - Estilo Zara */}
            <div>
              <label className="block text-[9px] font-light tracking-[0.2em] text-gray-500 uppercase mb-2">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full py-3 text-sm text-black bg-transparent border-b border-gray-300 focus:border-black outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Link de recuperación - Estilo Zara */}
            <div className="text-right">
              
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-[10px] font-light tracking-wider">
                {error}
              </p>
            )}

            {/* Botón estilo Zara */}
            <div className="pt-6 md:pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 text-[10px] font-light tracking-[0.3em] uppercase hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {loading ? 'INICIANDO...' : 'INICIAR SESIÓN'}
              </button>

              {/* Enlaces estilo Zara */}
              <div className="mt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <span className="text-[9px] font-light tracking-wider text-gray-400">
                  ¿No tienes cuenta?
                </span>
                <Link 
                  href="/register" 
                  className="text-[9px] font-medium tracking-[0.2em] text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity uppercase"
                >
                  Crear cuenta
                </Link>
              </div>
            </div>
          </form>

          {/* Footer minimalista Zara */}
          <div className="mt-12 text-center">
            <p className="text-[7px] font-light tracking-[0.2em] text-gray-300 uppercase">
              Black's © 2026 | Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}