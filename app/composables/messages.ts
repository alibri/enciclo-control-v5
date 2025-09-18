import { useToast } from 'primevue/usetoast';
import type { ToastMessageOptions } from 'primevue/toast';
import { consola } from 'consola';

export function useMessages () {
  function showMessage (severity: ToastMessageOptions['severity'], summary: string, detail: string, life?: number | null, group?: string) {
    if (!life) {
      life = 3000;
    }
    if (life === -1) {
      life = null;
    }

    const toastService = usePVToastService();

    if (group) {
      toastService.add({
        severity,
        summary,
        detail,
        life: life || undefined,
        group
      });
    } else {
      toastService.add({
        severity,
        summary,
        detail,
        life: life || undefined
      });
    }
  }

  function removeGroup (group: string) {
    const toastService = usePVToastService();
    toastService.removeGroup(group);
  }

  return {
    showMessage, removeGroup
  };
}
