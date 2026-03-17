import { NextResponse } from 'next/server'

let heroData = {
  titulo: "NEW COLLECTION",
  subtitulo: "PRIMAVERA / VERANO 2026",
  imagen: "/hero.jpg",
  boton_1_texto: "VER MUJER",
  boton_2_texto: "VER HOMBRE"
}

export async function GET() {
  return NextResponse.json(heroData)
}

export async function PATCH(request: Request) {
  const data = await request.json()
  heroData = { ...heroData, ...data }
  return NextResponse.json(heroData)
}