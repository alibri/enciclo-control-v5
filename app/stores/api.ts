// import { consola } from 'consola';
import { useAuthStore } from '~/stores/auth'; // import the auth store we just created
import { getApiUrl } from '~/utils/api';

export interface ConfigApiCall {
    timeout?: number,
    headers?: Record<string, string>
}

export function useApiClient (longTask: boolean = false) {
  // const runtimeConfig = useRuntimeConfig();
  const apiBaseUrl = getApiUrl(longTask);
  // console.log('longTask', longTask);
  // console.log('apiBaseUrl', apiBaseUrl);

  const { session_id } = storeToRefs(useAuthStore());

  async function get (method: string, data?: Record<string, any> | null, config: ConfigApiCall = {}): Promise<Record<string, any>> {
    if (data == null) {
      data = {};
    }

    if (!session_id.value) {
      const token = useCookie('token'); // get token from cookies
      session_id.value = token.value ?? null;
    }

    data.session_id = session_id.value;
    if (!config.headers) {
      config.headers = {};
    }
    if (!config.headers['Content-Type']) {
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json'
      };
    }

    // Convertimos los datos a JSON antes de enviarlos
    const dataString = JSON.stringify(data);
    try {
      const responseData = await $fetch(apiBaseUrl + '/' + method, {
        method: 'POST',
        headers: config.headers,
        body: dataString,
      });
      // Devolvemos la misma estructura que useFetch
      return {
        data: ref(responseData),
        error: ref(null),
        pending: ref(false),
        status: ref('success'),
      } as Record<string, any>;
    } catch (error: any) {
      // En caso de error, devolvemos la estructura similar a useFetch
      return {
        data: ref(null),
        error: ref(error),
        pending: ref(false),
        status: ref('error'),
      } as Record<string, any>;
    }
  }

  return {
    get
  };
}
