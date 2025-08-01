<script setup  lang="ts">
import Editor from 'primevue/editor';
import ImagenSelect from '~/components/ImagenSelect.vue';
import PageService from '~/services/pageService';

const pageService = new PageService();

const { showMessage } = useMessages();
const confirm = useConfirm();
const { t } = useI18n();

const loading = ref(true);
const collections = ref<any[]>([]);
const collection = ref<any>(null);
const dashboard = ref<any>(null);
const grupos = ref<any[]>([]);
const grupo = ref<any>(null);
const items = ref<any[]>([]);
const fields = ref<string[]>([]);
const editingRows = ref([]);
const dialogVisible = ref(false);
const editData = ref<any>(null);
const dirty = ref(false);
const filteredEntradas = ref<any[]>([]);
const selectedItem = ref<any>(null);
const imagesItems = ref<any[]>([]);

const fieldsDefault = {
  articulos: ['imagen', 'titulo', 'enlace', 'resumen', 'friendly', 'collection', 'id'],
  videos: ['imagen', 'titulo', 'titular', 'enlace', 'resumen', 'friendly', 'collection', 'id'],
  destacados: ['imagen', 'titulo', 'enlace', 'categoria', 'friendly', 'collection', 'id'],
  destacados2: ['imagen', 'titulo', 'categoria', 'collection', 'id'],
  efemerides: ['imagen', 'titulo', 'enlace', 'titular', 'fecha', 'fecha2', 'resumen', 'friendly', 'collection', 'id'],
  top: ['text', 'collection', 'id'],
  bottom: ['text', 'collection', 'id']
};

const loadData = async () => {
  const response = await pageService.getCollections();
  if (checkLogged(response)) {
    collections.value = response.data?.value?.collections;
    collection.value = collections.value[0] ?? null;
  }
};

const loadDashboard = async (name: string) => {
  loading.value = true;
  const response = await pageService.getDashboard(name);
  if (checkLogged(response)) {
    grupos.value = [];
    items.value = [];
    dashboard.value = response.data?.value;
    if (dashboard.value) {
      grupos.value = Object.keys(dashboard.value?.dashboard).map((key) => {
        return { name: key, code: key };
      });
      grupo.value = grupos?.value[0] ?? null;
      dirty.value = false;
    }
  }
  loading.value = false;
};

const openDialog = async (data: any) => {
  console.log('openDialog', data);
  editData.value = { ...data };
  if (editData.value.friendly) {
    const response = await pageService.getPageImages(editData.value.collection, editData.value.friendly);
    if (checkLogged(response)) {
      imagesItems.value = response.data?.value?.images;
    }
  } else {
    imagesItems.value = [];
  }
  selectedItem.value = null;
  dialogVisible.value = true;
};

const saveData = () => {
  //console.log('saveData', editData.value);
  dialogVisible.value = false;
  if (!editData.value.id) {
    const id = Math.floor(Math.random() * 1000) + 10000;
    editData.value.id = id;
    items.value = [{ id, ...editData.value }, ...items.value];
  } else {
    //console.log('editData.value.id', editData.value.id);
    items.value = items.value.map((item) => {
      if (item.id === editData.value.id) {
        item = editData.value;
      }
      return item;
    });
    // console.log('nuevo', nuevo);
  }
  dashboard.value.dashboard[grupo.value.code] = { ...items.value };
  //console.log('dashboard', dashboard.value?.dashboard[grupo.value.code]);
  dirty.value = true;
};

const saveDashboard = async () => {
  //console.log('saveDashboard');
  loading.value = true;
  const data = JSON.parse(JSON.stringify(dashboard.value.dashboard));

  const response = await pageService.saveDashboard(collection.value.name, data);
  if (checkLogged(response)) {
    dirty.value = false;
    showMessage('success', t('Guardar'), t('Fichero guardado'), 3000);
  }

  loading.value = false;
};

const refreshData = () => {
  //console.log('refreshData');
  if (dirty.value) {
    confirm.require({
      message: t('Hay cambios no guardados ¿Desea continuar?'),
      header: t('Eliminar'),
      icon: 'pi pi-exclamation-triangle',
      rejectClass: 'p-button-secondary p-button-outlined',
      acceptClass: 'p-button-danger',
      rejectLabel: t('Cancelar'),
      acceptLabel: t('Refrescar'),
      accept: () => {
        loadDashboard(collection.value.name);
        confirm.close();
      },
      reject: () => {
        confirm.close();
      }
    });
  } else {
    loadDashboard(collection.value.name);
  }
};

