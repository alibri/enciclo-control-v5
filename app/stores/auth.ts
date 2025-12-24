import { defineStore } from 'pinia';
import type { LoginResponse } from '~/interfaces/LoginResponse';

interface UserPayloadInterface {
  username: string;
  secret: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    loading: false,
    auth_error: null as string | null,
    session_id: null as string | null
  }),
  actions: {
    async authenticateUser ({ username, secret }: UserPayloadInterface): Promise<void> {
      const apiBaseUrl = getApiUrl();

      this.auth_error = null;
      const { data, pending } = await useFetch<LoginResponse>(apiBaseUrl + '/login', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        key: `login-${Date.now()}-${Math.random()}`, // Clave única para cada llamada

        body: {
          username,
          secret
        }
      });
      this.loading = pending.value;

      if (data.value?.success) {
        const token = useCookie('token');
        token.value = data.value?.session_id ?? null;
        this.session_id = data.value?.session_id ?? null;
        this.authenticated = true;
      } else {
        this.auth_error = data.value?.message ?? null;
        this.session_id = null;
      }
    },
    logUserOut (): void {
      const token = useCookie('token');
      this.authenticated = false;
      token.value = null;
      this.session_id = null;
    }
  }
});
