<script setup lang='ts'>
// import { FilterMatchMode, FilterOperator } from 'primevue/api';
import ChatLink from '@/components/ChatLink.vue';
import StatsService from '@/services/statsService';
import { showChat } from '@/utils/page';

import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import DataView from 'primevue/dataview';
import Card from 'primevue/card';

const { filters } = usePrimeDataTable();
const { t } = useI18n();
const { getParamsData, lazyParams, exportDataGeneric, resetLazyParams } = useUtilsData();

const statsService = new StatsService();

filters.value = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  user: { value: null, matchMode: FilterMatchMode.CONTAINS } /* ,
  code: { value: null, matchMode: FilterMatchMode.CONTAINS },
  inventoryStatus: { value: null, matchMode: FilterMatchMode.STARTS_WITH } */
};

const loading = ref(true);
const stats = ref();
const dt = ref();
const totalRecords = ref(0);
const searchTerm = ref('');
const no_respuesta = ref(false);
const first = ref(0);
const rows = ref(25);

const loadData = async () => {
  loading.value = true;

  const data = getParamsData(lazyParams.value) as any;

  if (searchTerm.value) {
    data.keyword = searchTerm.value;
  }

  if (no_respuesta.value) {
    data.no_respuesta = true;
  }

  console.log('DATA', data);
  const response = await statsService.getChats(data);
  if (checkLogged(response)) {
    // stats.value = response?.data?.value?.list;
    const mappedData = response?.data?.value?.list?.map((item: any) => {
      try {
        item.response = JSON.parse(item.response);
        item.response.langs = getChatLanguages(item.response);
      } catch (error) {
        item.response = {};
      }

      return item;
    });
    stats.value = mappedData || [];
    console.log('STATS', stats.value);
    totalRecords.value = response?.data?.value?.total || 0;
  } else {
    stats.value = [];
    totalRecords.value = 0;
  }
  loading.value = false;
};

const dialog = useDialog();

const exportFunction = async (data: any) => {
  if (no_respuesta.value) {
    data.no_respuesta = true;
  }
  return await statsService.exportChats(data);
};

const exportData = async () => {
  await exportDataGeneric(t('Exportando datos chat'), exportFunction);
};

