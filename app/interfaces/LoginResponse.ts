/**
 * Respuesta de login de la API
 */
export interface LoginResponse {
  success: boolean;
  session_id?: string;
  message?: string;
}

