# Plan de Acción de Seguridad - CONTRATIA

**Fecha:** 12 de Diciembre, 2025
**Aplicación:** Contratia - Generador de Contratos
**Prioridad:** ALTA - Acción Inmediata Requerida

---

## Resumen Ejecutivo

Este plan de acción presenta las mejoras de seguridad organizadas por **prioridad y urgencia**. Se recomienda seguir este orden para maximizar la protección de la aplicación con el menor esfuerzo inicial.

---

## FASE 1: CRÍTICO - Implementar Inmediatamente (1-3 días)

### 1.1 Proteger las URLs de Webhooks

**Problema:** Las URLs de Make.com están expuestas en el código frontend.

**Ubicación:** `contratia 2/components/ContractForm.tsx:25-27`

**Solución Recomendada:**

```
OPCIÓN A: Backend Proxy (Recomendada)
├── Crear un servidor backend simple (Node.js/Express, Vercel Functions, Netlify Functions)
├── El backend almacena las URLs de webhook de forma segura
├── El frontend llama al backend, no directamente a Make.com
└── Beneficio: URLs nunca expuestas al cliente

OPCIÓN B: Variables de Entorno + Ofuscación (Temporal)
├── Mover URLs a variables de entorno
├── Configurar en el servidor de hosting (Vercel, Netlify, etc.)
└── Nota: Sigue siendo visible en el bundle, pero más difícil de encontrar
```

**Implementación Backend Proxy (Recomendada):**

```javascript
// Ejemplo: api/generate-contract.js (Vercel/Netlify Function)
export default async function handler(req, res) {
  // Verificar origen
  const allowedOrigins = ['https://tu-dominio.com'];
  if (!allowedOrigins.includes(req.headers.origin)) {
    return res.status(403).json({ error: 'Origen no autorizado' });
  }

  // URLs seguras en el servidor
  const WEBHOOKS = {
    music: process.env.MAKE_WEBHOOK_MUSIC,
    booth: process.env.MAKE_WEBHOOK_BOOTH,
    dj: process.env.MAKE_WEBHOOK_DJ
  };

  const { contractType, payload } = req.body;

  const response = await fetch(WEBHOOKS[contractType], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  res.status(200).json(data);
}
```

**Esfuerzo:** 4-8 horas
**Impacto:** Elimina el riesgo más crítico

---

### 1.2 Proteger la API Key de Gemini

**Problema:** La API key se embebe en el JavaScript del cliente.

**Ubicación:** `contratia 2/vite.config.ts:13-16`, `contratia 2/services/geminiService.ts`

**Solución:**

```
1. Crear endpoint en el backend para llamadas a Gemini
2. Almacenar API key solo en variables de entorno del servidor
3. El frontend NUNCA debe tener acceso a la key
```

**Implementación:**

```javascript
// api/ai-suggest.js (Backend)
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // API key segura en el servidor
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const { prompt } = req.body;

  // Validar y sanitizar el prompt
  if (!prompt || prompt.length > 1000) {
    return res.status(400).json({ error: 'Prompt inválido' });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  res.status(200).json({ suggestion: response.text.trim() });
}
```

**Esfuerzo:** 2-4 horas
**Impacto:** Previene abuso de tu cuenta de API

---

## FASE 2: ALTA PRIORIDAD - Implementar Esta Semana (4-7 días)

### 2.1 Agregar Rate Limiting

**Problema:** Sin límites, atacantes pueden abusar de los endpoints.

**Solución Simple (Frontend):**

```typescript
// utils/rateLimiter.ts
const rateLimits = new Map<string, number[]>();

export const checkRateLimit = (action: string, maxRequests = 5, windowMs = 60000): boolean => {
  const now = Date.now();
  const timestamps = rateLimits.get(action) || [];

  // Limpiar timestamps antiguos
  const validTimestamps = timestamps.filter(t => now - t < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return false; // Límite excedido
  }

  validTimestamps.push(now);
  rateLimits.set(action, validTimestamps);
  return true;
};

// Uso en ContractForm.tsx
const handleGenerateContract = async () => {
  if (!checkRateLimit('generateContract', 3, 60000)) {
    setApiError('Has excedido el límite de solicitudes. Espera 1 minuto.');
    return;
  }
  // ... resto del código
};
```

