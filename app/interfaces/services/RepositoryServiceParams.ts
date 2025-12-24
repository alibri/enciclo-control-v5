import type { ApiRequestParams } from '~/interfaces/ApiResponse';

/**
 * Parámetros genéricos para operaciones de repositorio
 */
export interface RepositoryParams extends ApiRequestParams {
  page?: number;
  items?: number;
  filter?: Record<string, unknown>;
  order?: string;
}

/**
 * Parámetros para exportar chats
 */
export interface ExportChatsParams extends ApiRequestParams {
  data: unknown;
}

/**
 * Parámetros para operaciones de archivo
 */
export interface FileOperationParams extends ApiRequestParams {
  id?: string | number;
  file?: string;
  name?: string;
  title?: string;
  [key: string]: unknown;
}

