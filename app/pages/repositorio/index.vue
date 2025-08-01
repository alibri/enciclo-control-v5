<script setup lang='ts'>
// import { FilterMatchMode, FilterOperator } from 'primevue';
import { onMounted } from 'vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import RepositoryService from '@/services/repositoryService';
import { formatSize } from '@/utils/format';

const { filters } = usePrimeDataTable();
const { t } = useI18n();
const { getParamsData, lazyParams, exportDataGeneric, resetLazyParams } = useUtilsData();
const { showMessage } = useMessages();

const repositoryService = new RepositoryService();

filters.value = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  user: { value: null, matchMode: FilterMatchMode.CONTAINS } /* ,
  code: { value: null, matchMode: FilterMatchMode.CONTAINS },
  inventoryStatus: { value: null, matchMode: FilterMatchMode.STARTS_WITH } */
};

const loading = ref(false);
const stats = ref();
const dt = ref();
const totalRecords = ref(0);
const searchTerm = ref('');

const loadData = async () => {
  console.log('loadData');
  loading.value = true;

  const data = getParamsData(lazyParams.value) as any;

  if (searchTerm.value) {
    data.keyword = searchTerm.value;
  }

  try {
    const response = await repositoryService.getList(data);
    if (response.error?.value?.statusCode === 403) {
      const { logUserOut } = useAuthStore();
      logUserOut();
      navigateTo('/auth/login');
      return;
    }
    if (response.data.value?.success === false) {
      showMessage('error', t('Error'), response.data.value?.message);
      return;
    }
    if (checkLogged(response)) {
      stats.value = response?.data?.value?.list?.map((item: any) => {
        item.metadata = JSON.parse(item.metadata);
        return item;
      });
      totalRecords.value = response?.data?.value?.total;
    }
  } catch (e: any) {
    showMessage('error', t('Error'), e.message);
  } finally {
    loading.value = false;
  }
};

const exportFunction = async (data: any) => {
  return await repositoryService.exportChats(data);
};

const exportData = async () => {
  await exportDataGeneric(t('Exportando datos chat'), exportFunction);
};

const onPage = (event: any) => {
  lazyParams.value = event;
  loadData();
};

const onSort = (event: any) => {
  lazyParams.value = event;
  loadData();
};

const onFilter = (event: any) => {
  lazyParams.value.filters = filters.value;
  loadData();
};

onMounted(() => {
  resetLazyParams(dt?.value?.rows, filters.value);
  loadData();
});

const deleteFile = async (data: any) => {
  const response = await repositoryService.deleteFile(data);
  if (response.data.value.success) {
    showMessage('success', t('Eliminado'), t('El fichero ha sido eliminado correctamente'));
  } else {
    showMessage('error', t('Error'), response.data.value.message);
  }
  loadData();
};

const regenerateFile = async (data: any) => {
  const response = await repositoryService.regenerateFile(data);
  if (response.data.value.success) {
    showMessage('success', t('Actualizado'), t('El fichero ha sido actualizado correctamente'));
  } else {
    showMessage('error', t('Error'), response.data.value.message);
  }
  loadData();
};

const menu = ref();
const menuData = ref();
const items = ref([
    {
        label: t('Opciones'),
        items: [
            /*{
                label: t('Editar'),
                icon: 'pi pi-pencil',
                command: () => {
                  console.log('editUser', menuData.value);
                  editUser(menuData.value);
                },
                class: 'text-green-500'
            },*/
            {
                label: t('Eliminar'),
                icon: 'pi pi-trash',
                command: () => {
                  deleteFile(menuData.value);
                },
                class: 'text-red-500'
            }, {
                label: t('Volver a generar'),
                icon: 'pi pi-refresh',
                command: () => {
                  regenerateFile(menuData.value);
                },
                class: 'text-blue-500'
            }/*,
            {
              label: t('Enviar datos de acceso'),
              icon: 'pi pi-envelope',
              command: () => {
                console.log('sendAccessData', menuData.value);
                sendAccessData(menuData.value);
              },
              class: 'text-yellow-500'
            }*/
        ]
    }
]);

const toggle = (event: Event, data: any) => {
    menu.value.toggle(event);
    // Almacenar los datos del usuario para usarlos en los comandos
    items.value[0]?.items?.forEach((item: any) => {
        menuData.value = data;
        // item.command = () => item.command(menuData.value);
    });
};


const totalSize = ref(0);
const totalSizePercent = ref(0);
const files = ref([]);

