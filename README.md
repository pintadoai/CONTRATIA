# CONTRATIA

Aplicación interna para generar contratos profesionales para **D Show Events**. Genera contratos de música, photo booth y DJ con integración automática a Make.com para creación de documentos en Google Drive.

## Características

- **3 tipos de contrato**: Música en Vivo, Photo/Video Booth 360, DJ
- **Bilingüe**: Español e Inglés
- **Auto-guardado**: Los formularios se guardan automáticamente en localStorage
- **Historial**: Acceso rápido a contratos generados anteriormente
- **Validación**: Validación en tiempo real de campos (email, teléfono PR/USA, fechas)
- **Integración Make.com**: Generación automática de PDFs en Google Drive
- **Seguro**: Webhooks protegidos via Netlify Functions

## Tech Stack

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19.2.0 | UI Framework |
| TypeScript | 5.8.2 | Type Safety |
| Vite | 6.2.0 | Build Tool |
| Netlify Functions | - | API Segura |
| Make.com | - | Automatización |

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/pintadoai/CONTRATIA.git
cd CONTRATIA/app

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de Entorno

Crear archivo `.env` en `/app`:

```env
# Webhooks de Make.com (solo para desarrollo local)
VITE_WEBHOOK_MUSIC=https://hook.us1.make.com/xxx
VITE_WEBHOOK_BOOTH=https://hook.us1.make.com/xxx
VITE_WEBHOOK_DJ=https://hook.us1.make.com/xxx
```

> **Nota**: En producción, los webhooks están protegidos en Netlify Functions (`netlify/functions/generate-contract.js`)

## Estructura del Proyecto

```
app/
├── components/
│   ├── forms/              # Componentes modulares de formulario
│   │   ├── Section.tsx
│   │   ├── RadioGroup.tsx
│   │   ├── TimeSelector.tsx
│   │   ├── DateInput.tsx
│   │   ├── LanguageSelector.tsx
│   │   └── AddonService.tsx
│   ├── ui/                 # Componentes UI reutilizables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Checkbox.tsx
│   │   └── Textarea.tsx
│   ├── icons/              # Iconos SVG
│   ├── ContractForm.tsx    # Formulario principal
│   ├── ContractHistory.tsx # Panel de historial
│   ├── ContractTypeSelector.tsx
│   ├── DocumentPreview.tsx
│   └── MakeIntegration.tsx
├── hooks/
│   ├── useAutoSave.ts      # Auto-guardado con debounce
│   └── useContractHistory.ts
├── utils/
│   ├── constants.ts        # Configuración centralizada
│   ├── translations.ts     # i18n ES/EN
│   ├── documentGenerator.ts
│   └── export*.ts          # Exportación PDF/DOCX
├── netlify/
│   └── functions/
│       └── generate-contract.js  # API segura
├── App.tsx
├── types.ts
└── index.tsx
```

## Scripts

```bash
npm run dev      # Servidor desarrollo (localhost:5173)
npm run build    # Build producción
npm run preview  # Preview del build
```

## Configuración Centralizada

Toda la configuración está en `utils/constants.ts`:

```typescript
// Precios
PRICING.DEPOSIT_MUSIC_BOOTH  // $125
PRICING.ADDON_SPEAKER        // $25
PRICING.ADDON_EARLY_SETUP    // $50
PRICING.ADDON_BRANDING       // $75

// Config
CONFIG.CURRENT_YEAR          // Año dinámico
CONFIG.AUTOSAVE_DEBOUNCE_MS  // 500ms
CONFIG.CONTRACT_HISTORY_MAX  // 50 contratos

// Meses
MONTH_OPTIONS                // Para select
MONTH_MAP                    // Para conversión
```

## Despliegue

La aplicación está configurada para **Netlify**:

1. Conectar repositorio a Netlify
2. Configurar variables de entorno en Netlify Dashboard:
   - `WEBHOOK_MUSIC`
   - `WEBHOOK_BOOTH`
   - `WEBHOOK_DJ`
3. Build command: `npm run build`
4. Publish directory: `app/dist`

## Flujo de Generación de Contrato

```
Usuario → Formulario → Validación → Netlify Function → Make.com → Google Drive
                                         ↓
                                   URLs de documento
                                         ↓
                              Usuario recibe links (Doc, PDF, Download)
```

## Licencia

Uso interno - D Show Events © 2025
