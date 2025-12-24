import type { ApiRequestParams } from '~/interfaces/ApiResponse';

/**
 * Parámetros para obtener configuración
 */
export interface GetConfigurationParams extends ApiRequestParams {
  name: string;
}

/**
 * Parámetros para guardar configuración
 */
export interface SaveConfigurationParams extends ApiRequestParams {
  name: string;
  config: unknown;
}

