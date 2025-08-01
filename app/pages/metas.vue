<script setup  lang="ts">
import Editor from 'primevue/editor';
import ImagenSelect from '~/components/ImagenSelect.vue';
import MetaService from '~/services/metaService';

const metaService = new MetaService();

const { showMessage } = useMessages();
const confirm = useConfirm();
const { t } = useI18n();

const loading = ref(false);
const collections = ref<any[]>([]);
const collection = ref<any>(null);
const grupo = ref<any>(null);
const editData = ref({
  metaTitle: '',
  metaCollections: '',
  metaImage: '',
  metaAbout: ''
});
const dirty = ref(false);

const imagesItems = ref<string[]>([]);

const loadData = async () => {
  const response = await metaService.getCollections();
  if (checkLogged(response)) {
    collections.value = response.data?.value?.collections;
    collection.value = collections.value[0] ?? null;
  }
};

const loadDashboard = async (name: string) => {
  console.log('loadDashboard', name);
  loading.value = true;
  const response = await metaService.getConfiguration(name);
  if (checkLogged(response)) {
    editData.value = response.data?.value?.config;
    imagesItems.value = [response.data?.value?.config.metaImage];
    dirty.value = false;
  }
  loading.value = false;
};

const saveData = async () => {
  console.log('saveData', editData.value);
  loading.value = true;
  const response = await metaService.saveConfiguration(collection.value.name, editData.value);
  if (checkLogged(response)) {
    showMessage('success', t('Guardar'), t('Configuración guardada'), 3000);
    dirty.value = false;
  }

  loading.value = false;
};

const selectImage = (image: string) => {
  console.log('selectImage', image);
  editData.value.metaImage = image;
};

const cancel = ref(false);
watch(collection, async (value, oldValue) => {
  console.log('collection', value, oldValue);
  if (cancel.value) {
    cancel.value = false;
    return;
  }

  if (value === null) {
    cancel.value = true;
    collection.value = oldValue;
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
          loadDashboard(value.name);
          confirm.close();
        },
        reject: () => {
          cancel.value = true;
          collection.value = oldValue;
          confirm.close();
        }
      });
    } else {
      loadDashboard(value.name);
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

    <h2>{{ t('Metas') }} <span v-if="collection" class="text-600"> 🡢 {{ collection.name }}</span> <span v-if="grupo" class="text-400"> 🡢 {{ grupo.name }}</span> <span v-if="dirty" class="text-red-600">*</span></h2>
    <BlockUI :blocked="loading">
      <div class="grid p-1">
        <div class="col-6 lg:col-1 xl:col-1">
          <strong class="text-xl mb-3">{{ t('Colección') }}</strong>
          <Listbox v-model="collection" :options="collections" option-label="name" invalid="true" class="w-full min-h-full-" />
        </div>
        <div class="col-12 lg:col-9 xl:col-9 ">
          <strong class="text-xl mb-3">{{ t('Configuración') }}</strong>

          <div class="border-1 border-200 p-4">
            <div class="flex align-items-center gap-3 mb-3">
              <label for="metaTitle" class="font-semibold w-6rem">{{ t('Título') }}</label>
              <InputText id="metaTitle" v-model="editData.metaTitle" class="flex-auto" @change="dirty = true" />
            </div>
            <div class="flex align-items-center gap-3 mb-3">
              <label for="metaCollections" class="font-semibold w-6rem">{{ t('Colecciones') }}</label>
              <InputText id="metaCollections" v-model="editData.metaCollections" class="flex-auto" @change="dirty = true" />
            </div>
            <div class="flex align-items-center gap-3 mb-3">
              <label for="metaAbout" class="font-semibold w-6rem">{{ t('Acerca de') }}</label>
              <InputText id="metaAbout" v-model="editData.metaAbout" class="flex-auto" @change="dirty = true" />
            </div>
            <div class="flex align-items-center gap-3 mb-2">
              <label for="metaImage" class="font-semibold w-6rem">{{ t('Logo') }}</label>
              <InputText id="metaImage" v-model="editData.metaImage" class="flex-auto" @change="dirty = true" />
              <ImagenSelect :images="imagesItems" @select="selectImage" />
            </div>
            <div class="border-1 border-200">
              <Image :src="editData.metaImage" width="200px" />
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
              @click="loadDashboard(collection.name)"
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
<style scoped lang="css">
#search > .p-inputtext {
  background-color: rgb(8, 8, 105); /* Cambiar al color de fondo deseado */
}
</style>
