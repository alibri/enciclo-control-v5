import { consola } from 'consola';

/**
 * Logger wrapper alrededor de consola con niveles y control de producción
 */
export function useLogger() {
  let isProduction = false;
  
  try {
    const runtimeConfig = useRuntimeConfig();
    isProduction = runtimeConfig.public?.APP_MODE === 'production';
  } catch (error) {
    // Si useRuntimeConfig no está disponible, asumimos que estamos en desarrollo
    isProduction = false;
  }

  return {
    /**
     * Log de debug (solo en desarrollo)
     */
    debug: (...args: unknown[]): void => {
      if (!isProduction) {
        consola.debug(...args);
      }
    },

    /**
     * Log de información
     */
    info: (...args: unknown[]): void => {
      if (!isProduction) {
        consola.info(...args);
      }
    },

    /**
     * Log de advertencia
     */
    warn: (...args: unknown[]): void => {
      consola.warn(...args);
    },

    /**
     * Log de error (siempre activo)
     */
    error: (...args: unknown[]): void => {
      consola.error(...args);
    },

    /**
     * Log de éxito
     */
    success: (...args: unknown[]): void => {
      if (!isProduction) {
        consola.success(...args);
      }
    }
  };
}

