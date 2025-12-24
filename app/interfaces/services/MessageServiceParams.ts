import type { ApiRequestParams } from '~/interfaces/ApiResponse';

/**
 * Parámetros para obtener mensajes
 */
export interface GetMessagesParams extends ApiRequestParams {
  id?: string | number | null;
}

/**
 * Parámetros para actualizar mensaje
 */
export interface UpdateMessageParams extends ApiRequestParams {
  id: string | number;
  data: unknown;
}

