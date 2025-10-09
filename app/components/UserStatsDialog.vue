<script setup lang="ts">
import UserService from '~/services/userService';

const { t } = useI18n();
const { showMessage } = useMessages();
interface Props {
  visible: boolean;
  user: any;
}
interface Emits {
  (e: 'update:visible', value: boolean): void;
}

const props = defineProps<Props>();
watch(() => props.visible, (nuevo, anterior) => {
  if (props.user.istester === 1) {
    // Comprobar si 'authoritas' ya existe en las colecciones antes de agregarlo
    if (Array.isArray(props.user.collections) && !props.user.collections.includes('authoritas')) {
      props.user.collections.push('authoritas');
      // Ordenar las colecciones del usuario al abrir el diálogo
      if (Array.isArray(props.user.collections)) {
        props.user.collections.sort();
      }
    }
  }
  getFakeStats();
});


const emit = defineEmits<Emits>();

const userService = new UserService();

const fakeStats = ref([]);
const showCreateDialog = ref(false);
const loading = ref(false);
const fileUploadLoading = ref(false);
const dragOver = ref(false);
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// Formulario para crear fake stats
const newFakeStat = ref({
  collection: '',
  year: null,
  month: null,
  logins: null,
  pages: null,
  ts: '',
  preguntas: null
});

const closeDialog = () => {
  emit('update:visible', false);
};

const getFakeStats = async () => {
  if (!props.user?.user) return;
  const response = await userService.getFakeStats(props.user.user);
  if (checkLogged(response)) {
    const data = await response.data.value.list;
    fakeStats.value = data;
  }
};

const openCreateDialog = () => {
  showCreateDialog.value = true;
  // Resetear formulario
  newFakeStat.value = {
    collection: newFakeStat.value.collection,
    year: newFakeStat.value.year,
    month: null,
    logins: null,
    pages: null,
    ts: '',
    preguntas: null
  };
};

const closeCreateDialog = () => {
  showCreateDialog.value = false;
};

const createFakeStat = async () => {
  loading.value = true;
  try {
    const data = {
      ...newFakeStat.value,
      user: props.user.user
    };

    const response = await userService.createFakeStats(data);
    if (checkLogged(response)) {
      // Recargar las estadísticas
      await getFakeStats();
      closeCreateDialog();
      showMessage('success', t('Éxito'), response?.data?.value?.message || t('Estadística falsa creada correctamente'));
    }
  } catch (error) {
    showMessage('error', t('Error'), error as string || t('Error al crear la estadística falsa'));
  } finally {
    loading.value = false;
  }
};

const confirm = useConfirm();

const getRowClass = (data: any) => {
  const index = fakeStats.value.findIndex((item: any) => item.id === data.id);
  return index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700';
};

const confirmDelete = (id: number) => {
  const msg = t('¿Quieres eliminar la estadística falsa [{id}]?').replace('{id}', id.toString());
  confirm.require({
    message: msg,
    header: t('Confirmar eliminación'),
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger',
    acceptLabel: t('Sí'),
    accept: async () => {
      const response = await userService.deleteFakeStats(id);
      if (checkLogged(response)) {
        if (response?.data?.value?.success !== true) {
          showMessage('error', t('Error'), response?.data?.value?.message);
        } else {
          showMessage('info', t('Estadísticas'), t('Estadística falsa {id} Eliminada').replace('{id}', id.toString()));
          getFakeStats();
        }
      }
    }
  });
};

// Funciones para manejo de archivos
const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (isValidExcelFile(file)) {
      selectedFile.value = file;
    } else {
      showMessage('error', t('Error'), t('Por favor selecciona un archivo EXCEL válido (.xlsx, .xls, .csv)'));
    }
  }
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = true;
};

const onDragLeave = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = false;
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = false;

  if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0] as File;
    if (isValidExcelFile(file)) {
      selectedFile.value = file;
    } else {
      showMessage('error', t('Error'), t('Por favor arrastra un archivo EXCEL válido (.xlsx, .xls, .csv)'));
    }
  }
};

const isValidExcelFile = (file: File): boolean => {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv
  ];
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

  return validTypes.includes(file.type) || validExtensions.includes(fileExtension);
};

