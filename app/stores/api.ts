// import { consola } from 'consola';
import { useAuthStore } from '~/stores/auth'; // import the auth store we just created

export interface ConfigBibliopolaCall {
    timeout?: number
}

export function useApiClient () {
  // const runtimeConfig = useRuntimeConfig();
  const apiBaseUrl = getApiUrl();
  const { session_id } = storeToRefs(useAuthStore());

  async function get (method: string, data?: Record<string, any> | null, config: ConfigBibliopolaCall = {}): Promise<Record<string, any>> {
    if (data == null) {
      data = {};
    }
    if (!session_id.value) {
      const token = useCookie('token'); // get token from cookies
      session_id.value = token.value ?? null;
    }

    data.session_id = session_id;

    return await useFetch(apiBaseUrl + '/' + method, {
      method: 'post',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: data,
      cache: 'no-store' // Evita el caché del navegador
    });
  }

  return {
    get
  };
}