const publishData = async () => {
  //console.log('publishData');
  if (dirty.value) {
    confirm.require({
      message: t('Hay cambios no guardados ¿Desea continuar?'),
      header: t('Eliminar'),
      icon: 'pi pi-exclamation-triangle',
      rejectClass: 'p-button-secondary p-button-outlined',
      acceptClass: 'p-button-danger',
      rejectLabel: t('Cancelar'),
      acceptLabel: t('Publicar'),
      accept: async () => {
        const response = await pageService.publishDashboard(collection.value.name);
        if (checkLogged(response)) {
          dirty.value = false;
          showMessage('success', t('Publicar'), t('Portada publicada'), 3000);
          loadDashboard(collection.value.name);
        }
        confirm.close();
      },
      reject: () => {
        confirm.close();
      }
    });
  } else {
    const response = await pageService.publishDashboard(collection.value.name);
    if (checkLogged(response)) {
      dirty.value = false;
      showMessage('success', t('Publicar'), t('Portada publicada'), 3000);
    }
  }
};

const previewData = () => {
  //console.log('previewData');
  const url = getPageLink(collection.value.name, 'dashboardpreview');
  openPage(url);
};

const addNew = () => {
  //console.log('addNew');
  openDialog({});
};

const deleteItem = (data: any) => {
  //console.log('deleteItem', data.id);
  //console.log('abriendo confirmación');
  confirm.require({
    message: t('¿Desea eliminar el registro?') + ' ' + data.friendly,
    header: t('Eliminar'),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    rejectLabel: t('Cancelar'),
    acceptLabel: t('Eliminar'),
    accept: () => {
      console.log('eliminando', data.id);
      const id = parseInt(data.id);
      items.value = items.value.filter(item => item.id !== id);
      console.log('grupo', grupo.value.code);
      console.log('items', items.value);
      dashboard.value.dashboard[grupo.value.code] = { ...items.value };
      console.log('dashboard', dashboard.value?.dashboard[grupo.value.code]);

      dirty.value = true;
      confirm.close();
    },
    reject: () => {
      console.log('cancelado');
      confirm.close();
    }
  });
};

const searchEntrada = async (e: any) => {
  const query = e.query;
  const filtered: any[] = [];
  const response = await pageService.searchByTitle(collection.value.name, query);
  if (checkLogged(response)) {
    if (response.data?.value.search) {
      console.log('search', response.data?.value.search);
      response.data?.value.search.forEach((item: any) => {
        filtered.push(item);
      });
    }
  }
  filteredEntradas.value = filtered;
};

const selectImage = (image: any) => {
  console.log('selectImage', image);
  editData.value.imagen = image;
};

