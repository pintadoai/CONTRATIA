# Guía de Implementación de Seguridad para Netlify

Esta guía está diseñada específicamente para tu configuración actual: **Netlify con despliegue estático (drag & drop)**.

---

## Tu Situación Actual

```
AHORA:
┌─────────────────┐         ┌─────────────────┐
│   Tu App        │ ──────► │   Make.com      │
│   (Frontend)    │         │   Webhooks      │
│                 │         │   (EXPUESTOS)   │
└─────────────────┘         └─────────────────┘
     │
     │ URLs de webhook visibles en el código
     │ API Key de Gemini visible en el código
     ▼
   ⚠️ RIESGO DE SEGURIDAD
```

```
DESPUÉS (Con Netlify Functions):
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Tu App        │ ──────► │ Netlify Function│ ──────► │   Make.com      │
│   (Frontend)    │         │ (Tu Backend)    │         │   Webhooks      │
│                 │         │ URLs SECRETAS   │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
     │                              │
     │ Solo llama a /api/...       │ Variables de entorno seguras
     ▼                              ▼
   ✅ SEGURO                      ✅ SEGURO
```

---

## PASO 1: Reorganizar tu Proyecto (10 minutos)

Tu carpeta debe quedar así:

```
CONTRATIA/
├── contratia 2/              ← Tu app actual (frontend)
│   ├── App.tsx
│   ├── components/
│   ├── index.html
│   └── ...
│
├── netlify/                  ← NUEVO: Carpeta para funciones
│   └── functions/
│       └── generate-contract.js
│
├── netlify.toml              ← NUEVO: Configuración de Netlify
├── _headers                  ← NUEVO: Headers de seguridad
└── SECURITY_REPORT.md
```

---

## PASO 2: Crear la Función Serverless (Backend Proxy)

### 2.1 Crear el archivo `netlify/functions/generate-contract.js`

```javascript
// netlify/functions/generate-contract.js

// Las URLs de webhook están SEGURAS en variables de entorno
const WEBHOOKS = {
  music: process.env.MAKE_WEBHOOK_MUSIC,
  booth: process.env.MAKE_WEBHOOK_BOOTH,
  dj: process.env.MAKE_WEBHOOK_DJ
};

exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const { contractType, payload } = JSON.parse(event.body);

    // Validar tipo de contrato
    if (!['music', 'booth', 'dj'].includes(contractType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Tipo de contrato inválido' })
      };
    }

    const webhookUrl = WEBHOOKS[contractType];

    if (!webhookUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Webhook no configurado' })
      };
    }

    // Llamar al webhook de Make.com
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Error del servidor: ${response.status}` })
      };
    }

    // Intentar parsear como JSON
    try {
      const result = JSON.parse(responseText);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // En producción, cambiar por tu dominio
        },
        body: JSON.stringify(result)
      };
    } catch {
      return {
        statusCode: 200,
        body: responseText
      };
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};
```

---

## PASO 3: Crear Configuración de Netlify

### 3.1 Crear el archivo `netlify.toml` en la raíz

```toml
# netlify.toml

[build]
  # Carpeta que contiene tu app (ajusta si es diferente)
  publish = "contratia 2"

  # Comando de build (si usas Vite)
  # command = "cd 'contratia 2' && npm install && npm run build"

[functions]
  # Carpeta donde están tus funciones serverless
  directory = "netlify/functions"

# Redirección para que /api/generate-contract llame a la función
[[redirects]]
  from = "/api/generate-contract"
  to = "/.netlify/functions/generate-contract"
  status = 200

# Headers de seguridad para toda la aplicación
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## PASO 4: Crear Headers de Seguridad (Alternativa)

### 4.1 Crear el archivo `_headers` en la raíz

```
# _headers

/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## PASO 5: Configurar Variables de Entorno en Netlify

### 5.1 En el Dashboard de Netlify:

1. Ve a tu sitio en Netlify
2. Click en **"Site settings"** (Configuración del sitio)
3. En el menú izquierdo, click en **"Environment variables"**
4. Click en **"Add a variable"**

### 5.2 Agregar estas variables:

| Key | Value |
|-----|-------|
| `MAKE_WEBHOOK_MUSIC` | `https://hook.us2.make.com/c4ezgi6bqtn6qq3ktq9x2zyltn7s2r8t` |
| `MAKE_WEBHOOK_BOOTH` | `https://hook.us2.make.com/qh9or1ejaatlb9flpt5h23mxhdde57uf` |
| `MAKE_WEBHOOK_DJ` | `https://hook.us2.make.com/hnkpa5d1tcm4fr6kfnrl2gvhghuen21n` |
| `GEMINI_API_KEY` | `tu-api-key-de-gemini` |

