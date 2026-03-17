import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Obteniendo productos de la base de datos...");
    
    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams;
    const categoria = searchParams.get('categoria');
    const subcategoria = searchParams.get('subcategoria');
    const tipo_arete = searchParams.get('tipo_arete');
    const marca = searchParams.get('marca');
    const sort = searchParams.get('sort');
    
    console.log('Filtros recibidos:', { categoria, subcategoria, tipo_arete, marca, sort });
    
    // Construir la consulta SQL base
    let query = `
      SELECT 
        id, 
        nombre, 
        descripcion, 
        marca, 
        categoria, 
        subcategoria,
        tipo_arete,
        precio, 
        precio_oferta, 
        en_oferta, 
        stock, 
        talla, 
        color, 
        imagen,
        imagenes_adicionales,
        videos,
        colores_disponibles,
        precio_mayoreo_1,
        cantidad_mayoreo_1,
        precio_mayoreo_2,
        cantidad_mayoreo_2,
        precio_mayoreo_3,
        cantidad_mayoreo_3
      FROM productos
      WHERE activo = true
    `;
    
    const values: any[] = [];
    
    // Agregar filtros según parámetros
    if (categoria && categoria !== 'todos' && categoria !== 'undefined' && categoria !== 'null') {
      query += ` AND categoria = ?`;
      values.push(categoria);
    }
    
    if (subcategoria && subcategoria !== 'todos' && subcategoria !== 'undefined' && subcategoria !== 'null') {
      query += ` AND subcategoria = ?`;
      values.push(subcategoria);
    }
    
    if (tipo_arete && tipo_arete !== 'todos' && tipo_arete !== 'undefined' && tipo_arete !== 'null') {
      query += ` AND tipo_arete = ?`;
      values.push(tipo_arete);
    }
    
    if (marca && marca !== 'todos' && marca !== 'undefined' && marca !== 'null') {
      query += ` AND marca = ?`;
      values.push(marca);
    }
    
    // Ordenamiento
    if (sort && sort !== 'default') {
      switch(sort) {
        case 'price_asc':
          query += ` ORDER BY precio ASC`;
          break;
        case 'price_desc':
          query += ` ORDER BY precio DESC`;
          break;
        case 'name_asc':
          query += ` ORDER BY nombre ASC`;
          break;
        case 'name_desc':
          query += ` ORDER BY nombre DESC`;
          break;
        default:
          query += ` ORDER BY created_at DESC`;
      }
    } else {
      query += ` ORDER BY created_at DESC`;
    }
    
    console.log('Query SQL:', query);
    console.log('Values:', values);
    
    // Ejecutar la consulta con los valores
    const [productos] = await db.query(query, values);

    // Parsear los campos JSON para cada producto (manejando errores)
    const productosParseados = (productos as any[]).map(producto => ({
      ...producto,
      imagenes_adicionales: (() => {
        if (!producto.imagenes_adicionales) return [];
        
        // Si ya es un array (por si acaso)
        if (Array.isArray(producto.imagenes_adicionales)) {
          return producto.imagenes_adicionales;
        }
        
        // Si es string, intentar parsear
        if (typeof producto.imagenes_adicionales === 'string') {
          try {
            const parsed = JSON.parse(producto.imagenes_adicionales);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            // Si falla el parseo, podría ser una URL simple o CSV
            if (producto.imagenes_adicionales.includes(',')) {
              return producto.imagenes_adicionales.split(',').map((s: string) => s.trim());
            }
            // Es una URL sola
            return [producto.imagenes_adicionales];
          }
        }
        return [];
      })(),
      
      videos: (() => {
        if (!producto.videos) return [];
        if (Array.isArray(producto.videos)) return producto.videos;
        if (typeof producto.videos === 'string') {
          try {
            const parsed = JSON.parse(producto.videos);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            if (producto.videos.includes(',')) {
              return producto.videos.split(',').map((s: string) => s.trim());
            }
            return [producto.videos];
          }
        }
        return [];
      })(),
      
      colores_disponibles: (() => {
        if (!producto.colores_disponibles) return [];
        if (Array.isArray(producto.colores_disponibles)) return producto.colores_disponibles;
        if (typeof producto.colores_disponibles === 'string') {
          try {
            const parsed = JSON.parse(producto.colores_disponibles);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            if (producto.colores_disponibles.includes(',')) {
              return producto.colores_disponibles.split(',').map((s: string) => s.trim());
            }
            return [producto.colores_disponibles];
          }
        }
        return [];
      })()
    }));

    return NextResponse.json(productosParseados || []);
    
  } catch (error) {
    console.error("Error en GET /api/productos:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    console.log('Datos recibidos en POST:', data);

    if (!data.nombre || !data.precio || !data.categoria) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: nombre, precio, categoria" },
        { status: 400 }
      );
    }

    const {
      nombre,
      descripcion,
      marca,
      categoria,
      subcategoria,
      tipo_arete,
      precio,
      precio_oferta,
      en_oferta,
      stock,
      talla,
      color,
      imagen,
      imagenes_adicionales = [],
      videos = [],
      colores_disponibles = [],
      precio_mayoreo_1,
      cantidad_mayoreo_1,
      precio_mayoreo_2,
      cantidad_mayoreo_2,
      precio_mayoreo_3,
      cantidad_mayoreo_3
    } = data;

    const precioNum = parseFloat(precio);
    const precioOfertaNum = precio_oferta ? parseFloat(precio_oferta) : null;
    const stockNum = parseInt(stock, 10) || 0;
    const enOfertaBool = en_oferta === true || en_oferta === 1 || en_oferta === 'true';
    
    const precioMayoreo1 = precio_mayoreo_1 ? parseFloat(precio_mayoreo_1) : null;
    const cantidadMayoreo1 = cantidad_mayoreo_1 ? parseInt(cantidad_mayoreo_1, 10) : 0;
    const precioMayoreo2 = precio_mayoreo_2 ? parseFloat(precio_mayoreo_2) : null;
    const cantidadMayoreo2 = cantidad_mayoreo_2 ? parseInt(cantidad_mayoreo_2, 10) : 0;
    const precioMayoreo3 = precio_mayoreo_3 ? parseFloat(precio_mayoreo_3) : null;
    const cantidadMayoreo3 = cantidad_mayoreo_3 ? parseInt(cantidad_mayoreo_3, 10) : 0;

    const imagenesAdicionalesJSON = JSON.stringify(imagenes_adicionales);
    const videosJSON = JSON.stringify(videos);
    const coloresDisponiblesJSON = JSON.stringify(colores_disponibles);

    const [result] = await db.query(
      `
      INSERT INTO productos 
      (
        nombre, descripcion, marca, categoria, subcategoria, tipo_arete, 
        precio, precio_oferta, en_oferta, stock, talla, color, imagen, activo,
        imagenes_adicionales,
        videos,
        colores_disponibles,
        precio_mayoreo_1, cantidad_mayoreo_1,
        precio_mayoreo_2, cantidad_mayoreo_2,
        precio_mayoreo_3, cantidad_mayoreo_3
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nombre,
        descripcion || null,
        marca || null,
        categoria,
        subcategoria || null,
        tipo_arete || null,
        precioNum,
        precioOfertaNum,
        enOfertaBool,
        stockNum,
        talla || null,
        color || null,
        imagen || null,
        true,
        imagenesAdicionalesJSON,
        videosJSON,
        coloresDisponiblesJSON,
        precioMayoreo1,
        cantidadMayoreo1,
        precioMayoreo2,
        cantidadMayoreo2,
        precioMayoreo3,
        cantidadMayoreo3
      ]
    );

    return NextResponse.json(
      { message: "Producto creado correctamente", id: (result as any).insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/productos:", error);
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    );
  }
}