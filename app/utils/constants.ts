/**
 * Centralized configuration and pricing constants
 * All prices are in USD
 */

export const PRICING = {
  // Deposits
  DEPOSIT_MUSIC_BOOTH: 125,
  DEPOSIT_DJ_PERCENT: 0.5,

  // Add-ons Photo Booth
  ADDON_SPEAKER: 25,
  ADDON_EARLY_SETUP: 50,
  ADDON_BRANDING: 75,

  // Sound options
  SOUND_UPGRADE: 150,

  // Administrative fees
  SAME_DAY_CHANGE_FEE: 100,
  DATE_CHANGE_FEE: 50,

  // Outdoor event fee
  OUTDOOR_TENT_FEE: 150,
} as const;

export const CONFIG = {
  // Dynamic year - automatically updates
  CURRENT_YEAR: new Date().getFullYear().toString(),

  // Puerto Rico timezone (AST = UTC-4, no daylight saving)
  PR_TIMEZONE_OFFSET: -4,

  // Auto-save debounce in milliseconds
  AUTOSAVE_DEBOUNCE_MS: 500,

  // Contract history max items
  CONTRACT_HISTORY_MAX: 50,

  // Company info
  COMPANY_NAME: "D' Show Events LLC",
  COMPANY_EMAIL: "info@dshowevents.com",
  CHECKS_PAYABLE_TO: "D' SHOW EVENTS LLC",
} as const;

// Webhook URLs - loaded from environment variables
export const WEBHOOKS = {
  MUSIC: import.meta.env.VITE_WEBHOOK_MUSIC || '',
  BOOTH: import.meta.env.VITE_WEBHOOK_BOOTH || '',
  DJ: import.meta.env.VITE_WEBHOOK_DJ || '',
} as const;

// Month names for date handling (Spanish)
export const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
] as const;

// Month options for select dropdowns
export const MONTH_OPTIONS = [
  { value: 'enero', label: 'Enero' },
  { value: 'febrero', label: 'Febrero' },
  { value: 'marzo', label: 'Marzo' },
  { value: 'abril', label: 'Abril' },
  { value: 'mayo', label: 'Mayo' },
  { value: 'junio', label: 'Junio' },
  { value: 'julio', label: 'Julio' },
  { value: 'agosto', label: 'Agosto' },
  { value: 'septiembre', label: 'Septiembre' },
  { value: 'octubre', label: 'Octubre' },
  { value: 'noviembre', label: 'Noviembre' },
  { value: 'diciembre', label: 'Diciembre' },
] as const;

// Month name to number mapping for validation
export const MONTH_MAP: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
};

// Type exports for type safety
export type PricingKey = keyof typeof PRICING;
export type ConfigKey = keyof typeof CONFIG;
export type MonthName = typeof MONTH_NAMES[number];
