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

/**
 * Respuesta de la lista de RAG tests
 */
export interface RAGListResponse {
  success: boolean;
  message?: string;
  list?: unknown[];
  total?: number;
}

/**
 * Respuesta de un RAG test individual
 */
export interface RAGTestResponse {
  success: boolean;
  message?: string;
  result?: {
    id: number;
    query: string;
    result: string | unknown;
    config: string | unknown;
    created_at?: string | number;
    [key: string]: unknown;
  };
}

