// netlify/functions/generate-contract.js
// Este archivo actúa como proxy seguro para los webhooks de Make.com
// Las URLs reales están en las variables de entorno de Netlify (nunca en el código)

const WEBHOOKS = {
  music: process.env.MAKE_WEBHOOK_MUSIC,
  booth: process.env.MAKE_WEBHOOK_BOOTH,
  dj: process.env.MAKE_WEBHOOK_DJ
};

// Rate limiting simple (en memoria - se reinicia con cada deploy)
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_REQUESTS = 5; // máximo 5 requests por minuto por IP

const checkRateLimit = (ip) => {
  const now = Date.now();
  const userRequests = rateLimits.get(ip) || [];

  // Limpiar requests antiguos
  const validRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);

  if (validRequests.length >= MAX_REQUESTS) {
    return false;
  }

  validRequests.push(now);
  rateLimits.set(ip, validRequests);
  return true;
};

exports.handler = async (event, context) => {
  // Headers CORS para permitir requests desde tu frontend
  const headers = {
    'Access-Control-Allow-Origin': '*', // En producción, cambia por tu dominio exacto
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight requests (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido. Usa POST.' })
    };
  }

  // Obtener IP del cliente para rate limiting
  const clientIP = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';

  // Verificar rate limit
  if (!checkRateLimit(clientIP)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({
        error: 'Demasiadas solicitudes. Por favor espera un minuto antes de intentar de nuevo.',
        retryAfter: 60
      })
    };
  }

  try {
    // Parsear el body
    const { contractType, payload } = JSON.parse(event.body);

    // Validar que contractType sea válido
    if (!contractType || !['music', 'booth', 'dj'].includes(contractType)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Tipo de contrato inválido. Debe ser: music, booth, o dj'
        })
      };
    }

    // Validar que payload exista
    if (!payload || typeof payload !== 'object') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Payload inválido o faltante' })
      };
    }

    // Obtener la URL del webhook correspondiente
    const webhookUrl = WEBHOOKS[contractType];

    if (!webhookUrl) {
      console.error(`Webhook no configurado para tipo: ${contractType}`);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Error de configuración del servidor. Contacta al administrador.'
        })
      };
    }

    console.log(`Procesando contrato tipo: ${contractType}`);

    // Llamar al webhook de Make.com
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Contratia-Netlify-Function/1.0'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();

    // Si Make.com devuelve error
    if (!response.ok) {
      console.error(`Error de Make.com: ${response.status} - ${responseText}`);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `Error del servicio externo: ${response.status}`,
          details: responseText.substring(0, 200) // Limitar detalles expuestos
        })
      };
    }

    // Intentar parsear la respuesta como JSON
    try {
      const result = JSON.parse(responseText);

      console.log(`Contrato generado exitosamente: ${contractType}`);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    } catch (parseError) {
      // Si no es JSON, devolver como texto
      console.log(`Respuesta no-JSON recibida de Make.com`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: responseText
        })
      };
    }

  } catch (error) {
    console.error('Error en la función:', error.message);

    // No exponer detalles del error interno
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error interno del servidor. Por favor intenta de nuevo.'
      })
    };
  }
};
