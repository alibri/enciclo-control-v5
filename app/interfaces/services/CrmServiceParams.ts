import type { ApiRequestParams } from '~/interfaces/ApiResponse';

/**
 * Parámetros para obtener leads
 */
export interface GetLeadsParams extends ApiRequestParams {
  page?: number;
  items?: number;
  filter?: Record<string, unknown>;
  order?: string;
}

/**
 * Parámetros para enviar mensaje
 */
export interface SendMessageParams extends ApiRequestParams {
  id: string | number;
  messageId: string | number;
  status: string | number;
}