const onPage = (event: any) => {
  first.value = event.first;
  rows.value = event.rows;
  // Actualizar lazyParams con la información de paginación
  lazyParams.value.first = event.first;
  lazyParams.value.rows = event.rows;
  lazyParams.value.page = Math.floor(event.first / event.rows);
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

const onRowDoubleClick = (event: any) => {
  showChat(dialog, event.data.id);
};

onMounted(() => {
  resetLazyParams(rows.value, filters.value);
  // Sincronizar first y rows con lazyParams después de reset
  first.value = lazyParams.value.first;
  rows.value = lazyParams.value.rows;
  loadData();
});
</script>

<template>
  <div class="min-h-screen p-4" style="background-color: var(--surface-ground);">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
      <div class="mb-4 lg:mb-0">
        <h2 class="text-2xl font-bold mb-2" style="color: var(--text-color);">
          <i class="pi pi-comments mr-2" style="color: var(--primary-color);"></i>
          {{ t('Consultas Pregúntame') }}
        </h2>
        <p class="text-sm" style="color: var(--text-color-secondary);">{{ t('Doble clic en una ficha para ver detalles') }}</p>
      </div>
      <div class="flex gap-2">
        <Button
          icon="pi pi-refresh"
          :label="t('Refrescar')"
          class="p-button-outlined p-button-secondary"
          @click="loadData()"
        />
        <Button 
          icon="pi pi-file-excel" 
          :label="t('Exportar')"
          class="p-button-success" 
          @click="exportData()" 
        />
      </div>
    </div>
    <div class="grid grid-cols-12 p-1">
      <div class="col-span-12">
        <DataView ref="dt" :value="stats" layout="grid" :paginator="true" :rows="rows" :first="first" :total-records="totalRecords"
          paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          paginator-position="both" :rows-per-page-options="[24, 48, 96]"
          :current-page-report-template="t('show-per-page')" :loading="loading" @page="onPage($event)">
          <template #header>
            <div class="flex flex-wrap justify-between items-center gap-4 p-4 border-b mb-4" style="background-color: var(--surface-card); border-color: var(--surface-border);">
              <div class="flex items-center gap-2">
                <i class="pi pi-th-large" style="color: var(--primary-color);"></i>
                <span class="font-semibold" style="color: var(--text-color);">{{ t('Lista de Preguntas') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm" style="color: var(--text-color-secondary);">{{ formatIntNumber(totalRecords) }} {{ t('registros') }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center justify-center">
                <label class="mr-2" style="color: var(--text-color);" for="switch1">{{ t('SIN RESPUESTA') }}</label>
                <ToggleSwitch v-model="no_respuesta" id="switch1" @change="loadData()" />
              </div>
              <div class="flex items-center gap-2">
                <Button type="button" icon="pi pi-filter-slash" class="p-button-outlined"
                  @click="searchTerm = ''; loadData()" />
                <IconField iconPosition="left">
                  <InputIcon class="pi pi-search"> </InputIcon>
                  <InputText v-model="searchTerm" :placeholder="t('Búsqueda')" @keydown.enter="onFilter" />
                </IconField>
              </div>
            </div>
          </template>
          <template #empty>
            <div class="text-center p-8">
              <i class="pi pi-inbox text-4xl mb-4" style="color: var(--text-color-secondary);"></i>
              <p style="color: var(--text-color-secondary);">{{ t('No se han encontrado datos.') }}</p>
            </div>
          </template>
          <template #grid="slotProps">
            <div v-if="stats && stats.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
              <Card v-for="(item, index) in stats" :key="item.id || `item-${index}`" 
                :class="[
                  'cursor-pointer transition-all hover:shadow-lg border-1',
                  !item.hayrespuesta ? 'no-response-card' : ''
                ]"
                :style="!item.hayrespuesta ? {
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  borderColor: 'rgba(255, 152, 0, 0.3)',
                  borderLeftWidth: '4px',
                  borderLeftColor: 'rgb(255, 152, 0)'
                } : {
                  backgroundColor: 'var(--surface-card)',
                  borderColor: 'var(--surface-border)'
                }"
                @dblclick="showChat(dialog, item.id)">
                <template #content>
                  <div class="flex flex-col gap-3">
                    <!-- Header con ID y acciones -->
                    <div class="flex justify-between items-center border-b pb-2" style="border-color: var(--surface-border);">
                      <div class="flex items-center gap-2">
                        <span class="font-semibold text-xs px-2 py-1 rounded" style="background-color: var(--surface-hover); color: var(--text-color-secondary);">#{{ item.id }}</span>
                        <Button 
                          icon="pi pi-eye" 
                          class="p-button-text p-button-sm"
                          v-tooltip.top="t('Ver detalle')"
                          @click.stop="showChat(dialog, item.id)" />
                      </div>
                      <div class="flex items-center gap-2">
                        <span v-html="formatLike(item.like)" class="text-lg" />
                        <span v-html="formatRespuestaSiNo(item.hayrespuesta)" class="text-sm" />
                      </div>
                    </div>

                    <!-- Pregunta - DESTACADA -->
                    <div class="flex flex-col gap-2 -mx-2 px-4 py-4 rounded-lg cursor-pointer transition-all hover:shadow-lg question-highlight"
                      @click.stop="showChat(dialog, item.id)">
                      <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-question-circle text-base" style="color: var(--primary-color);"></i>
                        <span class="text-xs font-bold uppercase tracking-wide" style="color: var(--primary-color);">{{ t('Pregunta') }}</span>
                      </div>
                      <p class="text-base font-semibold leading-relaxed mb-0" 
                        style="color: var(--text-color); line-height: 1.6;">
                        {{ item.query }}
                      </p>
                    </div>

                    <!-- Usuario y Colección -->
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <NuxtLink :to="'/users/' + item.user"
                        class="inline-flex items-center font-medium transition-colors text-sm hover:underline"
                        style="color: var(--primary-color);"
                        @click.stop>
                        <i class="pi pi-user mr-1"></i>
                        {{ item.user }}
                      </NuxtLink>
                      <span
                        class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md"
                        style="background-color: var(--highlight-bg); color: var(--text-color);">
                        <i class="pi pi-folder mr-1"></i>
                        {{ item.collection }}
                      </span>
                    </div>

                    <!-- Fecha y Métricas compactas -->
                    <div class="flex items-center justify-between gap-2 pt-2 border-t" style="border-color: var(--surface-border);">
                      <div class="flex flex-col">
                        <span class="text-xs font-medium" style="color: var(--text-color);">{{ formatDateTime(item.date) }}</span>
                        <span class="text-xs" style="color: var(--text-color-secondary);">{{ new Date(item.date).toLocaleDateString() }}</span>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class="flex flex-col items-center">
                          <i class="pi pi-clock text-green-500 text-xs"></i>
                          <span class="text-xs font-medium text-green-600">{{ item.time }}s</span>
                        </div>
                        <div class="flex flex-col items-center">
                          <i class="pi pi-arrow-right text-blue-500 text-xs"></i>
                          <span class="text-xs font-medium text-blue-600">{{ formatIntNumber(item.prompt_tokens) }}</span>
                        </div>
                        <div class="flex flex-col items-center">
                          <i class="pi pi-arrow-left text-purple-500 text-xs"></i>
                          <span class="text-xs font-medium text-purple-600">{{ formatIntNumber(item.completion_tokens) }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Idioma y Traducciones -->
                    <div v-if="item.response && (item.response?.idioma || (item.response.langs && item.response.langs.length > 0))" class="flex flex-wrap gap-1.5 pt-2 border-t" style="border-color: var(--surface-border);">
                      <span v-if="item.response?.idioma" 
                        class="inline-flex items-center px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
                        <i class="pi pi-globe mr-1"></i>
                        {{ item.response.idioma }}
                      </span>
                      <span v-for="(translation, idx) in item.response.langs" :key="idx"
                        class="inline-flex items-center px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full shadow-sm">
                        <i class="pi pi-language mr-1"></i>
                        {{ translation }}
                      </span>
                    </div>

                    <!-- Enlace y Clicks -->
                    <div v-if="item.code || item.counter" class="flex items-center justify-between gap-2 pt-2 border-t" style="border-color: var(--surface-border);">
                      <div v-if="item.code" class="flex justify-start">
                        <ChatLink :code="item.code" :link="item.short_url" />
                      </div>
                      <div v-if="item.counter" class="flex items-center">
                        <span class="inline-flex items-center px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
                          <i class="pi pi-mouse-pointer mr-1"></i>
                          {{ formatIntNumber(item.counter) }} {{ t('clicks') }}
                        </span>
                      </div>
                    </div>

                    <!-- Clasificación -->
                    <div v-if="item.response?.clasificacion" class="flex flex-wrap items-center gap-2 pt-2 border-t" style="border-color: var(--surface-border);">
                      <span class="text-xs font-semibold" style="color: var(--text-color-secondary);">{{ t('Clasificación') }}:</span>
                      <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md"
                        style="background-color: var(--highlight-bg); color: var(--text-color);">
                        <i class="pi pi-tag mr-1"></i>
                        {{ item.response.clasificacion }}
                      </span>
                      <span v-if="item.response.porcentaje_asignacion !== undefined && item.response.porcentaje_asignacion !== null"
                        class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md"
                        style="background-color: var(--highlight-bg); color: var(--text-color);">
                        {{ item.response.porcentaje_asignacion }}%
                      </span>
                    </div>

                    <!-- Configuración RAG -->
                    <div v-if="item.response?.model" class="flex flex-wrap items-center gap-2 pt-2 border-t" style="border-color: var(--surface-border);">
                      <span class="text-xs font-semibold" style="color: var(--text-color-secondary);">{{ t('RAG') }}:</span>
                      <span v-if="item.response.model" class="inline-flex items-center gap-1 text-xs">
                        <i class="pi pi-cog" style="color: var(--text-color-secondary);"></i>
                        <span class="font-mono px-1.5 py-0.5 rounded" style="background-color: var(--surface-hover); color: var(--text-color);">
                          {{ item.response.model }}
                        </span>
                      </span>
                      <span v-if="item.response.temperature !== undefined && item.response.temperature !== null" class="inline-flex items-center gap-1 text-xs">
                        <i class="pi pi-gauge text-orange-500"></i>
                        <span style="color: var(--text-color);">{{ item.response.temperature }}</span>
                      </span>
                    </div>

                    <!-- ¿Sabías? -->
                    <div v-if="item.response?.sabias" class="flex justify-center pt-2 border-t" style="border-color: var(--surface-border);">
                      <span v-html="formatSabias(item.response.sabias)" class="text-sm" />
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </template>
        </DataView>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mejoras para las Cards */
:deep(.p-card) {
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.p-card:hover) {
  transform: translateY(-2px);
}

:deep(.p-card-body) {
  padding: 1.25rem;
}

:deep(.p-card-content) {
  padding: 0;
}

/* Grid responsive para las Cards */
.grid {
  display: grid;
}

/* Responsive improvements */
@media (max-width: 768px) {
  :deep(.p-dataview) {
    font-size: 0.875rem;
  }

  :deep(.p-card-body) {
    padding: 1rem;
  }
}

/* Animaciones suaves */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Estilos para los badges dentro de las Cards */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Estilos para cards sin respuesta */
.no-response-card {
  position: relative;
}

.no-response-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, rgba(255, 152, 0, 0.8) 0%, rgba(255, 152, 0, 0.4) 100%);
  border-radius: 3px 3px 0 0;
}

/* Modo oscuro para cards sin respuesta */
@media (prefers-color-scheme: dark) {
  .no-response-card {
    background-color: rgba(255, 152, 0, 0.15) !important;
    border-color: rgba(255, 152, 0, 0.4) !important;
  }
}

/* Estilos para destacar la pregunta */
.question-highlight {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.06) 100%);
  border-left: 4px solid var(--primary-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  position: relative;
}

.question-highlight::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%);
  border-radius: 8px;
  pointer-events: none;
}

.question-highlight:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0.1) 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

/* Modo oscuro para la pregunta */
@media (prefers-color-scheme: dark) {
  .question-highlight {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  }
  
  .question-highlight:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  }
}
</style>