**Solución Backend (Más Robusta):**

```javascript
// Usar biblioteca como 'express-rate-limit' o 'rate-limiter-flexible'
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // 5 solicitudes por ventana
  message: { error: 'Demasiadas solicitudes, intenta más tarde' }
});

app.use('/api/generate-contract', limiter);
```

**Esfuerzo:** 2-4 horas
**Impacto:** Previene abuso y DoS

---

### 2.2 Agregar Autenticación Básica

**Problema:** Cualquiera puede acceder y generar contratos.

**Solución Recomendada: Firebase Authentication**

```
¿Por qué Firebase Auth?
├── Fácil de implementar (pocas horas)
├── Gratis hasta 10,000 usuarios/mes
├── Soporta email/contraseña, Google, etc.
└── SDK para React disponible
```

**Implementación Básica:**

```typescript
// services/auth.ts
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  // Configuración de Firebase (estas SÍ pueden estar en frontend)
  apiKey: "tu-api-key-publica",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Hook para proteger la app
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  return { user, loading };
};
```

```typescript
// App.tsx - Proteger la aplicación
const App = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user) return <LoginPage />;

  return <ContractGenerator />;
};
```

**Esfuerzo:** 8-16 horas
**Impacto:** Control total sobre quién usa la aplicación

---

### 2.3 Agregar Protección CSRF

**Problema:** Sitios maliciosos podrían enviar solicitudes en nombre del usuario.

**Solución con Tokens:**

```typescript
// utils/csrf.ts
export const generateCSRFToken = (): string => {
  const token = crypto.randomUUID();
  sessionStorage.setItem('csrf_token', token);
  return token;
};

export const validateCSRFToken = (token: string): boolean => {
  const storedToken = sessionStorage.getItem('csrf_token');
  return token === storedToken;
};

// En las llamadas API
const handleGenerateContract = async () => {
  const csrfToken = generateCSRFToken();

  const response = await fetch('/api/generate-contract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify({ ...payload, _csrf: csrfToken })
  });
};
```

**Esfuerzo:** 2-4 horas
**Impacto:** Previene ataques CSRF

---

## FASE 3: MEDIA PRIORIDAD - Implementar Este Mes (2-4 semanas)

### 3.1 Agregar Integridad de Recursos (SRI)

**Problema:** Scripts externos sin verificación de integridad.

**Ubicación:** `contratia 2/index.html`

**Solución:**

```html
<!-- Antes (inseguro) -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Después (seguro) -->
<script
  src="https://cdn.tailwindcss.com/3.4.0"
  integrity="sha384-[hash-del-archivo]"
  crossorigin="anonymous">
</script>
```

**Mejor Opción - Instalar Localmente:**

```bash
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```javascript
// tailwind.config.js
module.exports = {
  content: ["./contratia 2/**/*.{tsx,ts,jsx,js,html}"],
  theme: { extend: {} },
  plugins: [],
}
```

**Esfuerzo:** 2-4 horas
**Impacto:** Previene ataques de cadena de suministro

---

### 3.2 Proteger Datos en localStorage

**Problema:** PII almacenada sin cifrar.

**Solución - Cifrado Simple:**

```typescript
// utils/secureStorage.ts
const ENCRYPTION_KEY = 'tu-clave-segura'; // En producción, derivar de la sesión del usuario

// Cifrado simple con Web Crypto API
const encrypt = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(ENCRYPTION_KEY),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode('salt'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );

  return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
};

