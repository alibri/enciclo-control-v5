import type { ApiRequestParams } from '~/interfaces/ApiResponse';

/**
 * Parámetros para query de chat
 */
export interface ChatQueryParams extends ApiRequestParams {
  query: string;
}

/**
 * Parámetros para obtener un chat
 */
export interface GetChatParams extends ApiRequestParams {
  id: string | number;
}