const onRemoveTemplatingFile = (file: any, removeFileCallback: any, index: number) => {
    removeFileCallback(index);
    totalSize.value -= file.size; // Use file.size directly (in bytes)
    // Recalculate percentage
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    totalSizePercent.value = Math.min((totalSize.value / maxSize) * 100, 100);
};

const onSelectedFiles = (event: any) => {
    files.value = event.files;
    totalSize.value = 0; // Reset total size
    files.value.forEach((file: any) => {
        totalSize.value += file.size; // Use file.size directly (in bytes)
    });
    // Recalculate percentage
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    totalSizePercent.value = Math.min((totalSize.value / maxSize) * 100, 100);
};

const uploadEvent = (callback: any) => {
    // Calculate percentage based on a reasonable max size (e.g., 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    totalSizePercent.value = Math.min((totalSize.value / maxSize) * 100, 100);
    callback();
};

const uploading = ref(false);
const onTemplatedUpload = async (event: any) => {
  uploading.value = true;
  try {
    let uploadedSize = 0;
    let totalUploaded = 0;
    for (let i = 0; i < event.files.length; i++) {
      totalUploaded += event.files[i].size;
    }
    totalSize.value = totalUploaded;
    totalSizePercent.value = 0;

    for (let i = 0; i < event.files.length; i++) {
      const file = event.files[i];
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = async () => {
          const fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            content: reader.result?.toString().split(',')[1] ?? '' // Get base64 without data:image prefix
          };

          uploadedSize += file.size;
          const response = await repositoryService.uploadFile({ file: fileData });
          if (checkLogged(response)) {
            showMessage('success', t('Success'), `${file.name} - ${t('Fichero subido correctamente')}`);
            loadData();
          }
          totalSizePercent.value = (uploadedSize / totalUploaded) * 100;
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
  } catch (e: any) {
    showMessage('error', t('Error'), e.message);
  } finally {
    loading.value = false;
    uploading.value = false;
  }
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ t('Repositorio de Documentos') }}</h2>

    <div class="grid grid-cols-12 gap-8 mt-1">
      <div class="col-span-12">
        <h5 class="text-lg font-semibold text-gray-700 mb-4">{{ t('Cargar documentos') }}</h5>
        <FileUpload 
            name="demo[]"
            :customUpload="true"
            @uploader="onTemplatedUpload($event)"
            :multiple="true"
            :maxFileSize="100000000"
            @select="onSelectedFiles" 
            accept=".pdf,.doc,.docx,.txt"
        >
            <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
                <div class="flex flex-wrap justify-between items-center flex-1 gap-2">
                    <div class="flex gap-2">
                        <Button @click="chooseCallback()" icon="pi pi-file-pdf" rounded outlined></Button>
                        <Button @click="uploadEvent(uploadCallback)" icon="pi pi-cloud-upload" rounded outlined severity="success" :disabled="!files || files.length === 0"></Button>
                        <Button @click="clearCallback()" icon="pi pi-times" rounded outlined severity="danger" :disabled="!files || files.length === 0"></Button>
                    </div>
                    <div v-if="uploading" class="flex items-center gap-2">
                        <ProgressSpinner style="width: 16px; height: 16px" />
                        <ProgressBar v-show="uploading" :value="totalSizePercent" :showValue="false" :class="['md:w-80 h-4 w-full md:ml-auto', { 'exceeded-progress-bar': totalSizePercent > 100 }]"
                            ><span class="whitespace-nowrap">{{ formatSize(totalSize) }}</span></ProgressBar
                        >
                        <span class="text-sm text-gray-600">{{ t('Subiendo...') }}</span>
                    </div>
                </div>
            </template>
            <template #content="{ files, removeFileCallback }">
              <BlockUI :blocked="uploading">
                <div v-if="files.length > 0">
                    <h5 class="text-lg font-semibold text-gray-700 mb-4">{{ t('Pendientes') }}</h5>
                    <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                        <div v-for="(file, index) of files" :key="file.name + file.type + file.size" class="bg-white rounded-lg shadow-sm border border-gray-200 m-0 px-6 py-4 flex flex-col items-center gap-3">
                            <div v-tooltip.top="file.name">
                                <i :class="formatFileIcon(file.name.split('.').pop() || '')"></i> <span class="ml-2 text-xs text-gray-500">({{ file.name.split('.').pop() || 'sin extensión' }})</span>
                            </div>
                            <div class="text-sm text-gray-700">{{ formatSize(file.size) }}</div>
                            <Badge :value="t('Pendiente')" severity="warning" />
                            <Button icon="pi pi-times" @click="onRemoveTemplatingFile(file, removeFileCallback, index)" outlined rounded  severity="danger" />
                        </div>
                    </div>
                </div>
              </BlockUI>
            </template>
            <template #empty>
              <BlockUI :blocked="uploading">
                <div class="flex items-center justify-center flex-col">
                    <i class="pi pi-cloud-upload border-2 border-gray-300 rounded-full p-5 text-8xl text-gray-400" />
                    <p class="mt-4 mb-0 text-gray-600">{{ t('Arrastre y suelte los archivos aquí para cargarlos.') }}</p>
                </div>
              </BlockUI>
            </template>
        </FileUpload>
      </div>

    </div>
    <div class="grid grid-cols-12 gap-8 mt-1">
      <div class="col-span-12">
        <DataTable
          ref="dt"
          v-model:filters="filters"
          :value="stats"
          :paginator="true"
          :rows="25"
          :lazy="true"
          :total-records="totalRecords"
          filter-display="menu"
          paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          paginator-position="both"
          :rows-per-page-options="[25, 50, 100]"
          responsive-layout="scroll"
          data-key="id"
          striped-rows
          sort-mode="multiple"
          show-gridlines
          :loading="loading"
          :global-filter-fields="['user']"
          :current-page-report-template="t('show-per-page')"
          @page="onPage($event)"
          @sort="onSort($event)"
          @filter="onFilter($event)"
        >
          <template #header>
            <div class="flex justify-between">
              <div class="left-0">
                <Button
                  icon="pi pi-refresh"
                  :label="t('Refrescar')"
                  class="p-button-secondary"
                  @click="loadData()"
                />
                <Button icon="pi pi-file-excel" class="p-button-success ml-2" @click="exportData()" />
              </div>
              <div class="flex items-center gap-2">
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  class="p-button-outlined"
                  @click="searchTerm = ''; loadData()"
                />
                <IconField iconPosition="left">
                  <InputIcon class="pi pi-search"> </InputIcon>
                  <InputText v-model="searchTerm" :placeholder="t('Búsqueda')" @keydown.enter="onFilter" />
                </IconField>
              </div>
            </div>
          </template>
          <template #empty>
            <div class="text-center text-gray-500 py-8">{{ t('No se han encontrado datos.') }}</div>
          </template>
          <template #loading>
            <div class="text-center text-gray-600 py-8">{{ t('Cargando datos..') }} <i class="pi pi-spin pi-spinner" style="font-size: 2rem" /></div>
          </template>
          <Column header="#">
            <template #body="slotProps">              
                <Button type="button" icon="pi pi-ellipsis-v" @click="(e: Event) => toggle(e, slotProps.data)" aria-haspopup="true" aria-controls="overlay_menu" />
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
            </template>
          </Column>
          <Column field="id" :header="t('ID')" :sortable="true">
            <template #body="slotProps">
              <span class="text-center text-xs text-gray-800 font-bold">{{ slotProps.data.id }}</span>
            </template>
          </Column>
          <Column field="created_at" :header="t('Creado')" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm text-gray-700">{{ formatDateTime(slotProps.data.created_at) }}</span>
            </template>
          </Column>
          <Column field="filename" :header="t('Nombre')" :sortable="true" class="text-blue-800">
            <template #body="slotProps">
              <span v-tooltip="slotProps.data.filename" class="text-blue-800">{{ slotProps.data.filename.substring(0,10) }}...</span>
            </template>
          </Column>
          <Column field="original_filename" :header="t('Fichero')" :sortable="true" class="text-blue-400" />
          <Column field="status" :header="t('Estado')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <Tag :severity="formatStatusRepository(slotProps.data.status)" class="text-sm" :value="slotProps.data.status" />
            </template>
          </Column>
          <Column field="mime_type" :header="t('Tipo')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <span class="text-gray-500">{{ slotProps.data.mime_type }}</span>
            </template>
          </Column>

          <Column field="file_size" :header="t('Tamaño')" :sortable="true" class="text-right">
            <template #body="slotProps">
              <span class="text-yellow-600">{{ formatSize(slotProps.data.file_size) }}</span>
            </template>
          </Column>
          <Column field="path" :header="t('Ruta')" :sortable="true">
            <template #body="slotProps">
              <span v-tooltip="slotProps.data.path" class="text-gray-700">{{ slotProps.data.path.substring(0,10) }}...</span>
            </template>
          </Column>
          <Column field="updated_at" :header="t('Actualizado')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <span class="text-sm text-gray-700">{{ formatDateTime(slotProps.data.updated_at) }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>
