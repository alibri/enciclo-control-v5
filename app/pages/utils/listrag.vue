<script setup lang='ts'>
import TestService from '~/services/testService';
import RAGResultView from '~/components/RAGResultView.vue';

useAuthGuard();

const { showMessage, removeGroup } = useMessages();
const { t } = useI18n();
const { getParamsData, lazyParams, exportDataGeneric, resetLazyParams } = useUtilsData();
const { filters } = usePrimeDataTable();

filters.value = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  user: { value: null, matchMode: FilterMatchMode.CONTAINS } /* ,
  code: { value: null, matchMode: FilterMatchMode.CONTAINS },
  inventoryStatus: { value: null, matchMode: FilterMatchMode.STARTS_WITH } */
};
const testService = new TestService();
const loading = ref(false);
const testRAGList = ref<any[]>([]);
const totalRecords = ref(0);
const page = ref(1);
const itemsPerPage = ref(20);
const dialogVisible = ref(false);
const selectedTestRAG = ref<any>(null);
const selectedResult = ref<any>(null);
const selectedConfig = ref<any>(null);
const dt = ref();

// Cargar listado de testRAG
const loadTestRAGList = async () => {
  loading.value = true;
  showMessage('info', t('Cargando'), t('Obteniendo listado de testRAG...'), -1, 'listrag');

  const data = getParamsData(lazyParams.value) as any;

  try {
    const response = await testService.listRAG(data);

    removeGroup('listrag');

    if (checkLogged(response)) {
      const data = response?.data?.result || response?.data?.value;
      if (data?.success) {
        testRAGList.value = data.list || [];
        totalRecords.value = data.total || 0;
      } else {
        showMessage('error', t('Error'), data?.message || t('Error al cargar el listado'), -1);
      }
    } else {
      showMessage('error', t('Error'), response?.data?.result?.message || response?.data?.value?.message || t('Error al cargar el listado'), -1);
    }
  } catch (error: any) {
    removeGroup('listrag');
    showMessage('error', t('Error'), error?.message || t('Error al cargar el listado'), -1);
  } finally {
    loading.value = false;
  }
};

// Abrir modal con el resultado del testRAG
const openTestRAG = async (item: any) => {
  dialogVisible.value = false;
  selectedTestRAG.value = null;
  selectedResult.value = null;
  selectedConfig.value = null;

  showMessage('info', t('Cargando'), t('Obteniendo detalles del testRAG...'), -1, 'getrag');

  try {
    const response = await testService.getRAG(item.id);

    removeGroup('getrag');

    if (checkLogged(response)) {
      const data = response?.data?.result || response?.data?.value;
      if (data?.success && data?.result) {
        const ragData = data.result;

        // Convert string to JSON if necessary for result
        let result = ragData.result;
        if (typeof result === 'string') {
          try {
            result = JSON.parse(result);
          } catch (e) {
            console.error('Error parsing result string:', e);
            result = null;
          }
        }
        // Convert string to JSON if necessary for config
        let config = ragData.config;
        if (typeof config === 'string') {
          try {
            config = JSON.parse(config);
          } catch (e) {
            console.error('Error parsing config string:', e);
            config = null;
          }
        }

        // Ensure result has query and test_id
        if (result) {
          result.query = ragData.query || result.query;
          result.test_id = ragData.id;
        }

        selectedResult.value = result;
        selectedConfig.value = config;
        selectedTestRAG.value = ragData;
        // Convertir create_at de string a timestamp (si existe y es string)
        if (
          selectedTestRAG.value &&
          selectedTestRAG.value.created_at &&
          typeof selectedTestRAG.value.created_at === 'string'
        ) {
          const date = new Date(selectedTestRAG.value.created_at);
          if (!isNaN(date.getTime())) {
            selectedTestRAG.value.created_at = Math.floor(date.getTime() / 1000);
          }
        }
        dialogVisible.value = true;
      } else {
        showMessage('error', t('Error'), data?.message || t('No se encontró el testRAG'), -1);
      }
    } else {
      showMessage('error', t('Error'), response?.data?.result?.message || response?.data?.value?.message || t('Error al obtener el testRAG'), -1);
    }
  } catch (error: any) {
    removeGroup('getrag');
    showMessage('error', t('Error'), error?.message || t('Error al obtener el testRAG'), -1);
  }
};

// Formatear fecha
const formatDate = (timestamp: number) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Truncar texto
const truncateText = (text: string, maxLength: number = 100) => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Cargar datos al montar el componente
onMounted(() => {
  resetLazyParams(dt.value.rows, filters.value);
  loadTestRAGList();
});


