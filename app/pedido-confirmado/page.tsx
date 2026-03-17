'use client';

import { useSearchParams } from 'next/navigation';

export default function ConfirmadoClient() {
  const params = useSearchParams();
  const id = params.get('id');

  if (!id) return <p>Cargando...</p>; // opcional, evita flashes

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl mb-4">Pedido confirmado ✅</h1>
      <p>Tu número de pedido es:</p>
      <strong className="text-xl">#{id}</strong>
    </div>
  );
}