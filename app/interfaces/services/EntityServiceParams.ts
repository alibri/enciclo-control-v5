import type { ApiRequestParams } from '~/interfaces/ApiResponse';

/**
 * Parámetros genéricos para operaciones de entidades
 */
export interface EntityParams extends ApiRequestParams {
  page?: number;
  items?: number;
  filter?: Record<string, unknown>;
  order?: string | null;
  [key: string]: unknown;
}

/**
 * Respuesta de la lista de entidades
 */
export interface EntityListResponse {
  success: boolean;
  message?: string;
  list?: unknown[];
  total?: number;
}

