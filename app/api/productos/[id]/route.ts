import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [productos] = await db.query(
      `
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
      WHERE id = ? AND activo = true
      `,
      [id]
    );

    const producto = (productos as any[])[0];

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Función para normalizar URLs (agregar / al inicio si no tiene)
    const normalizarUrl = (url: string): string => {
      if (!url) return url;
      return url.startsWith('/') ? url : `/${url}`;
    };

    // Parsear los campos JSON para cada producto
    const productoParseado = {
      ...producto,
      imagen: producto.imagen ? normalizarUrl(producto.imagen) : null,

      // Imágenes adicionales
      imagenes_adicionales: (() => {
        if (!producto.imagenes_adicionales) return [];

        if (typeof producto.imagenes_adicionales === 'string') {
          try {
            const parsed = JSON.parse(producto.imagenes_adicionales);
            if (Array.isArray(parsed)) {
              return parsed.map((url: string) => normalizarUrl(url));
            }
            return [normalizarUrl(producto.imagenes_adicionales)];
          } catch {
            if (producto.imagenes_adicionales.includes(',')) {
              return producto.imagenes_adicionales
                .split(',')
                .map((s: string) => normalizarUrl(s.trim()));
            }
            return [normalizarUrl(producto.imagenes_adicionales)];
          }
        }

        if (Array.isArray(producto.imagenes_adicionales)) {
          return producto.imagenes_adicionales.map((url: string) =>
            normalizarUrl(url)
          );
        }

        return [];
      })(),

      // Videos
      videos: (() => {
        if (!producto.videos) return [];
        if (Array.isArray(producto.videos)) return producto.videos;
        if (typeof producto.videos === 'string') {
          try {
            const parsed = JSON.parse(producto.videos);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            if (producto.videos.includes(',')) {
              return producto.videos
                .split(',')
                .map((s: string) => s.trim());
            }
            return [producto.videos];
          }
        }
        return [];
      })(),

      // Colores disponibles
      colores_disponibles: (() => {
        if (!producto.colores_disponibles) return [];
        if (Array.isArray(producto.colores_disponibles))
          return producto.colores_disponibles;
        if (typeof producto.colores_disponibles === 'string') {
          try {
            const parsed = JSON.parse(producto.colores_disponibles);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            if (producto.colores_disponibles.includes(',')) {
              return producto.colores_disponibles
                .split(',')
                .map((s: string) => s.trim());
            }
            return [producto.colores_disponibles];
          }
        }
        return [];
      })(),
    };

    console.log(
      'Producto parseado - imágenes adicionales:',
      productoParseado.imagenes_adicionales
    );

    return NextResponse.json(productoParseado);
  } catch (error) {
    console.error("Error en GET /api/productos/[id]:", error);
    return NextResponse.json(
      { error: "Error al obtener el producto" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

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
    const precioOfertaNum =
      precio_oferta && parseFloat(precio_oferta) > 0
        ? parseFloat(precio_oferta)
        : null;
    const stockNum = parseInt(stock, 10) || 0;
    const enOfertaBool = en_oferta === true || en_oferta === 1 || en_oferta === 'true';

    const precioMayoreo1 = precio_mayoreo_1 ? parseFloat(precio_mayoreo_1) : null;
    const cantidadMayoreo1 = cantidad_mayoreo_1 ? parseInt(cantidad_mayoreo_1, 10) : 0;
    const precioMayoreo2 = precio_mayoreo_2 ? parseFloat(precio_mayoreo_2) : null;
    const cantidadMayoreo2 = cantidad_mayoreo_2 ? parseInt(cantidad_mayoreo_2, 10) : 0;
    const precioMayoreo3 = precio_mayoreo_3 ? parseFloat(precio_mayoreo_3) : null;
    const cantidadMayoreo3 = cantidad_mayoreo_3 ? parseInt(cantidad_mayoreo_3, 10) : 0;

    const quitarBarraInicial = (url: string): string => {
      if (!url) return url;
      return url.startsWith('/') ? url.substring(1) : url;
    };

    const imagenNormalizada = imagen ? quitarBarraInicial(imagen) : null;

    const imagenesAdicionalesNormalizadas = imagenes_adicionales
      .map((url: string) => quitarBarraInicial(url))
      .filter((url: string) => url);

    const videosNormalizados = videos.filter((url: string) => url);

    const imagenesAdicionalesJSON =
      imagenesAdicionalesNormalizadas.length > 0
        ? JSON.stringify(imagenesAdicionalesNormalizadas)
        : null;
    const videosJSON =
      videosNormalizados.length > 0 ? JSON.stringify(videosNormalizados) : null;
    const coloresDisponiblesJSON =
      colores_disponibles.length > 0 ? JSON.stringify(colores_disponibles) : null;

    await db.query(
      `
      UPDATE productos 
      SET 
        nombre = ?,
        descripcion = ?,
        marca = ?,
        categoria = ?,
        subcategoria = ?,
        tipo_arete = ?,
        precio = ?,
        precio_oferta = ?,
        en_oferta = ?,
        stock = ?,
        talla = ?,
        color = ?,
        imagen = ?,
        imagenes_adicionales = ?,
        videos = ?,
        colores_disponibles = ?,
        precio_mayoreo_1 = ?,
        cantidad_mayoreo_1 = ?,
        precio_mayoreo_2 = ?,
        cantidad_mayoreo_2 = ?,
        precio_mayoreo_3 = ?,
        cantidad_mayoreo_3 = ?
      WHERE id = ?
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
        enOfertaBool ? 1 : 0,
        stockNum,
        talla || null,
        color || null,
        imagenNormalizada,
        imagenesAdicionalesJSON,
        videosJSON,
        coloresDisponiblesJSON,
        precioMayoreo1,
        cantidadMayoreo1 > 0 ? cantidadMayoreo1 : null,
        precioMayoreo2,
        cantidadMayoreo2 > 0 ? cantidadMayoreo2 : null,
        precioMayoreo3,
        cantidadMayoreo3 > 0 ? cantidadMayoreo3 : null,
        id
      ]
    );

    return NextResponse.json({
      message: "Producto actualizado correctamente",
      imagenes_adicionales: imagenesAdicionalesNormalizadas
    });
  } catch (error) {
    console.error("Error en PUT /api/productos/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}