const onPage = (event: any) => {
  lazyParams.value = event;
  loadTestRAGList();
};

const onSort = (event: any) => {
  lazyParams.value = event;
  loadTestRAGList();
};

const onFilter = (event: any) => {
  lazyParams.value.filters = filters.value;
  loadTestRAGList();
};

const onRowDoubleClick = (event: any) => {
  openTestRAG(event.data);
};

</script>

<template>
  <div class="min-h-screen p-4" style="background-color: var(--surface-ground);">
    <!-- Header Section -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <h2 class="text-3xl font-bold" style="color: var(--text-color);">
            <i class="pi pi-list mr-2 text-blue-500"></i>
            {{ t('Listado de Test RAG') }}
          </h2>
          <Badge v-if="totalRecords > 0" :value="formatIntNumber(totalRecords)" severity="info" />
        </div>
        <Button :label="t('Recargar')" icon="pi pi-refresh" :loading="loading" @click="loadTestRAGList" outlined />
      </div>
    </div>

    <!-- Listado de TestRAG -->
    <div class="grid grid-cols-12 p-1">
      <div class="col-span-12 overflow-x-auto">
        <DataTable ref="dt" v-model:filters="filters" :value="testRAGList" :paginator="true" :rows="25" :lazy="true"
          :total-records="totalRecords" filter-display="menu"
          paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          paginator-position="both" :rows-per-page-options="[25, 50, 100]" responsive-layout="scroll" data-key="id"
          striped-rows sort-mode="multiple" show-gridlines :loading="loading" :global-filter-fields="['user']"
          :current-page-report-template="t('show-per-page')" class="p-datatable-sm" @page="onPage($event)"
          @sort="onSort($event)" @filter="onFilter($event)" @row-dblclick="onRowDoubleClick($event)">
          <template #header>
            <div class="flex flex-wrap justify-between items-center gap-4 p-4 border-b"
              style="background-color: var(--surface-card); border-color: var(--surface-border);">
              <div class="flex items-center gap-2">
                <i class="pi pi-table" style="color: var(--primary-color);"></i>
                <span class="font-semibold" style="color: var(--text-color);">{{ t('Listado de Test RAG') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm" style="color: var(--text-color-secondary);">{{ formatIntNumber(totalRecords) }} {{
                  t('registros') }}</span>
              </div>
            </div>
          </template>
          <Column field="id" :header="t('ID')" :sortable="true" style="width: 80px">
            <template #body="{ data }">
              <span class="font-mono text-sm">{{ data.id }}</span>
            </template>
          </Column>

          <Column field="query" :header="t('Consulta')" :sortable="true">
            <template #body="{ data }">
              <div class="max-w-md">
                <p class="text-sm font-medium" style="color: var(--text-color);">
                  {{ truncateText(data.query, 80) }}
                </p>
              </div>
            </template>
          </Column>

          <Column field="username" :header="t('Usuario')" :sortable="true" style="width: 150px">
            <template #body="{ data }">
              <span class="text-sm">{{ data.username || '-' }}</span>
            </template>
          </Column>

          <Column field="rating_respuesta" :header="t('Rating Respuesta')" :sortable="true" style="width: 150px">
            <template #body="{ data }">
              <div v-if="data.rating_respuesta !== null && data.rating_respuesta !== undefined"
                class="flex items-center space-x-2">
                <Rating :modelValue="data.rating_respuesta" :readonly="true" :cancel="false" />
                <span class="text-sm" style="color: var(--text-color-secondary);">({{ data.rating_respuesta }})</span>
              </div>
              <span v-else class="text-sm" style="color: var(--text-color-secondary);">-</span>
            </template>
          </Column>

          <Column field="rating_velocidad" :header="t('Rating Velocidad')" :sortable="true" style="width: 150px">
            <template #body="{ data }">
              <div v-if="data.rating_velocidad !== null && data.rating_velocidad !== undefined"
                class="flex items-center space-x-2">
                <Rating :modelValue="data.rating_velocidad" :readonly="true" :cancel="false" />
                <span class="text-sm" style="color: var(--text-color-secondary);">({{ data.rating_velocidad }})</span>
              </div>
              <span v-else class="text-sm" style="color: var(--text-color-secondary);">-</span>
            </template>
          </Column>

          <Column field="comentario" :header="t('Comentario')" :sortable="false" style="width: 250px">
            <template #body="{ data }">
              <div v-if="data.comentario" class="max-w-xs">
                <p class="text-sm italic" style="color: var(--text-color-secondary);">
                  {{ truncateText(data.comentario, 60) }}
                </p>
              </div>
              <span v-else class="text-sm" style="color: var(--text-color-secondary);">-</span>
            </template>
          </Column>

          <Column field="created_at" :header="t('Fecha')" :sortable="true" style="width: 180px">
            <template #body="{ data }">
              <span class="text-sm" style="color: var(--text-color-secondary);">{{ formatDate(data.created_at) }}</span>
            </template>
          </Column>

          <Column :header="t('Acciones')" style="width: 120px">
            <template #body="{ data }">
              <Button :label="t('Ver')" icon="pi pi-eye" size="small" outlined @click="openTestRAG(data)" />
            </template>
          </Column>

          <template #empty>
            <div class="text-center py-12">
              <i class="pi pi-inbox text-4xl  mb-4"></i>
              <p style="color: var(--text-color-secondary);">{{ t('No hay testRAG disponibles') }}</p>
            </div>
          </template>

          <template #loading>
            <div class="text-center py-12">
              <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4"></i>
              <p style="color: var(--text-color-secondary);">{{ t('Cargando...') }}</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Modal con RAGResultView -->
    <Dialog v-model:visible="dialogVisible" modal maximizable
      :header="selectedTestRAG?.query || t('Resultado Test RAG')" :style="{ width: '95vw', maxWidth: '1400px' }" :pt="{
        root: 'flex flex-col',
        content: 'flex-1 overflow-auto p-0',
        header: 'border-b',
        title: 'text-xl font-semibold'
      }">
      <template #header>
        <div class="flex items-center gap-3">
          <i class="pi pi-code text-2xl" style="color: var(--primary-color);"></i>
          <div class="flex-1">
            <h3 class="text-xl font-semibold" style="color: var(--text-color);">
              {{ selectedTestRAG?.query || t('Resultado Test RAG') }}
            </h3>
            <p v-if="selectedTestRAG" class="text-sm mt-1" style="color: var(--text-color-secondary);">
              {{ t('ID') }}: {{ selectedTestRAG.id }} | {{ t('Usuario') }}: {{ selectedTestRAG.username || '-' }} | {{
                formatDate(selectedTestRAG.created_at) }}
            </p>
            <div
              v-if="selectedTestRAG && (selectedTestRAG.rating_respuesta !== null && selectedTestRAG.rating_respuesta !== undefined || selectedTestRAG.rating_velocidad !== null && selectedTestRAG.rating_velocidad !== undefined)"
              class="flex items-center gap-4 mt-2">
              <div v-if="selectedTestRAG.rating_respuesta !== null && selectedTestRAG.rating_respuesta !== undefined"
                class="flex items-center gap-2">
                <span class="text-sm font-medium" style="color: var(--text-color-secondary);">{{ t('Rating Respuesta')
                  }}:</span>
                <Rating :modelValue="selectedTestRAG.rating_respuesta" :readonly="true" :cancel="false" />
                <span class="text-sm" style="color: var(--text-color-secondary);">({{ selectedTestRAG.rating_respuesta
                  }})</span>
              </div>
              <div v-if="selectedTestRAG.rating_velocidad !== null && selectedTestRAG.rating_velocidad !== undefined"
                class="flex items-center gap-2">
                <span class="text-sm font-medium" style="color: var(--text-color-secondary);">{{ t('Rating Velocidad')
                  }}:</span>
                <Rating :modelValue="selectedTestRAG.rating_velocidad" :readonly="true" :cancel="false" />
                <span class="text-sm" style="color: var(--text-color-secondary);">({{ selectedTestRAG.rating_velocidad
                  }})</span>
              </div>
            </div>
            <p v-if="selectedTestRAG?.comentario"
              class="text-sm mt-2 italic border-l-4 pl-3 py-2 rounded-r"
              style="background-color: var(--highlight-bg); border-color: var(--primary-color); color: var(--text-color);">
              <i class="pi pi-comment mr-2" style="color: var(--primary-color);"></i>
              <strong>{{ t('Comentario') }}:</strong> {{ selectedTestRAG.comentario }}
            </p>
          </div>
        </div>
      </template>

      <div v-if="selectedResult" class="p-4">
        <RAGResultView :result="selectedResult" :config="selectedConfig" :showEvaluation="false" :showJson="true" />
      </div>
      <div v-else class="p-12 text-center">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4"></i>
        <p style="color: var(--text-color-secondary);">{{ t('Cargando resultado...') }}</p>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.p-datatable .p-datatable-tbody > tr) {
  cursor: pointer;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: rgba(59, 130, 246, 0.05);
}
</style>
