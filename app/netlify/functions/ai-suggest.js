// netlify/functions/ai-suggest.js
// Proxy seguro para llamadas a Gemini AI
// La API key está en las variables de entorno de Netlify (nunca en el código)

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Rate limiting
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_REQUESTS = 10; // máximo 10 requests por minuto por IP

const checkRateLimit = (ip) => {
  const now = Date.now();
  const userRequests = rateLimits.get(ip) || [];
  const validRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);

  if (validRequests.length >= MAX_REQUESTS) {
    return false;
  }

  validRequests.push(now);
  rateLimits.set(ip, validRequests);
  return true;
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Solo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido. Usa POST.' })
    };
  }

  // Verificar que la API key está configurada
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY no está configurada en las variables de entorno');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Servicio de IA no configurado. Contacta al administrador.' })
    };
  }

  // Rate limiting
  const clientIP = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  if (!checkRateLimit(clientIP)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({
        error: 'Demasiadas solicitudes de IA. Espera un minuto.',
        retryAfter: 60
      })
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    // Validar prompt
    if (!prompt || typeof prompt !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt inválido o faltante' })
      };
    }

    // Limitar longitud del prompt (seguridad)
    if (prompt.length > 2000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt demasiado largo. Máximo 2000 caracteres.' })
      };
    }

    console.log(`Procesando solicitud de IA: ${prompt.substring(0, 50)}...`);

    // Llamar a Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error de Gemini API: ${response.status} - ${errorText}`);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Error al procesar la solicitud de IA' })
      };
    }

    const data = await response.json();

    // Extraer el texto de la respuesta
    const suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('Solicitud de IA procesada exitosamente');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ suggestion: suggestion.trim() })
    };

  } catch (error) {
    console.error('Error en la función ai-suggest:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};
