import type { Ref } from 'vue';
import type { ConfigApiCall } from '~/stores/api';

/**
 * Respuesta de error de la API
 */
export interface ApiError {
  message: string;
  code?: string | number;
  details?: unknown;
}

/**
 * Respuesta genérica de la API
 * @template T - Tipo de datos de la respuesta exitosa
 */
export interface ApiResponse<T = unknown> {
  data: Ref<T | null>;
  error: Ref<ApiError | null>;
  pending: Ref<boolean>;
  status: Ref<'success' | 'error'>;
}

/**
 * Parámetros comunes para peticiones API
 */
export interface ApiRequestParams {
  session_id?: string | null;
  [key: string]: unknown;
}

/**
 * Cliente API tipado
 */
export interface ApiClient {
  /**
   * Realiza una petición GET (aunque internamente usa POST)
   * @template T - Tipo de datos esperados en la respuesta
   * @param method - Método/endpoint de la API
   * @param data - Datos a enviar
   * @param config - Configuración adicional de la petición
   * @returns Promise con la respuesta tipada
   */
  get<T = unknown>(
    method: string,
    data?: ApiRequestParams | null,
    config?: ConfigApiCall
  ): Promise<ApiResponse<T>>;

  /**
   * Realiza una petición POST
   * @template T - Tipo de datos esperados en la respuesta
   * @param method - Método/endpoint de la API
   * @param data - Datos a enviar
   * @param config - Configuración adicional de la petición
   * @returns Promise con la respuesta tipada
   */
  post<T = unknown>(
    method: string,
    data?: ApiRequestParams | null,
    config?: ConfigApiCall
  ): Promise<ApiResponse<T>>;
}

