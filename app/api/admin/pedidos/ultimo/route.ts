import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

// Variable global para almacenar el último ID (solo para este archivo)
let ultimoPedidoId = 0;

// Verificar autenticación de admin
async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader) {
    return { error: "Token requerido", status: 401 };
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return { userId: decoded.id };
  } catch {
    return { error: "Token inválido", status: 401 };
  }
}

// GET /api/admin/pedidos/ultimo - Verificar si hay nuevos pedidos
export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const conn = await db.getConnection();
    
    try {
      // Obtener el ID máximo actual
      const [result]: any = await conn.query(
        `SELECT MAX(id) as ultimo_id FROM orders`
      );

      const nuevoUltimo = result[0]?.ultimo_id || 0;
      
      // Verificar si hay un pedido nuevo
      const hayNuevo = nuevoUltimo > ultimoPedidoId;
      
      // Actualizar variable global
      if (hayNuevo) {
        ultimoPedidoId = nuevoUltimo;
      }

      return NextResponse.json({
        ultimoId: nuevoUltimo,
        hayNuevo,
        timestamp: Date.now()
      });

    } finally {
      conn.release();
    }

  } catch (error) {
    console.error("Error en GET /api/admin/pedidos/ultimo:", error);
    return NextResponse.json(
      { error: "Error al verificar nuevos pedidos" },
      { status: 500 }
    );
  }
}

// POST /api/admin/pedidos/ultimo - Actualizar el último ID (llamado desde orders/route.ts)
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (orderId && orderId > ultimoPedidoId) {
      ultimoPedidoId = orderId;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}