import { useAuthStore } from '~/stores/auth';
import { useApiClient } from '~/stores/api';

/**
 * Composable para verificar periódicamente si la sesión del usuario sigue activa
 */
export const useSessionCheck = () => {
  const authStore = useAuthStore();
  const { authenticated, session_id } = storeToRefs(authStore);
  const api = useApiClient();
  const token = useCookie('token');
  
  let checkInterval: ReturnType<typeof setInterval> | null = null;
  let isChecking = false;

  /**
   * Verifica si la sesión sigue activa haciendo una llamada al API
   */
  const checkSession = async (): Promise<boolean> => {
    // Si no hay token, la sesión no está activa
    if (!token.value || !session_id.value) {
      return false;
    }

    // Evitar múltiples verificaciones simultáneas
    if (isChecking) {
      return authenticated.value;
    }

    isChecking = true;

    try {
      // Hacemos una llamada ligera al API para verificar la sesión
      // Usamos un endpoint simple que requiere autenticación
      const response = await api.get('collections', {});
      
      // Si hay error, verificamos el tipo
      if (response.status.value === 'error') {
        const error = response.error.value;
        
        // Verificar si es un error HTTP 403 (no autorizado) o 401 (no autenticado)
        if (error) {
          // Verificar statusCode directamente
          if (error.statusCode === 403 || error.statusCode === 401) {
            isChecking = false;
            return false;
          }
          
          // También verificar si el mensaje indica sesión expirada
          const errorMessage = error.message?.toLowerCase() || '';
          if (errorMessage.includes('unauthorized') || 
              errorMessage.includes('forbidden') ||
              errorMessage.includes('sesión') ||
              errorMessage.includes('session')) {
            isChecking = false;
            return false;
          }
        }
        
        // Si hay otro tipo de error, asumimos que la sesión sigue activa
        // (podría ser un error de red, etc.)
        isChecking = false;
        return authenticated.value;
      }

      // Verificar también si la respuesta indica que la sesión no es válida
      const responseData = response.data.value as any;
      if (responseData && responseData.success === false) {
        const message = responseData.message?.toLowerCase() || '';
        if (message.includes('sesión') || message.includes('session') || 
            message.includes('unauthorized') || message.includes('forbidden')) {
          isChecking = false;
          return false;
        }
      }

      // Si la respuesta es exitosa, la sesión sigue activa
      isChecking = false;
      return true;
    } catch (error: any) {
      // Manejar errores de $fetch que pueden tener statusCode
      if (error?.statusCode === 403 || error?.statusCode === 401) {
        isChecking = false;
        return false;
      }
      
      // En caso de otro tipo de error, asumimos que la sesión sigue activa
      // para evitar cerrar sesión por errores de red temporales
      isChecking = false;
      return authenticated.value;
    }
  };

  /**
   * Inicia la verificación periódica de sesión
   * @param interval - Intervalo en milisegundos (por defecto 5 minutos)
   */
  const startSessionCheck = (interval: number = 5 * 60 * 1000) => {
    // Limpiar intervalo anterior si existe
    stopSessionCheck();

    // Solo iniciar si el usuario está autenticado
    if (!authenticated.value || !token.value) {
      return;
    }

    // Verificar inmediatamente al iniciar
    checkSession().then((isValid) => {
      if (!isValid) {
        handleSessionExpired();
      }
    });

    // Configurar verificación periódica
    checkInterval = setInterval(async () => {
      const isValid = await checkSession();
      if (!isValid) {
        handleSessionExpired();
      }
    }, interval);
  };

  /**
   * Detiene la verificación periódica de sesión
   */
  const stopSessionCheck = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  };

  /**
   * Maneja la expiración de sesión
   */
  const handleSessionExpired = () => {
    stopSessionCheck();
    authStore.logUserOut();
    
    // Emitir evento para mostrar el modal
    if (process.client) {
      window.dispatchEvent(new CustomEvent('session-expired'));
    }
  };

  return {
    checkSession,
    startSessionCheck,
    stopSessionCheck,
    handleSessionExpired
  };
};

