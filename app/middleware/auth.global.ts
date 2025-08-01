export default defineNuxtRouteMiddleware((to) => {
  const { authenticated, session_id } = storeToRefs(useAuthStore()); // make authenticated state reactive
  const token = useCookie('token'); // get token from cookies

  if (token.value) {
    // check if value exists
    authenticated.value = true; // update the state to authenticated
    session_id.value = token.value as string; // update the state to session_id
  }

  // if token exists and url is /login redirect to homepage
  if (token.value && to?.name === 'auth-login') {
    return navigateTo('/');
  }

  // if token doesn't exist redirect to log in
  if (!token.value && to?.name !== 'auth-login') {
    abortNavigation();
    return navigateTo('/auth/login');
  }
});
