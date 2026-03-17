import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

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

// GET /api/admin/pedidos/[id] - Obtener un pedido específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin(request);
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

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
      // Obtener la orden
      const [orders]: any = await conn.query(
        `SELECT * FROM orders WHERE id = ?`,
        [idNum]
      );

      if (orders.length === 0) {
        return NextResponse.json(
          { error: "Pedido no encontrado" },
          { status: 404 }
        );
      }

      const order = orders[0];

      // Obtener los items
      const [items]: any = await conn.query(
        `SELECT * FROM order_items WHERE order_id = ?`,
        [idNum]
      );

      return NextResponse.json({
        ...order,
        items
      });

    } finally {
      conn.release();
    }

  } catch (error) {
    console.error("Error en GET /api/admin/pedidos/[id]:", error);
    return NextResponse.json(
      { error: "Error al obtener el pedido" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/pedidos/[id] - Actualizar estado del pedido
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin(request);
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const idNum = parseInt(id);

    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status: newStatus } = body;

    // Validar que el estado sea válido
    const validStatuses = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: "Estado no válido" },
        { status: 400 }
      );
    }

    const conn = await db.getConnection();

    try {
      // Verificar que el pedido existe
      const [orders]: any = await conn.query(
        `SELECT id FROM orders WHERE id = ?`,
        [idNum]
      );

      if (orders.length === 0) {
        return NextResponse.json(
          { error: "Pedido no encontrado" },
          { status: 404 }
        );
      }

      // Actualizar estado
      await conn.query(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [newStatus, idNum]
      );

      // Obtener el pedido actualizado
      const [updatedOrders]: any = await conn.query(
        `SELECT * FROM orders WHERE id = ?`,
        [idNum]
      );

      const [items]: any = await conn.query(
        `SELECT * FROM order_items WHERE order_id = ?`,
        [idNum]
      );

      return NextResponse.json({
        ...updatedOrders[0],
        items
      });

    } finally {
      conn.release();
    }

  } catch (error) {
    console.error("Error en PATCH /api/admin/pedidos/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar el pedido" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/pedidos/[id] - Eliminar un pedido (solo si está entregado)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin(request);
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

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
      await conn.beginTransaction();

      // Verificar que el pedido existe y está entregado
      const [orders]: any = await conn.query(
        `SELECT status FROM orders WHERE id = ?`,
        [idNum]
      );

      if (orders.length === 0) {
        await conn.rollback();
        return NextResponse.json(
          { error: "Pedido no encontrado" },
          { status: 404 }
        );
      }

      const order = orders[0];

      // Solo permitir eliminar si está entregado
      if (order.status !== 'entregado') {
        await conn.rollback();
        return NextResponse.json(
          { error: "Solo se pueden eliminar pedidos entregados" },
          { status: 400 }
        );
      }

      // Eliminar items primero (por la clave foránea)
      await conn.query(
        `DELETE FROM order_items WHERE order_id = ?`,
        [idNum]
      );

      // Eliminar la orden
      await conn.query(
        `DELETE FROM orders WHERE id = ?`,
        [idNum]
      );

      await conn.commit();

      return NextResponse.json({
        success: true,
        message: "Pedido eliminado correctamente"
      });

    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error("Error en DELETE /api/admin/pedidos/[id]:", error);
    return NextResponse.json(
      { error: "Error al eliminar el pedido" },
      { status: 500 }
    );
  }
}