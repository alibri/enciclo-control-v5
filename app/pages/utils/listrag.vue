<script setup lang='ts'>
import TestService from '~/services/testService';
import RAGResultView from '~/components/RAGResultView.vue';

const { showMessage, removeGroup } = useMessages();
const { t } = useI18n();

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

// Cargar listado de testRAG
const loadTestRAGList = async () => {
  loading.value = true;
  showMessage('info', t('Cargando'), t('Obteniendo listado de testRAG...'), -1, 'listrag');
  
  try {
    const response = await testService.listRAG({
      page: page.value,
      items: itemsPerPage.value,
      order: 'created_at desc'
    });
    
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
        
        // Obtener el resultado parseado o parsearlo si no existe
        let result = ragData.result_parsed;
        if (!result && ragData.result) {
          try {
            result = typeof ragData.result === 'string' ? JSON.parse(ragData.result) : ragData.result;
          } catch (e) {
            console.error('Error parsing result:', e);
            result = null;
          }
        }
        
        // Obtener la configuración parseada o parsearla si no existe
        let config = ragData.config_parsed;
        if (!config && ragData.config) {
          try {
            config = typeof ragData.config === 'string' ? JSON.parse(ragData.config) : ragData.config;
          } catch (e) {
            console.error('Error parsing config:', e);
            config = null;
          }
        }
        
        // Asegurar que el resultado tenga el query y test_id
        if (result) {
          result.query = ragData.query || result.query;
          result.test_id = ragData.id;
        }
        
        selectedResult.value = result;
        selectedConfig.value = config;
        selectedTestRAG.value = ragData;
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
  loadTestRAGList();
});
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
        <Button
          :label="t('Recargar')"
          icon="pi pi-refresh"
          :loading="loading"
          @click="loadTestRAGList"
          outlined
        />
      </div>
    </div>

    <!-- Listado de TestRAG -->
    <Card>
      <template #content>
        <DataTable
          :value="testRAGList"
          :loading="loading"
          :paginator="true"
          :rows="itemsPerPage"
          :totalRecords="totalRecords"
          :lazy="true"
          @page="(event) => { page = event.page + 1; loadTestRAGList(); }"
          stripedRows
          responsiveLayout="scroll"
          class="p-datatable-sm"
          :pt="{
            root: 'border rounded-lg',
            header: '',
            bodyRow: 'hover:bg-gray-50 cursor-pointer'
          }"
        >
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
              <div v-if="data.rating_respuesta !== null && data.rating_respuesta !== undefined" class="flex items-center space-x-2">
                <Rating :modelValue="data.rating_respuesta" :readonly="true" :cancel="false" />
                <span class="text-sm" style="color: var(--text-color-secondary);">({{ data.rating_respuesta }})</span>
              </div>
              <span v-else class="text-sm" style="color: var(--text-color-secondary);">-</span>
            </template>
          </Column>

          <Column field="rating_velocidad" :header="t('Rating Velocidad')" :sortable="true" style="width: 150px">
            <template #body="{ data }">
              <div v-if="data.rating_velocidad !== null && data.rating_velocidad !== undefined" class="flex items-center space-x-2">
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
              <Button
                :label="t('Ver')"
                icon="pi pi-eye"
                size="small"
                outlined
                @click="openTestRAG(data)"
              />
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
      </template>
    </Card>

    <!-- Modal con RAGResultView -->
    <Dialog
      v-model:visible="dialogVisible"
      modal
      maximizable
      :header="selectedTestRAG?.query || t('Resultado Test RAG')"
      :style="{ width: '95vw', maxWidth: '1400px' }"
      :pt="{
        root: 'flex flex-col',
        content: 'flex-1 overflow-auto p-0',
        header: 'border-b bg-gradient-to-r from-blue-50 to-indigo-50',
        title: 'text-xl font-semibold'
      }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <i class="pi pi-code text-2xl text-blue-600 "></i>
          <div class="flex-1">
            <h3 class="text-xl font-semibold" style="color: var(--text-color);">
              {{ selectedTestRAG?.query || t('Resultado Test RAG') }}
            </h3>
            <p v-if="selectedTestRAG" class="text-sm mt-1" style="color: var(--text-color-secondary);">
              {{ t('ID') }}: {{ selectedTestRAG.id }} | {{ t('Usuario') }}: {{ selectedTestRAG.username || '-' }} | {{ formatDate(selectedTestRAG.created_at) }}
            </p>
            <p v-if="selectedTestRAG?.comentario" class="text-sm mt-2 italic border-l-4 border-blue-500 pl-3 bg-blue-50 py-2 rounded-r" style="color: var(--text-color);">
              <i class="pi pi-comment mr-2 text-blue-600 "></i>
              <strong>{{ t('Comentario') }}:</strong> {{ selectedTestRAG.comentario }}
            </p>
          </div>
        </div>
      </template>

      <div v-if="selectedResult" class="p-4">
        <RAGResultView
          :result="selectedResult"
          :config="selectedConfig"
          :showEvaluation="false"
          :showJson="true"
        />
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

