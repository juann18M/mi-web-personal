import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/pedidos/[id]/estado - Obtener estado actual de un pedido (público)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);

    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const conn = await db.getConnection();
    
    try {
      const [result]: any = await conn.query(
        `SELECT status FROM orders WHERE id = ?`,
        [idNum]
      );

      if (result.length === 0) {
        return NextResponse.json(
          { error: "Pedido no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        status: result[0].status,
        timestamp: Date.now()
      });

    } finally {
      conn.release();
    }

  } catch (error) {
    console.error("Error en GET /api/pedidos/[id]/estado:", error);
    return NextResponse.json(
      { error: "Error al obtener el estado" },
      { status: 500 }
    );
  }
}