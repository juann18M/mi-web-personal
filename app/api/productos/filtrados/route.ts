// app/api/productos/filtrados/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoria = searchParams.get('categoria');
    const marca = searchParams.get('marca');
    const sort = searchParams.get('sort');

    let query = "SELECT * FROM productos WHERE activo = true";
    const params: any[] = [];

    // Aplicar filtros en la consulta SQL
    if (categoria && categoria !== 'todos') {
      query += " AND categoria = ?";
      params.push(categoria);
    }

    if (marca && marca !== 'todos') {
      query += " AND LOWER(marca) = LOWER(?)";
      params.push(marca);
    }

    // Aplicar ordenamiento
    if (sort === 'price_asc') {
      query += " ORDER BY COALESCE(precio_oferta, precio) ASC";
    } else if (sort === 'price_desc') {
      query += " ORDER BY COALESCE(precio_oferta, precio) DESC";
    } else {
      query += " ORDER BY created_at DESC";
    }

    const [productos] = await db.query(query, params);
    return NextResponse.json(productos);

  } catch (error) {
    console.error("Error en filtrado:", error);
    return NextResponse.json([], { status: 200 });
  }
}