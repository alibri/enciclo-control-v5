import { storeToRefs } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

/**
 * Composable para proteger páginas y layouts verificando la autenticación del usuario.
 * Redirige automáticamente a /auth/login si el usuario no está autenticado.
 * 
 * @returns {Object} Objeto con el estado authenticated reactivo
 */
export function useAuthGuard() {
  const router = useRouter();
  const { authenticated } = storeToRefs(useAuthStore());

  watch(authenticated, (isAuthenticated) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, { immediate: true });

  return {
    authenticated // Exponer authenticated por si se necesita en el componente
  };
}

