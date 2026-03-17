// app/api/chat/route.ts
import { NextResponse } from 'next/server';

// Base de conocimiento de BLACKS
const knowledgeBase = {
  sucursales: [
    {
      nombre: 'BLACKS Centro',
      direccion: 'Av. Juárez #123, Centro, CDMX',
      horario: 'Lun-Sáb: 11am-8pm, Dom: 12pm-6pm',
      telefono: '55-1234-5678'
    },
    {
      nombre: 'BLACKS Polanco',
      direccion: 'Masaryk #321, Polanco, CDMX',
      horario: 'Lun-Sáb: 10am-9pm, Dom: 11am-7pm',
      telefono: '55-8765-4321'
    },
    {
      nombre: 'BLACKS Santa Fe',
      direccion: 'Centro Comercial Santa Fe, Local 45, CDMX',
      horario: 'Lun-Dom: 11am-8pm',
      telefono: '55-2468-1357'
    }
  ],
  envios: {
    nacional: 'Envíos a todo México en 3-5 días hábiles. GRATIS en compras mayores a $1,500 MXN',
    internacional: 'Disponible en USA y Canadá (7-10 días hábiles)',
    costos: 'Nacional: $99 MXN | Internacional: $25 USD'
  },
  devoluciones: {
    politica: '30 días para devoluciones con etiqueta y empaque original',
    proceso: 'Inicia tu devolución en la sección MIS PEDIDOS o en cualquier sucursal'
  },
  pagos: [
    'Tarjetas de crédito/débito (Visa, Mastercard, Amex)',
    'PayPal',
    'Transferencia bancaria (10% de descuento)',
    'Efectivo en OXXO o 7-Eleven'
  ],
  tallas: 'Disponemos de tallas XS a XL. Consulta la guía de tallas en cada producto.',
  productos: 'Moda urbana y contemporánea: playeras, sudaderas, pantalones, accesorios y más.',
  contacto: {
    email: 'hola@blacks.mx',
    telefono: '55-9876-5432',
    whatsapp: '55-9876-5432'
  }
};

function findAnswer(query: string): string {
  const q = query.toLowerCase();
  
  // Direcciones / Sucursales
  if (q.includes('dirección') || q.includes('ubicación') || q.includes('sucursal') || q.includes('tienda') || q.includes('dónde están')) {
    let response = '📍 **Nuestras Sucursales:**\n\n';
    knowledgeBase.sucursales.forEach((s, i) => {
      response += `**${s.nombre}**\n`;
      response += `• Dirección: ${s.direccion}\n`;
      response += `• Horario: ${s.horario}\n`;
      response += `• Teléfono: ${s.telefono}\n\n`;
    });
    return response;
  }
  
  // Horarios
  if (q.includes('horario') || q.includes('abren') || q.includes('cierran') || q.includes('atienden')) {
    let response = '⏰ **Horarios de Atención:**\n\n';
    knowledgeBase.sucursales.forEach((s) => {
      response += `• ${s.nombre}: ${s.horario}\n`;
    });
    return response;
  }
  
  // Envíos
  if (q.includes('envío') || q.includes('envios') || q.includes('mandar') || q.includes('delivery') || q.includes('costo de envío')) {
    return `🚚 **Envíos:**\n\n• Nacional: ${knowledgeBase.envios.nacional}\n• Internacional: ${knowledgeBase.envios.internacional}\n• Costos: ${knowledgeBase.envios.costos}`;
  }
  
  // Devoluciones
  if (q.includes('devolución') || q.includes('devoluciones') || q.includes('cambios') || q.includes('reembolso') || q.includes('garantía')) {
    return `↩️ **Devoluciones:**\n\n• ${knowledgeBase.devoluciones.politica}\n• ${knowledgeBase.devoluciones.proceso}`;
  }
  
  // Pagos
  if (q.includes('pago') || q.includes('pagar') || q.includes('tarjeta') || q.includes('efectivo') || q.includes('paypal')) {
    return '💳 **Métodos de Pago:**\n\n' + knowledgeBase.pagos.map(p => `• ${p}`).join('\n');
  }
  
  // Tallas
  if (q.includes('talla') || q.includes('tallas') || q.includes('medidas')) {
    return `👕 **Tallas:**\n\n${knowledgeBase.tallas}\n\n¿Necesitas ayuda con una talla específica?`;
  }
  
  // Productos
  if (q.includes('producto') || q.includes('venden') || q.includes('ropa') || q.includes('marcas')) {
    return `🛍️ **Productos:**\n\n${knowledgeBase.productos}\n\nExplora nuestra colección en la sección SHOP.`;
  }
  
  // Contacto
  if (q.includes('contacto') || q.includes('hablar') || q.includes('ayuda') || q.includes('soporte') || q.includes('teléfono')) {
    return `📞 **Contacto:**\n\n• Email: ${knowledgeBase.contacto.email}\n• Teléfono: ${knowledgeBase.contacto.telefono}\n• WhatsApp: ${knowledgeBase.contacto.whatsapp}`;
  }
  
  // Saludo
  if (q.includes('hola') || q.includes('buenos días') || q.includes('buenas') || q.includes('qué tal')) {
    return '¡Hola! 😊 ¿Cómo puedo ayudarte hoy? Puedes preguntarme sobre:\n\n• Sucursales y horarios\n• Envíos y devoluciones\n• Métodos de pago\n• Tallas y productos\n• Contacto';
  }
  
  // Default
  return 'No tengo información específica sobre eso. ¿Podrías preguntarme de otra manera? Puedo ayudarte con:\n\n📍 Direcciones de sucursales\n⏰ Horarios\n🚚 Envíos\n↩️ Devoluciones\n💳 Pagos\n👕 Tallas';
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 800));

    // Buscar respuesta en la base de conocimiento
    const response = findAnswer(message);

    return NextResponse.json({ response });
    
  } catch (error) {
    console.error('Error en chat:', error);
    return NextResponse.json(
      { error: 'Error procesando la solicitud' },
      { status: 500 }
    );
  }
}