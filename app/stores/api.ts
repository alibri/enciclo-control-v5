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
  console.log('longTask', longTask);
  console.log('apiBaseUrl', apiBaseUrl);

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
    const response = await useFetch(apiBaseUrl + '/' + method, {
      method: 'POST',
      headers: config.headers,
      body: dataString,
      key: `${method}-${Date.now()}-${Math.random()}`, // Clave única para cada llamada
      //server: false, // Solo ejecutar en el cliente
      //default: () => null, // Valor por defecto
      //transform: (data: any) => data, // Transformación directa
      //getCachedData: () => null // No usar datos cacheados
    });
    return response as Record<string, any>;
  }

  return {
    get
  };
}