const uploadFile = async () => {
  if (!selectedFile.value || !props.user?.user) return;

  fileUploadLoading.value = true;
  try {
    const response = await userService.importFakeStats(props.user.user, selectedFile.value);
    if (checkLogged(response)) {
      if (response?.data?.value?.success !== true) {
        showMessage('error', t('Error'), response?.data?.value?.message || t('Error al importar el archivo'));
      } else {
        showMessage('success', t('Éxito'), response?.data?.value?.message);
        if (response?.data?.value?.errors?.length > 0 || response?.data?.value?.duplicates?.length > 0) {
          let mensaje = `${t('Estadísticas manuales importadas')}: ${response.data.value.imported}\n\n`;
          if (response.data.value.duplicates.length > 0) {
            mensaje += `${t('Duplicadas')}:\n`;
            response.data.value.duplicates.forEach((duplicate: string) => {
              mensaje += `${duplicate}\n`;
            });
          }
          if (response.data.value.errors.length > 0) {
            mensaje += `${t('Errores')}:\n`;
            response.data.value.errors.forEach((error: string) => {
              mensaje += `${error}\n`;
            });
          }
          showMessage('info', t('Resultado de la importación'), mensaje, -1);
        }
        selectedFile.value = null;
        await getFakeStats();
      }
    }
  } catch (error) {
    showMessage('error', t('Error'), t('Error al importar el archivo'));
  } finally {
    fileUploadLoading.value = false;
  }
};

const clearFile = () => {
  selectedFile.value = null;
};

const onVisibleChange = (value: boolean) => {
  emit('update:visible', value);
  if (value) {
    getFakeStats();
  }
};
</script>

