import type { ApiRequestParams } from '~/interfaces/ApiResponse';

/**
 * Parámetros genéricos para operaciones de entidades
 */
export interface EntityParams extends ApiRequestParams {
  page?: number;
  items?: number;
  filter?: Record<string, unknown>;
  order?: string;
  [key: string]: unknown;
}

