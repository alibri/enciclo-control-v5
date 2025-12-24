import type { UserInterface } from '~/interfaces/User';
import type { ApiRequestParams } from '~/interfaces/ApiResponse';

/**
 * Parámetros para obtener usuarios
 */
export interface GetUsersParams extends ApiRequestParams {
  page?: number;
  items?: number;
  filter?: Record<string, unknown>;
  order?: string;
}

/**
 * Datos para crear/actualizar un usuario
 */
export interface CreateUserData extends UserInterface {
  email?: string;
  passwd?: string;
  isenabled?: boolean;
  isadmin?: boolean;
  iseditor?: boolean;
  istester?: boolean;
  dashboard_access?: boolean;
  iprange?: string;
  geoip?: string;
  referer?: string;
  meta?: string;
  collections?: string[];
  stats_min?: string;
  manual_stats?: boolean;
  period?: [string, string];
}

/**
 * Parámetros para obtener estadísticas falsas de un usuario
 */
export interface GetFakeStatsParams extends ApiRequestParams {
  user: string;
}

/**
 * Datos para crear estadísticas falsas
 */
export interface CreateFakeStatsData extends ApiRequestParams {
  user: string;
  collection: string;
  year: number;
  month: number;
  logins?: number;
  pages?: number;
  preguntas?: number;
  ts?: string;
}

/**
 * Parámetros para importar estadísticas falsas
 */
export interface ImportFakeStatsParams extends ApiRequestParams {
  file: string; // base64
  user: string;
  name: string;
}

/**
 * Parámetros para desactivar un grupo
 */
export interface DesactivarGrupoParams extends ApiRequestParams {
  grupo: string;
}

