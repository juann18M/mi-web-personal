import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

// ==================== POST (CREAR ORDEN) ====================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cliente, carrito, total, paymentMethod, shippingMethod } = body;

    if (!cliente || !carrito || carrito.length === 0) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Token requerido" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    let decoded: any;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    const userId = decoded.id;
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const [orderResult]: any = await conn.query(
        `INSERT INTO orders
        (user_id, nombre, email, telefono, direccion, ciudad, estado, codigo_postal, total, status, payment_method, shipping_method)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          cliente.nombre,
          cliente.email,
          cliente.telefono,
          cliente.direccion,
          cliente.ciudad,
          cliente.estado,
          cliente.codigo_postal,
          Number(total),
          "pendiente",
          paymentMethod || "mercadopago",
          shippingMethod || "express",
        ]
      );

      const orderId = orderResult.insertId;

      for (const item of carrito) {
        await conn.query(
          `INSERT INTO order_items
          (order_id, producto_id, nombre, imagen, talla, precio, cantidad)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            Number(item.id),
            item.nombre,
            item.imagen || null,
            item.talla || null,
            Number(item.precio),
            Number(item.cantidad),
          ]
        );
      }

      await conn.commit();

      // ========== NOTIFICAR AL ADMIN SOBRE NUEVO PEDIDO ==========
      try {
        // Obtener la URL base
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        
        // Llamada interna para actualizar el último ID (no bloqueante)
        fetch(`${baseUrl}/api/admin/pedidos/ultimo`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader, // Reutilizar el mismo token
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orderId })
        }).catch(err => console.error('Error notificando nuevo pedido:', err));
      } catch (notifyError) {
        console.error('Error notificando:', notifyError);
        // No afecta la respuesta al usuario
      }
      // ==========================================================

      return NextResponse.json({
        success: true,
        orderId,
      });

    } catch (err) {
      await conn.rollback();
      console.error("Error en transacción:", err);
      throw err;
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error("Error creando pedido:", error);
    return NextResponse.json(
      { error: "Error creando pedido" },
      { status: 500 }
    );
  }
}

// ==================== GET (OBTENER ÓRDENES) ====================
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    const possibleOrderId = parseInt(lastPart);
    
    if (!isNaN(possibleOrderId) && lastPart !== 'orders') {
      return getOrderById(possibleOrderId);
    }
    
    return getUserOrders(req);
    
  } catch (error) {
    console.error("Error en GET:", error);
    return NextResponse.json(
      { error: "Error procesando la solicitud" },
      { status: 500 }
    );
  }
}

// Función para obtener una orden específica por ID
async function getOrderById(orderId: number) {
  try {
    const conn = await db.getConnection();

    try {
      const [orders]: any = await conn.query(
        `SELECT * FROM orders WHERE id = ?`,
        [orderId]
      );

      if (orders.length === 0) {
        return NextResponse.json(
          { error: "Orden no encontrada" },
          { status: 404 }
        );
      }

      const order = orders[0];

      const [items]: any = await conn.query(
        `SELECT * FROM order_items WHERE order_id = ?`,
        [orderId]
      );

      return NextResponse.json({
        ...order,
        items,
      });

    } finally {
      conn.release();
    }

  } catch (error) {
    console.error("Error obteniendo orden específica:", error);
    return NextResponse.json(
      { error: "Error al obtener la orden" },
      { status: 500 }
    );
  }
}

// Función para obtener todas las órdenes del usuario CON SUS ITEMS
async function getUserOrders(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Token requerido" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    let decoded: any;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    const userId = decoded.id;
    const conn = await db.getConnection();

    try {
      const [orders]: any = await conn.query(
        `SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC`,
        [userId]
      );

      const ordersWithItems = await Promise.all(
        orders.map(async (order: any) => {
          const [items]: any = await conn.query(
            `SELECT * FROM order_items WHERE order_id = ?`,
            [order.id]
          );
          return {
            ...order,
            items
          };
        })
      );

      return NextResponse.json(ordersWithItems);
    } finally {
      conn.release();
    }

  } catch (error) {
    console.error("Error obteniendo órdenes del usuario:", error);
    return NextResponse.json(
      { error: "Error obteniendo órdenes" },
      { status: 500 }
    );
  }
}