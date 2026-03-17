// app/api/config/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Intentar obtener la configuración existente
        const [configRows] = await db.query(
            "SELECT * FROM site_config LIMIT 1"
        );
        
        let config = Array.isArray(configRows) && configRows.length > 0 ? configRows[0] : null;

        // Si no existe configuración, crear una por defecto
        if (!config) {
            const [result] = await db.query(
                `INSERT INTO site_config 
                (logo_texto, eslogan, subtitulo, buscar_texto, carrito_texto, 
                 mostrar_eslogan, mostrar_subtitulo, color_logo, color_texto, color_acento) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    'BLACKS',
                    'NUEVA COLECCION / 2026',
                    'PIEZAS ESENCIALES',
                    'BUSCAR Q',
                    '0',
                    true,
                    true,
                    '#000000',
                    '#000000',
                    '#000000'
                ]
            );

            // Obtener la configuración recién creada
            const [newConfigRows] = await db.query(
                "SELECT * FROM site_config WHERE id = ?",
                [(result as any).insertId]
            );
            config = Array.isArray(newConfigRows) && newConfigRows.length > 0 ? newConfigRows[0] : null;
        }

        // Convertir valores booleanos correctamente
        if (config) {
            config = {
                ...config,
                mostrar_eslogan: Boolean(config.mostrar_eslogan),
                mostrar_subtitulo: Boolean(config.mostrar_subtitulo)
            };
        }

        return NextResponse.json(config || {});
    } catch (error) {
        console.error("Error al cargar configuración:", error);
        return NextResponse.json(
            { error: "Error al cargar configuración" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const data = await request.json();

        // Validar y convertir los datos
        const updateData = {
            logo_texto: data.logo_texto || 'BLACKS',
            eslogan: data.eslogan || 'NUEVA COLECCION / 2026',
            subtitulo: data.subtitulo || 'PIEZAS ESENCIALES',
            buscar_texto: data.buscar_texto || 'BUSCAR Q',
            carrito_texto: data.carrito_texto || '0',
            mostrar_eslogan: data.mostrar_eslogan !== undefined ? (data.mostrar_eslogan ? 1 : 0) : 1,
            mostrar_subtitulo: data.mostrar_subtitulo !== undefined ? (data.mostrar_subtitulo ? 1 : 0) : 1,
            color_logo: data.color_logo || '#000000',
            color_texto: data.color_texto || '#000000',
            color_acento: data.color_acento || '#000000'
        };

        // Actualizar la configuración
        await db.query(
            `UPDATE site_config SET 
                logo_texto = ?,
                eslogan = ?,
                subtitulo = ?,
                buscar_texto = ?,
                carrito_texto = ?,
                mostrar_eslogan = ?,
                mostrar_subtitulo = ?,
                color_logo = ?,
                color_texto = ?,
                color_acento = ?,
                updated_at = NOW()
            WHERE id = 1`,
            [
                updateData.logo_texto,
                updateData.eslogan,
                updateData.subtitulo,
                updateData.buscar_texto,
                updateData.carrito_texto,
                updateData.mostrar_eslogan,
                updateData.mostrar_subtitulo,
                updateData.color_logo,
                updateData.color_texto,
                updateData.color_acento
            ]
        );

        // Obtener la configuración actualizada
        const [configRows] = await db.query(
            "SELECT * FROM site_config WHERE id = 1"
        );

        let config = Array.isArray(configRows) && configRows.length > 0 ? configRows[0] : null;

        // Convertir valores booleanos para la respuesta
        if (config) {
            config = {
                ...config,
                mostrar_eslogan: Boolean(config.mostrar_eslogan),
                mostrar_subtitulo: Boolean(config.mostrar_subtitulo)
            };
        }

        return NextResponse.json(config || {});
    } catch (error) {
        console.error("Error al guardar configuración:", error);
        return NextResponse.json(
            { error: "Error al guardar configuración" },
            { status: 500 }
        );
    }
}