**IMPORTANTE:** Después de agregar las variables, debes **re-deployar** el sitio.

---

## PASO 6: Modificar el Frontend

### 6.1 Cambiar `ContractForm.tsx`

**ANTES (inseguro):**
```typescript
const MAKE_WEBHOOK_URL_MUSIC = 'https://hook.us2.make.com/c4ezgi6bqtn6qq3ktq9x2zyltn7s2r8t';
const MAKE_WEBHOOK_URL_BOOTH = 'https://hook.us2.make.com/qh9or1ejaatlb9flpt5h23mxhdde57uf';
const MAKE_WEBHOOK_URL_DJ = 'https://hook.us2.make.com/hnkpa5d1tcm4fr6kfnrl2gvhghuen21n';

// ... más abajo en handleGenerateContract:
const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(finalPayload),
});
```

**DESPUÉS (seguro):**
```typescript
// ELIMINAR estas líneas:
// const MAKE_WEBHOOK_URL_MUSIC = '...';
// const MAKE_WEBHOOK_URL_BOOTH = '...';
// const MAKE_WEBHOOK_URL_DJ = '...';

// ... en handleGenerateContract, cambiar la llamada fetch:
const response = await fetch('/api/generate-contract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        contractType: contractType,  // 'music', 'booth', o 'dj'
        payload: finalPayload
    }),
});
```

---

## PASO 7: Desplegar

### Opción A: Drag & Drop (como haces ahora)

1. Crea la estructura de carpetas como se indica arriba
2. Asegúrate de incluir:
   - `netlify/functions/generate-contract.js`
   - `netlify.toml`
   - `_headers`
3. Arrastra toda la carpeta a Netlify

### Opción B: Conectar con GitHub (Recomendado)

1. Sube tu proyecto a GitHub
2. En Netlify, click en **"Add new site"** → **"Import an existing project"**
3. Conecta con GitHub y selecciona tu repositorio
4. Netlify detectará automáticamente `netlify.toml`
5. Cada vez que hagas push, se despliega automáticamente

---

## Verificar que Funciona

### 1. Verificar que la función existe:

Ve a: `https://tu-sitio.netlify.app/.netlify/functions/generate-contract`

Deberías ver: `{"error":"Método no permitido"}` (porque es GET, no POST)

### 2. Verificar headers de seguridad:

1. Abre tu sitio en Chrome
2. Presiona F12 → Network → recarga la página
3. Click en el documento principal
4. En "Response Headers" deberías ver:
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`

### 3. Verificar que los webhooks NO están expuestos:

1. Abre tu sitio
2. Presiona F12 → Sources
3. Busca "hook.us2.make.com"
4. **NO debería aparecer** ningún resultado

---

## Resumen de Archivos a Crear/Modificar

| Archivo | Acción | Propósito |
|---------|--------|-----------|
| `netlify/functions/generate-contract.js` | CREAR | Backend proxy seguro |
| `netlify.toml` | CREAR | Configuración de Netlify |
| `_headers` | CREAR | Headers de seguridad |
| `contratia 2/components/ContractForm.tsx` | MODIFICAR | Usar el nuevo endpoint |

---

## Costos

**Netlify Functions - Plan Gratuito:**
- 125,000 invocaciones/mes
- 100 horas de ejecución/mes

Para una app de contratos, esto es **más que suficiente**.

---

## Próximos Pasos (Después de implementar esto)

1. ✅ Webhooks protegidos
2. ✅ Headers de seguridad
3. ⏳ Agregar autenticación (siguiente fase)
4. ⏳ Rate limiting (siguiente fase)

---

## Troubleshooting

### "Function not found"
- Verifica que la carpeta sea `netlify/functions/` (no `netlify-functions/`)
- Verifica que el archivo termine en `.js`

### "CORS error"
- Agrega estos headers a la respuesta de la función:
```javascript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

### "Variables de entorno no funcionan"
- Después de agregar variables, debes hacer un nuevo deploy
- En Netlify: Deploys → Trigger deploy → Deploy site

