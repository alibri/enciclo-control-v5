import type { ApiRequestParams } from '~/interfaces/ApiResponse';

/**
 * Parámetros para subir media
 */
export interface UploadMediaParams extends ApiRequestParams {
  image: string; // base64
}