<template>
  <Dialog :visible="visible" @update:visible="onVisibleChange" modal maximizable :style="{ width: '90rem' }"
    :breakpoints="{ '1199px': '95vw', '575px': '95vw' }">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-800">
        <i class="pi pi-chart-bar" /> {{ t('Estadísticas del Usuario') }}: {{ user?.name || user?.user }}
      </h3>
    </template>

    <div v-if="user" class="grid grid-cols-12 gap-6">
      <!-- Columna izquierda - Información del usuario -->
      <div class="col-span-12 md:col-span-6">
        <!-- Información Básica del Usuario -->
        <Fieldset :legend="t('Información del Usuario')" class="col-span-12">
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-6">
              <div class="flex items-center gap-2 mb-3">
                <i class="pi pi-user text-blue-600"></i>
                <span class="font-semibold text-gray-700">{{ t('Nombre') }}:</span>
                <span class="text-gray-600">{{ user.name }}</span>
              </div>
              <div class="flex items-center gap-2 mb-3">
                <i class="pi pi-at text-green-600"></i>
                <span class="font-semibold text-gray-700">{{ t('Usuario') }}:</span>
                <span class="text-gray-600">{{ user.user }}</span>
              </div>
              <div class="flex items-center gap-2 mb-3">
                <i class="pi pi-envelope text-purple-600"></i>
                <span class="font-semibold text-gray-700">{{ t('Email') }}:</span>
                <span class="text-gray-600">{{ user.email || t('No especificado') }}</span>
              </div>
            </div>
            <div class="col-span-12 md:col-span-6">
              <div class="flex items-center gap-2 mb-3">
                <i class="pi pi-users text-orange-600"></i>
                <span class="font-semibold text-gray-700">{{ t('Grupo') }}:</span>
                <span class="text-gray-600">{{ user.grupo || t('No especificado') }}</span>
              </div>
              <div class="flex items-center gap-2 mb-3">
                <i class="pi pi-calendar text-red-600"></i>
                <span class="font-semibold text-gray-700">{{ t('Período') }}:</span>
                <span class="text-gray-600">{{ user.begin }} - {{ user.end }}</span>
              </div>
              <div class="flex items-center gap-2 mb-3">
                <i class="pi pi-chart-line text-indigo-600"></i>
                <span class="font-semibold text-gray-700">{{ t('Inicio estadísticas') }}:</span>
                <span class="text-gray-600">{{ user.stats_min ? formatDate(user.stats_min) : t('No especificado') }}</span>
              </div>
              <div class="flex items-center gap-2 mb-3"> 
                <i class="pi pi-chart-bar text-yellow-600"></i>
                <span class="font-semibold text-gray-700">{{ t('Solo estadísticas manuales') }}:</span>
                <span :class="user.manual_stats ? 'bg-green-600 text-white px-2 py-0.5 rounded' : 'text-gray-600'">
                  {{ user.manual_stats ? t('Sí') : t('No') }}
                </span>
              </div>
            </div>
          </div>
        </Fieldset>

        <!-- Estado y Permisos -->
        <Fieldset :legend="t('Estado y Permisos')" class="col-span-12">
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-6">
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <i :class="'pi ' + (user.isenabled ? 'pi-check text-green-600' : 'pi-times text-red-600')"></i>
                  <span class="font-semibold text-gray-700">{{ t('Activo') }}:</span>
                  <span :class="user.isenabled ? 'text-green-600' : 'text-red-600'">
                    {{ user.isenabled ? t('Sí') : t('No') }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <i :class="'pi ' + (user.isadmin ? 'pi-check text-purple-600' : 'pi-times text-gray-400')"></i>
                  <span class="font-semibold text-gray-700">{{ t('Administrador') }}:</span>
                  <span :class="user.isadmin ? 'text-purple-600' : 'text-gray-400'">
                    {{ user.isadmin ? t('Sí') : t('No') }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <i :class="'pi ' + (user.iseditor ? 'pi-check text-blue-600' : 'pi-times text-gray-400')"></i>
                  <span class="font-semibold text-gray-700">{{ t('Editor') }}:</span>
                  <span :class="user.iseditor ? 'text-blue-600' : 'text-gray-400'">
                    {{ user.iseditor ? t('Sí') : t('No') }}
                  </span>
                </div>
              </div>
            </div>
            <div class="col-span-12 md:col-span-6">
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <i :class="'pi ' + (user.istester ? 'pi-check text-orange-600' : 'pi-times text-gray-400')"></i>
                  <span class="font-semibold text-gray-700">{{ t('Tester') }}:</span>
                  <span :class="user.istester ? 'text-orange-600' : 'text-gray-400'">
                    {{ user.istester ? t('Sí') : t('No') }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <i
                    :class="'pi ' + (user.dashboard_access ? 'pi-check text-yellow-600' : 'pi-times text-gray-400')"></i>
                  <span class="font-semibold text-gray-700">{{ t('Dashboard') }}:</span>
                  <span :class="user.dashboard_access ? 'text-yellow-600' : 'text-gray-400'">
                    {{ user.dashboard_access ? t('Sí') : t('No') }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="pi pi-key text-gray-600"></i>
                  <span class="font-semibold text-gray-700">{{ t('Licencias') }}:</span>
                  <span class="text-gray-600">{{ user.licenses }}</span>
                </div>
              </div>
            </div>
          </div>
        </Fieldset>

        <!-- Colecciones -->
        <Fieldset :legend="t('Colecciones')" class="col-span-12">
          <div v-if="user.collections && user.collections.length > 0" class="flex flex-wrap gap-2">
            <Tag v-for="collection in user.collections" :key="collection" :value="collection" rounded class="text-sm" />
          </div>
          <div v-else class="text-gray-500 italic">
            {{ t('No hay colecciones asignadas') }}
          </div>
        </Fieldset>

        <!-- Restricciones -->
        <Fieldset :legend="t('Restricciones')" class="col-span-12">
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-6">
              <div class="mb-3">
                <span class="font-semibold text-gray-700 block mb-2">
                  <i class="pi pi-globe text-blue-600"></i> {{ t('Rango IP') }}:
                </span>
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-sm">
                  {{ user.iprange || t('No especificado') }}
                </div>
              </div>
              <div class="mb-3">
                <span class="font-semibold text-gray-700 block mb-2">
                  <i class="pi pi-map-marker text-green-600"></i> {{ t('GeoIP') }}:
                </span>
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-sm">
                  {{ user.geoip || t('No especificado') }}
                </div>
              </div>
            </div>
            <div class="col-span-12 md:col-span-6">
              <div class="mb-3">
                <span class="font-semibold text-gray-700 block mb-2">
                  <i class="pi pi-link text-purple-600"></i> {{ t('Referer') }}:
                </span>
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-sm">
                  {{ user.referer || t('No especificado') }}
                </div>
              </div>
              <div class="mb-3">
                <span class="font-semibold text-gray-700 block mb-2">
                  <i class="pi pi-tag text-orange-600"></i> {{ t('Meta') }}:
                </span>
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-sm">
                  {{ user.meta || t('No especificado') }}
                </div>
              </div>
            </div>
          </div>
        </Fieldset>

        <!-- Fechas de Creación y Actualización -->
        <Fieldset :legend="t('Información de Sistema')" class="col-span-12">
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-6">
              <div class="flex items-center gap-2">
                <i class="pi pi-calendar-plus text-green-600"></i>
                <span class="font-semibold text-gray-700">{{ t('Creado') }}:</span>
                <span class="text-gray-600">
                  {{ user.created_at ? new Date(user.created_at).toLocaleString('es-ES') : t('No disponible') }}
                </span>
              </div>
            </div>
            <div class="col-span-12 md:col-span-6">
              <div class="flex items-center gap-2">
                <i class="pi pi-calendar-minus text-blue-600"></i>
                <span class="font-semibold text-gray-700">{{ t('Actualizado') }}:</span>
                <span class="text-gray-600">
                  {{ user.updated_at ? new Date(user.updated_at).toLocaleString('es-ES') : t('No disponible') }}
                </span>
              </div>
            </div>
          </div>
        </Fieldset>
      </div>

      <!-- Columna derecha - Tabla de Fake Stats -->
      <div class="col-span-12 md:col-span-6">
        <Fieldset class="col-span-12">
          <template #legend>
            <div class="flex justify-between items-center w-full">
              <span class="text-lg font-semibold">{{ t('Estadísticas Manuales') }}</span>
              <Button icon="pi pi-plus" size="small" class="p-button-sm ml-4" @click="openCreateDialog" />
              <Button icon="pi pi-refresh" size="small" class="p-button-sm p-button-secondary ml-2"
                @click="getFakeStats" />
            </div>
          </template>

          <!-- Zona de carga de archivos EXCEL -->
          <div class="mb-4">
            <div :class="[
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200',
              dragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600',
              selectedFile ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : ''
            ]" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
              <div v-if="!selectedFile">
                <i class="pi pi-file-excel text-4xl text-green-600 mb-3"></i>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {{ t('Arrastra un archivo EXCEL aquí o haz clic para seleccionar') }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-500">
                  {{ t('Formatos soportados: .xlsx, .xls, .csv') }}
                </p>
                <input type="file" accept=".xlsx,.xls,.csv" @change="onFileSelect" class="hidden" ref="fileInput" />
                <Button :label="t('Seleccionar archivo')" icon="pi pi-upload" size="small" class="mt-2"
                  @click="fileInput?.click()" />
              </div>

              <div v-else class="flex items-center justify-between">
                <div class="flex items-center">
                  <i class="pi pi-file-excel text-2xl text-green-600 mr-3"></i>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ selectedFile.name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ (selectedFile.size / 1024).toFixed(1) }} KB
                    </p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <Button :label="t('Subir')" icon="pi pi-upload" size="small" :loading="fileUploadLoading"
                    @click="uploadFile" />
                  <Button :label="t('Cancelar')" icon="pi pi-times" size="small" class="p-button-secondary"
                    @click="clearFile" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="fakeStats && fakeStats.length > 0" class="overflow-auto max-h-96">
            <DataTable :value="fakeStats" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20]"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros" class="p-datatable-sm"
              responsiveLayout="scroll" :rowClass="getRowClass">
              <Column field="collection" :header="t('Colección')" :sortable="true" class="text-xs">
                <template #body="slotProps">
                  <span class="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    {{ slotProps.data.collection }}
                  </span>
                </template>
              </Column>
              <Column field="year" :header="t('Año')" :sortable="true" class="text-xs">
                <template #body="slotProps">
                  <span class="text-xs text-gray-700 dark:text-gray-300">
                    {{ slotProps.data.year }}
                  </span>
                </template>
              </Column>
              <Column field="month" :header="t('Mes')" :sortable="true" class="text-xs">
                <template #body="slotProps">
                  <span class="text-xs text-gray-700 dark:text-gray-300">
                    {{ formatMonthNumber(slotProps.data.month) }}
                  </span>
                </template>
              </Column>
              <Column field="logins" :header="t('Logins')" :sortable="true" class="text-xs">
                <template #body="slotProps">
                  <span v-if="slotProps.data.logins"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {{ formatIntNumber(slotProps.data.logins) }}
                  </span>
                  <span v-else class="text-xs text-gray-500">-</span>
                </template>
              </Column>
              <Column field="pages" :header="t('Páginas')" :sortable="true" class="text-xs">
                <template #body="slotProps">
                  <span v-if="slotProps.data.pages"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    {{ formatIntNumber(slotProps.data.pages) }}
                  </span>
                  <span v-else class="text-xs text-gray-500">-</span>
                </template>
              </Column>
              <Column field="preguntas" :header="t('Preguntas')" :sortable="true" class="text-xs">
                <template #body="slotProps">
                  <span v-if="slotProps.data.preguntas"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    {{ formatIntNumber(slotProps.data.preguntas) }}
                  </span>
                  <span v-else class="text-xs text-gray-500">-</span>
                </template>
              </Column>
              <Column field="ts" :header="t('TS')" :sortable="true" class="text-xs">
                <template #body="slotProps">
                  <span v-if="slotProps.data.ts" class="text-xs text-gray-700 dark:text-gray-300 font-mono">
                    {{ slotProps.data.ts }}
                  </span>
                  <span v-else class="text-xs text-gray-500">-</span>
                </template>
              </Column>
              <Column header="" :exportable="false" class="text-xs text-right">
                <template #body="slotProps">
                  <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm"
                    @click="confirmDelete(slotProps.data.id)" v-tooltip.top="t('Eliminar')" />
                </template>
              </Column>
            </DataTable>
          </div>
          <div v-else class="text-gray-500 italic text-center py-4">
            <i class="pi pi-info-circle text-2xl mb-2 block"></i>
            {{ t('No hay estadísticas manuales disponibles') }}
          </div>
        </Fieldset>
      </div>
    </div>

    <template #footer>
      <Button :label="t('Cerrar')" icon="pi pi-times" class="p-button-secondary" @click="closeDialog" />
    </template>
  </Dialog>

  <!-- Diálogo para crear nueva estadística falsa -->
  <Dialog :visible="showCreateDialog" @update:visible="(value) => showCreateDialog = value" modal
    :style="{ width: '40rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-800">
        <i class="pi pi-plus" /> {{ t('Añadir Estadística Manual') }}
      </h3>
    </template>

    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('Colección') }} <span class="text-red-500">*</span>
        </label>
        <Dropdown v-model="newFakeStat.collection" :options="user?.collections || []"
          :placeholder="t('Seleccione una colección')" class="w-full" required showClear />
      </div>

      <div class="col-span-12 md:col-span-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('Año') }} <span class="text-red-500">*</span>
        </label>
        <InputNumber v-model="newFakeStat.year" :min="2000" :max="2030" class="w-full" required />
      </div>

      <div class="col-span-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('Mes') }} <span class="text-red-500">*</span>
        </label>
        <InputNumber v-model="newFakeStat.month" :min="1" :max="12" class="w-full" required />
      </div>

      <div class="col-span-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('Logins') }}
        </label>
        <InputNumber v-model="newFakeStat.logins" :min="0" class="w-full" />
      </div>

      <div class="col-span-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('Páginas') }}
        </label>
        <InputNumber v-model="newFakeStat.pages" :min="0" class="w-full" />
      </div>

      <div class="col-span-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('Preguntas') }}
        </label>
        <InputNumber v-model="newFakeStat.preguntas" :min="0" class="w-full" />
      </div>

      <div class="col-span-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('TS') }}
        </label>
        <InputText v-model="newFakeStat.ts" :placeholder="t('Ingrese el TS')" class="w-full" />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button :label="t('Cancelar')" icon="pi pi-times" class="p-button-secondary" @click="closeCreateDialog" />
        <Button :label="t('Crear')" icon="pi pi-check" :loading="loading" @click="createFakeStat"
          :disabled="!newFakeStat.collection || !newFakeStat.year || !newFakeStat.month" />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
:deep(.p-datatable-tbody > tr) {
  transition: all 0.2s ease-in-out;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: rgb(239 246 255) !important;
  /* bg-blue-50 */
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

:deep(.dark .p-datatable-tbody > tr:hover) {
  background-color: rgb(30 58 138 / 0.2) !important;
  /* dark:bg-blue-900/20 */
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 1rem 0.75rem;
  white-space: nowrap;
}

:deep(.p-datatable-thead > tr > th) {
  background-color: rgb(249 250 251);
  border-bottom: 1px solid rgb(229 231 235);
  padding: 0.75rem;
  font-weight: 600;
  color: rgb(17 24 39);
}

:deep(.dark .p-datatable-thead > tr > th) {
  background-color: rgb(31 41 55);
  border-bottom: 1px solid rgb(75 85 99);
  color: rgb(243 244 246);
}
</style>
