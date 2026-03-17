"use client";

import { useSearchParams } from "next/navigation";

export default function Confirmado() {
  const params = useSearchParams();
  const id = params.get("id");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl mb-4">Pedido confirmado ✅</h1>
      <p>Tu número de pedido es:</p>
      <strong className="text-xl">#{id}</strong>
    </div>
  );
}