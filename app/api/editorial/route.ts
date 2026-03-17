import { NextResponse } from 'next/server'

let editorialData = {
  bloque1_imagen: "/editorial1.jpg",
  bloque1_titulo: "NUEVA TEMPORADA",
  bloque1_descripcion: "Siluetas limpias y materiales premium diseñados para la nueva colección primavera verano.",
  bloque2_imagen: "/editorial2.jpg",
  bloque2_titulo: "ESTILO CONTEMPORÁNEO",
  bloque2_descripcion: "Diseños minimalistas inspirados en la arquitectura urbana.",
  bloque3_imagen: "/editorial3.jpg",
  bloque3_titulo: "ELEGANCIA MODERNA",
  bloque3_descripcion: "Prendas esenciales pensadas para el día a día."
}

export async function GET() {
  return NextResponse.json(editorialData)
}

export async function PATCH(request: Request) {
  const data = await request.json()
  editorialData = { ...editorialData, ...data }
  return NextResponse.json(editorialData)
}