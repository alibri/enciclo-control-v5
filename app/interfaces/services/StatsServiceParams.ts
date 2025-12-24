import type { ApiRequestParams } from '~/interfaces/ApiResponse';

/**
 * Parámetros genéricos para estadísticas con paginación
 */
export interface StatsParams extends ApiRequestParams {
  page?: number;
  items?: number;
  filter?: Record<string, unknown>;
  order?: string;
}

/**
 * Parámetros para estadísticas de página
 */
export interface PageStatsParams extends ApiRequestParams {
  title: string;
  collection: string;
  from: number;
  to: number;
}

/**
 * Parámetros para estadísticas de sesión
 */
export interface SessionStatsParams extends ApiRequestParams {
  id: string | null;
}

/**
 * Parámetros para estadísticas de páginas de usuario
 */
export interface UserPageStatsParams extends ApiRequestParams {
  user: number;
  collection: string;
}

