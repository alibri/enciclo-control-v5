/**
 * Constantes de configuración de la aplicación
 */

/**
 * Tamaños de archivo en bytes
 */
export const FILE_SIZES = {
  MAX_DEFAULT: 100_000_000, // 100MB
  MAX_LARGE: 500_000_000, // 500MB
} as const;

/**
 * Timeouts de API en milisegundos
 */
export const API_TIMEOUTS = {
  DEFAULT: 30_000, // 30 segundos
  LONG_TASK: 300_000, // 5 minutos
} as const;

/**
 * Formatos de archivo aceptados
 */
export const FILE_ACCEPT_FORMATS = {
  DOCUMENTS: '.pdf,.doc,.docx,.txt',
  IMAGES: '.jpg,.jpeg,.png,.gif,.webp',
  EXCEL: '.xlsx,.xls,.csv',
} as const;

