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
    
    // Aquí puedes verificar si el usuario es admin
    // Por ahora, asumimos que cualquier usuario autenticado puede ver pedidos
    // Si tienes un campo "role" en users, verifica que sea admin
    
    return { userId: decoded.id };
  } catch {
    return { error: "Token inválido", status: 401 };
  }
}

// GET /api/admin/pedidos - Obtener todos los pedidos (con filtros)
export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const buscar = searchParams.get('buscar');
    const fechaInicio = searchParams.get('fecha_inicio');
    const fechaFin = searchParams.get('fecha_fin');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const conn = await db.getConnection();

    try {
      // Construir query base
      let query = `
        SELECT o.*, 
          COUNT(oi.id) as total_items,
          SUM(oi.cantidad) as total_productos
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
      `;
      
      const params: any[] = [];
      const whereConditions = [];

      // Filtro por estado
      if (estado && estado !== 'todos') {
        whereConditions.push(`o.status = ?`);
        params.push(estado);
      }

      // Filtro por búsqueda
      if (buscar) {
        whereConditions.push(`(
          o.id LIKE ? OR 
          o.email LIKE ? OR 
          o.nombre LIKE ? OR 
          o.telefono LIKE ?
        )`);
        const searchTerm = `%${buscar}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Filtro por fecha
      if (fechaInicio) {
        whereConditions.push(`DATE(o.created_at) >= DATE(?)`);
        params.push(fechaInicio);
      }
      if (fechaFin) {
        whereConditions.push(`DATE(o.created_at) <= DATE(?)`);
        params.push(fechaFin);
      }

      // Agregar WHERE si hay condiciones
      if (whereConditions.length > 0) {
        query += ` WHERE ` + whereConditions.join(' AND ');
      }

      // Agrupar y ordenar
      query += ` GROUP BY o.id ORDER BY o.created_at DESC`;

      // Paginación
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      // Ejecutar query principal
      const [orders]: any = await conn.query(query, params);

      // Para cada orden, obtener sus items
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

      // Obtener total de registros para paginación
      let countQuery = `SELECT COUNT(DISTINCT o.id) as total FROM orders o`;
      if (whereConditions.length > 0) {
        countQuery += ` WHERE ` + whereConditions.join(' AND ');
      }
      const [totalResult]: any = await conn.query(countQuery, params.slice(0, -2));
      const total = totalResult[0].total;

      // Calcular estadísticas
      const [stats]: any = await conn.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN status = 'procesando' THEN 1 ELSE 0 END) as procesando,
          SUM(CASE WHEN status = 'enviado' THEN 1 ELSE 0 END) as enviados,
          SUM(CASE WHEN status = 'entregado' THEN 1 ELSE 0 END) as entregados,
          SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) as cancelados,
          SUM(CASE WHEN DATE(created_at) = CURDATE() AND status = 'entregado' THEN total ELSE 0 END) as ingresos_hoy
        FROM orders
      `);

      return NextResponse.json({
        orders: ordersWithItems,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0]
      });

    } finally {
      conn.release();
    }

  } catch (error) {
    console.error("Error en GET /api/admin/pedidos:", error);
    return NextResponse.json(
      { error: "Error al obtener los pedidos" },
      { status: 500 }
    );
  }
}