import type { ApiRequestParams } from '~/interfaces/ApiResponse';

/**
 * Parámetros genéricos para tests
 */
export interface TestParams extends ApiRequestParams {
  [key: string]: unknown;
}

/**
 * Parámetros para evaluar RAG
 */
export interface EvaluateRAGParams extends ApiRequestParams {
  id: number;
  rating: {
    respuesta: number;
    velocidad: number;
  };
  comentario?: string;
}

/**
 * Parámetros para exportar chat
 */
export interface ExportChatParams extends ApiRequestParams {
  session_id: string;
  data: unknown;
}