// Uso en useAutoSave
const saveSecurely = async (key: string, data: object) => {
  const encrypted = await encrypt(JSON.stringify(data));
  localStorage.setItem(key, encrypted);
};
```

**Alternativa Más Simple - sessionStorage:**

```typescript
// Cambiar localStorage por sessionStorage (se borra al cerrar el navegador)
sessionStorage.setItem(storageKey, JSON.stringify(data));
```

**Esfuerzo:** 4-8 horas
**Impacto:** Protege datos personales de los clientes

---

### 3.3 Agregar Headers de Seguridad

**Solución para Vercel (vercel.json):**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://hook.us2.make.com https://generativelanguage.googleapis.com; img-src 'self' data:;"
        }
      ]
    }
  ]
}
```

**Solución para Netlify (_headers):**

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
```

**Esfuerzo:** 1-2 horas
**Impacto:** Capa adicional de defensa

---

## FASE 4: MEJORAS CONTINUAS - Mantenimiento Regular

### 4.1 Auditoría de Dependencias

```bash
# Ejecutar regularmente
npm audit

# Corregir vulnerabilidades automáticamente
npm audit fix

# Actualizar dependencias
npm update
```

### 4.2 Logging y Monitoreo

```typescript
// services/logger.ts
export const logSecurityEvent = (event: string, details: object) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
  };

  // Enviar a servicio de logging (LogRocket, Sentry, etc.)
  console.log('[SECURITY]', logEntry);

  // En producción, enviar a backend
  // fetch('/api/log', { method: 'POST', body: JSON.stringify(logEntry) });
};

// Uso
logSecurityEvent('CONTRACT_GENERATED', { contractType: 'music', contractId: '001' });
logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip: 'xxx.xxx.xxx.xxx' });
```

### 4.3 Política de Retención de Datos

```typescript
// hooks/useAutoSave.ts - Agregar expiración
const EXPIRATION_DAYS = 7;

useEffect(() => {
  const savedData = localStorage.getItem(storageKey);
  if (savedData) {
    const { data, timestamp } = JSON.parse(savedData);
    const age = Date.now() - timestamp;

    if (age > EXPIRATION_DAYS * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(storageKey); // Borrar datos antiguos
    } else {
      setData(data);
    }
  }
}, [storageKey]);

// Al guardar
localStorage.setItem(storageKey, JSON.stringify({
  data,
  timestamp: Date.now()
}));
```

---

## Cronograma Recomendado

```
SEMANA 1 (URGENTE)
├── Día 1-2: Crear backend proxy para webhooks
├── Día 3: Mover API key de Gemini al backend
└── Día 4-5: Testing y despliegue

SEMANA 2
├── Día 1-2: Implementar rate limiting
├── Día 3-4: Agregar autenticación básica
└── Día 5: Protección CSRF

SEMANA 3-4
├── Instalar Tailwind localmente (eliminar CDN)
├── Configurar headers de seguridad
├── Cifrar localStorage o migrar a sessionStorage
└── Configurar logging básico

MANTENIMIENTO MENSUAL
├── Ejecutar npm audit
├── Revisar logs de seguridad
├── Actualizar dependencias
└── Revisar accesos de usuarios
```

---

## Checklist de Implementación

### Fase 1 - Crítico
- [ ] Backend proxy para webhooks creado
- [ ] API key de Gemini movida al servidor
- [ ] Variables de entorno configuradas en hosting

### Fase 2 - Alta Prioridad
- [ ] Rate limiting implementado
- [ ] Sistema de autenticación activo
- [ ] Protección CSRF agregada

### Fase 3 - Media Prioridad
- [ ] Tailwind instalado localmente
- [ ] Headers de seguridad configurados
- [ ] Datos en localStorage protegidos

### Fase 4 - Continuo
- [ ] npm audit ejecutado sin vulnerabilidades críticas
- [ ] Sistema de logging activo
- [ ] Política de retención de datos implementada

---

## Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Vercel Security Headers](https://vercel.com/docs/concepts/projects/headers)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

**Contacto para Dudas:** Este plan fue generado automáticamente. Para asistencia adicional con la implementación, consulte con su equipo de desarrollo.
