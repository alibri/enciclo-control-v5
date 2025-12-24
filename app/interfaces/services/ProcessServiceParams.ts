import type { ApiRequestParams } from '~/interfaces/ApiResponse';

/**
 * Parámetros para lanzar proceso
 */
export interface LaunchProcessParams extends ApiRequestParams {
  action: string;
}