const cancel = ref(false);
watch(collection, async (value, oldValue) => {
  //console.log('collection', value, oldValue);
  if (cancel.value) {
    cancel.value = false;
    return;
  }
  if (value === null) {
    cancel.value = true;
    //console.log('value === null');
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

watch(grupo, (value, oldValue) => {
  if (cancel.value) {
    cancel.value = false;
    return;
  }
  if (value === null) {
    cancel.value = true;
    //console.log('value === null');
    grupo.value = oldValue;
  }
  if (value) {
    items.value = dashboard.value?.dashboard[value.code] ?? [];
    fields.value = [];
    let id = 1;
    if (items.value && items.value.length > 0) {
      items.value.forEach((item, index) => {
      // add the fields of the object item to the fields array
        items.value[index].id = id++;
        fields.value.push(...Object.keys(item ?? []));
      });
      fields.value = Object.keys(items.value[0] ?? []);
    }
    //console.log('fields', fields.value);
    if (fields.value?.length === 0) {
      //console.log('fields.length === 0');
      fields.value = fieldsDefault[value.code as keyof typeof fieldsDefault] ?? [];
      //console.log('fields', fields.value);
    }
  }
});

watch(selectedItem, async (value) => {
  if (value?.friendly) {
    editData.value.friendly = value.friendly;
    editData.value.collection = value.collection;
    editData.value.imagen = value.image;
    editData.value.titulo = value.title;
    editData.value.resumen = value.description;

    const response = await pageService.getPageImages(value.collection, value.friendly);
    if (checkLogged(response)) {
      imagesItems.value = response.data?.value?.images;
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
    <Dialog v-model:visible="dialogVisible" modal :header="t('Editar')" :style="{ width: '50rem' }">
      <template #header>
        <div class="inline-flex align-items-center justify-content-center gap-2">
          <Avatar v-if="editData.imagen" :image="editData.imagen" shape="circle" />
          <span v-if="!editData.id">[{{ t('NUEVO') }}]</span>
          <span class="font-bold white-space-nowrap"><span class="text-blue-600">{{ grupo?.name }}</span> 🡢 {{ editData.titulo }} </span>
        </div>
      </template>

      <div v-if="!fields.includes('text')" class="flex align-items-center gap-3 mb-3">
        <label for="search" class="font-semibold w-6rem text-green-700">{{ t('Búsqueda') }}</label>
        <AutoComplete
          id="search"
          v-model="selectedItem"
          option-label="title"
          :suggestions="filteredEntradas"
          class="flex-auto mi-input"
          @complete="searchEntrada"
        >
          <template #option="slotProps">
            <div class="flex align-options-center">
              <img alt="" :src="slotProps.option.image" style="width: 18px" class="mr-2">
              <div v-html="slotProps.option.title2" />
            </div>
          </template>
        </AutoComplete>
      </div>
      <div v-if="fields.includes('imagen')" class="flex align-items-center gap-3 mb-3">
        <label for="imagen" class="font-semibold w-6rem">{{ t('Imagen') }}</label>
        <InputText id="imagen" v-model="editData.imagen" class="flex-auto" />
        <ImagenSelect @select="selectImage" :images="imagesItems" />
      </div>
      <div v-if="fields.includes('imagen')" class="flex align-items-center gap-3 mb-3 border-1 border-200 text-center">
        <Image :src="editData.imagen" height="60px" />
      </div>

      <div v-if="fields.includes('collection')" class="flex align-items-center gap-3 mb-3">
        <label for="collection" class="font-semibold w-6rem">{{ t('Colección') }}</label>
        <InputText id="collection" v-model="editData.collection" class="flex-auto" />
      </div>
      <div v-if="fields.includes('friendly')" class="flex align-items-center gap-3 mb-2">
        <label for="friendly" class="font-semibold w-6rem">{{ t('Entrada') }}</label>
        <InputText id="friendly" v-model="editData.friendly" class="flex-auto" />
      </div>
      <div v-if="fields.includes('categoria')" class="flex align-items-center gap-3 mb-2">
        <label for="categoria" class="font-semibold w-6rem">{{ t('Categoría') }}</label>
        <InputText id="categoria" v-model="editData.categoria" class="flex-auto" />
      </div>
      <div v-if="fields.includes('titulo')" class="flex align-items-center gap-3 mb-2">
        <label for="titulo" class="font-semibold w-6rem">{{ t('Título') }}</label>
        <InputText id="titulo" v-model="editData.titulo" class="flex-auto" />
      </div>
      <div v-if="fields.includes('titular')" class="flex align-items-center gap-3 mb-2">
        <label for="titular" class="font-semibold w-6rem">{{ t('Titular') }}</label>
        <InputText id="titular" v-model="editData.titular" class="flex-auto" />
      </div>
      <!--<div v-if="fields.includes('enlace')" class="flex align-items-center gap-3 mb-2">
        <label for="enlace" class="font-semibold w-6rem">{{ t('Enlace') }}</label>
        <InputText id="enlace" v-model="editData.enlace" class="flex-auto" />
      </div>-->
      <div v-if="fields.includes('fecha')" class="flex align-items-center gap-3 mb-2">
        <label for="fecha" class="font-semibold w-6rem">{{ t('Fecha') }}</label>
        <InputText id="fecha" v-model="editData.fecha" class="flex-auto" />
      </div>
      <div v-if="fields.includes('fecha2')" class="flex align-items-center gap-3 mb-2">
        <label for="fecha2" class="font-semibold w-6rem">{{ t('Fecha 2') }}</label>
        <InputText id="fecha2" v-model="editData.fecha2" class="flex-auto" />
      </div>
      <div v-if="fields.includes('resumen')" class="flex align-items-center gap-3 mb-2">
        <label for="resumen" class="font-semibold w-6rem">{{ t('Resumen') }}</label>
        <Textarea id="resumen" v-model="editData.resumen" rows="5" class="flex-auto" />
      </div>
      <div v-if="fields.includes('text')" class="flex align-items-center gap-3 mb-2">
        <label for="text" class="font-semibold w-6rem">{{ t('Texto') }}</label>
        <Textarea id="text" v-model="editData.text" rows="10" class="flex-auto" />
      </div>
      <div v-if="fields.includes('text')" class="flex align-items-center gap-3 mb-2">
        <label for="html" class="font-semibold w-6rem">{{ t('Texto') }}</label>
        <Editor v-model="editData.text" editor-style="height: 200px" class="flex-auto" />
      </div>
      <template #footer>
        <Button :label="t('Cancelar')" text severity="danger" autofocus @click="dialogVisible = false" />
        <Button :label="t('Guardar')" outlined severity="primary" autofocus @click="saveData()" />
      </template>
    </Dialog>

    <h2>{{ t('Portada') }} <span v-if="collection" class="text-600"> 🡢 {{ collection.name }}</span> <span v-if="grupo" class="text-400"> 🡢 {{ grupo.name }}</span></h2>
    <BlockUI :blocked="loading">
      <div class="grid p-1">
        <div class="col-6 lg:col-1 xl:col-1">
          <strong class="text-xl mb-3">{{ t('Colección') }}</strong>
          <Listbox v-model="collection" :options="collections" option-label="name" invalid="true" class="w-full min-h-full-" />
        </div>
        <div class="col-6 lg:col-2 xl:col-2">
          <strong class="text-xl mb-3">{{ t('Grupos') }}</strong>
          <Listbox v-model="grupo" :options="grupos" option-label="name" class="w-full min-h-full-" />
        </div>
        <div class="col-12 lg:col-9 xl:col-9">
          <strong class="text-xl mb-3">{{ t('Elementos') }}</strong>
          <div class="card p-fluid">
            <DataTable
              v-model:editingRows="editingRows"
              :value="items"
              edit-mode="row"
              data-key="id"
              :pt="{
                table: { style: 'min-width: 50rem' },
                column: {
                  bodycell: function(state: any) {
                    return {
                      style: state['d_editing']&&'padding-top: 0.6rem; padding-bottom: 0.6rem'
                    };
                  }
                }
              }"
            >
              <template #header>
                <Toolbar>
                  <template #start>
                    <Button icon="pi pi-plus" class="mr-2" severity="secondary" @click="addNew()" />
                  </template>

                  <template #center>
                    <div class="text-xl text-900 font-bold">
                      {{ grupo?.name }}
                    </div>
                  </template>

                  <template #end>
                    <Button class="mr-1" icon="pi pi-save" outlined severity="primary" @click="saveDashboard()" />
                    <Button class="mr-3" icon="pi pi-refresh" outlined severity="warning" @click="refreshData()" />
                    <Button class="mr-1" icon="pi pi-eye" outlined severity="success" @click="previewData()" />
                    <Button icon="pi pi-upload" severity="success" @click="publishData()" />
                  </template>
                </Toolbar>
              </template>
              <Column v-if="fields.includes('imagen')" field="imagen" :header="t('Imagen')">
                <!--<template #editor="{ data, field }">
                  <ImageUpload v-model="data[field]" />
                </template>-->
                <template #body="slotProps">
                  <img :src="slotProps.data.imagen" style="max-width: 50px; width: 50px;">
                </template>
              </Column>
              <Column v-if="fields.includes('collection')" field="collection" :header="t('Colección')">
                <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
                </template>
              </Column>
              <Column v-if="fields.includes('friendly')" field="friendly" :header="t('Entrada')">
                <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
                </template>
                <template #body="slotProps">
                  <PageLink :page="{ title: slotProps.data.friendly, collection: slotProps.data.collection }" />
                </template>
              </Column>
              <Column v-if="fields.includes('categoria')" field="categoria" :header="t('Categoria')">
                <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
                </template>
              </Column>
              <Column v-if="fields.includes('titulo')" field="titulo" :header="t('Título')">
                <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
                </template>
              </Column>
              <Column v-if="fields.includes('titular')" field="titular" :header="t('Titular')">
                <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
                </template>
              </Column>
              <!--<Column v-if="fields.includes('enlace')" field="enlace" :header="t('Enlace')">
              <template #editor="{ data, field }">
                <InputText v-model="data[field]" />
              </template>
            </Column>-->
              <Column v-if="fields.includes('fecha')" field="fecha" :header="t('Fecha')">
                <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
                </template>
              </Column>
              <Column v-if="fields.includes('fecha2')" field="fecha2" :header="t('Fecha 2')">
                <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
                </template>
              </Column>
              <Column v-if="fields.includes('resumen')" field="resumen" :header="t('Resumen')">
                <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
                </template>
              </Column>
              <Column v-if="fields.includes('text')" field="text" :header="t('Texto')">
                <template #editor="{ data, field }">
                  <InputText v-model="data[field]" />
                </template>
              </Column>
              <Column style="width: 10%; min-width: 8rem" body-style="text-align:center">
                <template #body="slotProps">
                  <Button icon="pi pi-pencil" rounded raised text @click="openDialog(slotProps.data)" />
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    rounded
                    raised
                    text
                    @click="deleteItem(slotProps.data)"
                  />
                </template>
              </Column>
            </DataTable>
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
