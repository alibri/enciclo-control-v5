const { showMessage } = useMessages();

export const checkLogged = (response: any): boolean => {
  if (response.error?.value?.statusCode === 403) {
    const { logUserOut } = useAuthStore(); // use logUserOut action from  auth store
    logUserOut();
    navigateTo('/auth/login');
    return false;
  } else  if (response.error?.value?.statusCode === 500) {
    const { t } = useI18n();
    showMessage('error', 'Error', t('Error interno del servidor'), -1, 'tc');
    return false;
  } else {
    if (response.data.value?.success === false) {
      showMessage('error', 'Error', response.data.value?.message, -1, 'tc');
      return false;
    }
    return true;
  }
};
