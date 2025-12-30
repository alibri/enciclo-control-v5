<script setup lang='ts'>
import { useConfirm } from 'primevue/useconfirm';
import ProcessService from '~/services/processService';

useAuthGuard();

const { showMessage, removeGroup } = useMessages();
const { t } = useI18n();

const processService = new ProcessService();

const loadData = async () => {
  const response = await processService.getProcessList();
  if (checkLogged(response)) {
    actionsList.value = response?.data?.value.process;
  }
};

const resultProcess = ref();

onMounted(() => {
  loadData();
});

const actionsList = ref();
const confirm = useConfirm();
const blocked = ref(false);

const confirmAction = async (event: any, action: any, title: any) => {
  confirm.require({
    target: event.currentTarget,
    message: t('¿Estás seguro de que deseas realizar esta acción?'),
    header: t('Confirmar acción'),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-sm',
    rejectLabel: t('Cancelar'),
    acceptLabel: t('Lanzar Proceso'),
    accept: async () => {
      resultProcess.value = null;
      blocked.value = true;
      showMessage('info', t('Lanzando Proceso'), `${title}<br/><i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>`, -1, 'tc');
      const response = await processService.launchProcess(action);
      if (checkLogged(response)) {
        resultProcess.value = response?.data?.value.result;
      }
      blocked.value = false;
      removeGroup('tc');
    }
  });
};

</script>

<template>
  <div class="card">
    <div class="surface-section px-4 py-8 md:px-6 lg:px-8 text-center mb-5">
      <div class="mb-3 font-bold text-3xl">
        <span class="text-blue-600">{{ t('Herramientas de Mantenimiento') }}</span>
      </div>
      <BlockUI :blocked="blocked">
        <div class="grid">
          <div v-show="actionsList?.length > 0" v-for="action in actionsList" :key="action.icon" class="col-span-12 md:col-span-4 mb-4 px-5" style="cursor:pointer;" @click="confirmAction($event, action.name, action.title)">
            <div class="border-1 m-1 border-round p-4 border-300">
              <span class="p-3 shadow-2 mb-3 inline-block surface-card" style="border-radius: 10px">
                <i class="pi text-4xl text-blue-500" :class="action.icon" />
              </span>
              <div class="text-900 text-xl mb-3 font-medium">
                {{ t(action.title) }}
              </div>
            </div>
          </div>
          <div v-show="!actionsList?.length" class="col-span-12 px-5">
            <Message severity="info">
                {{ t('No hay acciones disponibles') }}
            </Message>
          </div>
        </div>
      </BlockUI>
      <pre v-if="resultProcess" class="w-auto h-auto text-0 surface-800 text-left text-sm">
        {{ resultProcess }}
      </pre>
    </div>
  </div>
</template>

<style scoped></style>
