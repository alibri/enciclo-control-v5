import { defineStore } from 'pinia';

interface UserPayloadInterface {
  username: string;
  secret: string;
}

// console.log(getApiUrl());
export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    loading: false,
    auth_error: null,
    session_id: null as string | null
  }),
  actions: {

    async authenticateUser ({ username, secret }: UserPayloadInterface) {
      const apiBaseUrl = getApiUrl();

      this.auth_error = null;
      const { data, pending }: any = await useFetch(apiBaseUrl + '/login', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: {
          username,
          secret
        }
      });
      this.loading = pending;

      if (data?.value?.success) {
        const token = useCookie('token'); // useCookie new hook in nuxt 3
        token.value = data?.value?.session_id; // set token to cookie
        this.session_id = data?.value?.session_id;
        this.authenticated = true; // set authenticated  state value to true
      } else {
        this.auth_error = data?.value?.message;
        this.session_id = null;
      }
    },
    logUserOut () {
      const token = useCookie('token'); // useCookie new hook in nuxt 3
      this.authenticated = false; // set authenticated  state value to false
      token.value = null; // clear the token cookie
      this.session_id = null;
    }
  }
});
