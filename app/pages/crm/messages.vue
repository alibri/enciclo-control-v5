<script setup  lang="ts">
import MessageService from '~/services/messageService';
import TipTap from '~/components/tiptap/TipTap.vue';

const messageService = new MessageService();

const { showMessage } = useMessages();
const confirm = useConfirm();
const { t } = useI18n();

const loading = ref(false);
const messages = ref([]);
const message = ref(null);
const grupo = ref(null);
const editData = ref({
  description: '',
  type: '',
  html: ''
});
const dirty = ref(false);

const newData = () => {
  message.value = null;
  editData.value = {
    description: '',
    type: '',
    html: ''
  };
};

const loadData = async () => {
  const response = await messageService.getMessages();
  if (checkLogged(response)) {
    messages.value = response.data?.value?.messages;
  }
};

const loadMessage = async (name: string) => {
  console.log('loadMessage', name);
  loading.value = true;
  const response = await messageService.getMessages(name);
  if (checkLogged(response)) {
    editData.value = response.data?.value?.message;
    // imagesItems.value = [response.data?.value?.config.type];
    dirty.value = false;
  }
  loading.value = false;
};

const saveData = async () => {
  console.log('saveData', editData.value);
  loading.value = true;
  const response = await messageService.updMessage(message?.value?.id, editData.value);
  if (checkLogged(response)) {
    showMessage('success', t('Guardar'), t('Mensaje guardado'), 3000);
    dirty.value = false;
    loadData();
  }

  loading.value = false;
};

const cancel = ref(false);
watch(message, async (value, oldValue) => {
  console.log('message', value, oldValue);
  if (cancel.value) {
    cancel.value = false;
    return;
  }

  if (value === null) {
    cancel.value = true;
    message.value = oldValue;
  }

  if (value) {
    if (dirty.value) {
      confirm.require({
        message: t('Hay cambios no guardados ¿Desea cambiar de colección?'),
        header: t('Eliminar'),
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-danger',
        rejectLabel: t('Cancelar'),
        acceptLabel: t('Cambiar'),
        accept: () => {
          loadMessage(value.id);
          confirm.close();
        },
        reject: () => {
          cancel.value = true;
          message.value = oldValue;
          confirm.close();
        }
      });
    } else {
      loadMessage(value.id);
    }
  }
});

onMounted(() => {
  loadData();
});

</script>

<template>
  <div class="card">
    <ConfirmDialog />
    <h2>{{ t('Plantillas de mensaje') }} <span v-if="editData?.description" class="text-600"> 🡢 {{ editData.description }}</span> <span v-if="editData?.id" class="text-400"> 🡢 {{ editData.id }}</span> <span v-if="dirty" class="text-red-600">*</span></h2>
    <BlockUI :blocked="loading">
      <div class="flex flex-wrap gap-1">
        <div class="left-0">
          <Button
            icon="pi pi-file"
            class="p-button-success mr-2"
            @click="newData()"
          />
          <Button
            icon="pi pi-refresh"
            class="p-button-secondary"
            @click="loadData()"
          />
        </div>
      </div>

      <div class="grid p-1">
        <div class="col-6 lg:col-3 xl:col-3">
          <strong class="text-xl mb-3">{{ t('Mensajes') }}</strong>
          <Listbox v-model="message" :options="messages" option-label="description" invalid="true" class="w-full">
            <template #option="slotProps">
              <div class="font-bold">
                {{ slotProps.option.description }} <span class="text-400">({{ slotProps.option.type }})</span>
              </div>
              <div class="text-400 text-xs" v-html="slotProps.option.html" />
            </template>
          </Listbox>
        </div>
        <div class="col-12 lg:col-9 xl:col-9 ">
          <div class="border-1 border-200 p-4">
            <div class="flex align-items-center gap-3 mb-3">
              <label for="description" class="font-semibold w-6rem">{{ t('Título') }}</label>
              <InputText id="description" v-model="editData.description" v-focustrap class="flex-auto" @change="dirty = true" />
            </div>
            <div class="flex align-items-center gap-3 mb-2">
              <label for="type" class="font-semibold w-6rem">{{ t('Tipo') }}</label>
              <InputText id="type" v-model="editData.type" class="flex-auto" @change="dirty = true" />
            </div>
            <div class="p-tiptap">
              <TipTap v-model="editData.html" class="flex-auto h-10rem" />
            </div>
          </div>
          <hr>
          <div class="flex justify-content-end flex-wrap">
            <Button
              class="flex"
              :label="t('Cancelar')"
              text
              :disabled="!dirty"
              severity="danger"
              autofocus
              @click="loadMessage(message.id)"
            />
            <Button
              class="flex"
              :label="t('Guardar')"
              outlined
              severity="primary"
              autofocus
              @click="saveData()"
            />
          </div>
        </div>
      </div>
    </BlockUI>
  </div>
</template>
<style scoped>
:deep(.p-listbox .p-listbox-list .p-listbox-item) {
  border-bottom: 1px solid #e0e0e0;
}
</style>
