import { useAuthStore } from '~/stores/auth';
import { getApiUrl } from '~/utils/api';
import type { ApiResponse, ApiRequestParams, ApiError } from '~/interfaces/ApiResponse';
import { API_TIMEOUTS } from '~/utils/constants';

export interface ConfigApiCall {
  timeout?: number;
  headers?: Record<string, string>;
}

export function useApiClient (longTask: boolean = false) {
  const apiBaseUrl = getApiUrl(longTask);
  const { session_id } = storeToRefs(useAuthStore());

  async function get<T = unknown>(
    method: string,
    data?: ApiRequestParams | null,
    config: ConfigApiCall = {}
  ): Promise<ApiResponse<T>> {
    const requestData: ApiRequestParams = data ?? {};

    if (!session_id.value) {
      const token = useCookie('token');
      session_id.value = token.value ?? null;
    }

    requestData.session_id = session_id.value;

    if (!config.headers) {
      config.headers = {};
    }
    if (!config.headers['Content-Type']) {
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json'
      };
    }

    const dataString = JSON.stringify(requestData);
    try {
      const responseData = await $fetch<T>(apiBaseUrl + '/' + method, {
        method: 'POST',
        headers: config.headers,
        body: dataString,
      });

      return {
        data: ref(responseData),
        error: ref<ApiError | null>(null),
        pending: ref(false),
        status: ref<'success' | 'error'>('success'),
      };
    } catch (error: unknown) {
      const apiError: ApiError = error instanceof Error
        ? { message: error.message }
        : { message: 'Error desconocido', details: error };

      return {
        data: ref<T | null>(null),
        error: ref<ApiError | null>(apiError),
        pending: ref(false),
        status: ref<'success' | 'error'>('error'),
      };
    }
  }

  async function post<T = unknown>(
    method: string,
    data?: ApiRequestParams | null,
    config: ConfigApiCall = {}
  ): Promise<ApiResponse<T>> {
    return get<T>(method, data, config);
  }

  return {
    get,
    post
  };
}
