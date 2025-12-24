import type { ApiError } from '~/interfaces/ApiResponse';
import { useMessages } from './messages';

/**
 * Composable para manejo unificado de errores de API
 */
export function useErrorHandler() {
  const { showMessage } = useMessages();

  /**
   * Maneja errores de API de forma unificada
   * @param error - Error de la API o error genérico
   * @param defaultMessage - Mensaje por defecto si no se puede extraer del error
   */
  function handleApiError(error: unknown, defaultMessage?: string): void {
    let errorMessage = defaultMessage || 'Ha ocurrido un error';

    if (error && typeof error === 'object') {
      // Si es un ApiError
      if ('message' in error) {
        errorMessage = String(error.message);
      }
      // Si es un Error estándar
      else if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Si tiene estructura de respuesta de API
      else if ('data' in error && error.data && typeof error.data === 'object') {
        const data = error.data as { message?: string; value?: { message?: string } };
        errorMessage = data.message || data.value?.message || errorMessage;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    showMessage('error', 'Error', errorMessage);
  }

  /**
   * Extrae el mensaje de error de una respuesta de API
   * @param response - Respuesta de la API
   * @returns Mensaje de error o null si no hay error
   */
  function extractErrorMessage(response: { error?: { value?: ApiError | null } | null }): string | null {
    if (response.error?.value) {
      return response.error.value.message || null;
    }
    return null;
  }

  return {
    handleApiError,
    extractErrorMessage
  };
}

