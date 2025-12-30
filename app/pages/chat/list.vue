<script setup lang='ts'>
// import { FilterMatchMode, FilterOperator } from 'primevue/api';
import ChatLink from '@/components/ChatLink.vue';
import StatsService from '@/services/statsService';
import { showChat } from '@/utils/page';

import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

useAuthGuard();

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

const loadData = async () => {
  loading.value = true;

  const data = getParamsData(lazyParams.value) as any;

  if (searchTerm.value) {
    data.keyword = searchTerm.value;
  }

  if (no_respuesta.value) {
    data.no_respuesta = true;
  }

  const response = await statsService.getChats(data);
  if (checkLogged(response)) {
    // stats.value = response?.data?.value?.list;
    stats.value = response?.data?.value?.list?.map((item: any) => {
      try {
        item.response = JSON.parse(item.response);
        item.response.langs = getChatLanguages(item.response);
      } catch (error) {
        item.response = {};
      }

      return item;
    });
    totalRecords.value = response?.data?.value?.total;
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

const onRowDoubleClick = (event: any) => {
  showChat(dialog, event.data.id);
};

onMounted(() => {
  resetLazyParams(dt.value.rows, filters.value);
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
        <p class="text-sm" style="color: var(--text-color-secondary);">{{ t('Doble clic en una fila para ver detalles') }}</p>
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
      <div class="col-span-12 overflow-x-auto">
        <DataTable ref="dt" v-model:filters="filters" :value="stats" :paginator="true" :rows="25" :lazy="true"
          :total-records="totalRecords" filter-display="menu"
          paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          paginator-position="both" :rows-per-page-options="[25, 50, 100]" responsive-layout="scroll" data-key="id"
          striped-rows sort-mode="multiple" show-gridlines :loading="loading" :global-filter-fields="['user']"
          :current-page-report-template="t('show-per-page')" class="p-datatable-sm" @page="onPage($event)"
          @sort="onSort($event)" @filter="onFilter($event)" @row-dblclick="onRowDoubleClick($event)">
          <template #header>
            <div class="flex flex-wrap justify-between items-center gap-4 p-4 border-b" style="background-color: var(--surface-card); border-color: var(--surface-border);">
              <div class="flex items-center gap-2">
                <i class="pi pi-table" style="color: var(--primary-color);"></i>
                <span class="font-semibold" style="color: var(--text-color);">{{ t('Lista de Preguntas') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm" style="color: var(--text-color-secondary);">{{ formatIntNumber(totalRecords) }} {{ t('registros') }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center mt-2">
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
            {{ t('No se han encontrado datos.') }}
          </template>
          <template #loading>
            {{ t('Cargando datos..') }} <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
          </template>
          <Column field="id" header="#" :sortable="true" class="text-center">
            <template #body="slotProps">
              <a class="flex items-start cursor-pointer p-2 rounded transition-colors" style="background-color: var(--surface-hover);"
                @click="showChat(dialog, slotProps.data.id)">
                <i class="pi pi-eye mr-2 mt-0.5 flex-shrink-0" style="color: var(--primary-color);" v-tooltip.top="t('Ver detalle')"></i> </a>
            </template>
          </Column>
          <Column field="user" :header="t('Usuario')" :sortable="true">
            <template #filter="{ filterModel, filterCallback }">
              <InputText v-model="filterModel.value" v-tooltip.top.focus="t('Pulsa ENTER para aplicar')" type="text"
                class="p-column-filter" :placeholder="t('busqueda-nombre')" @keydown.enter="filterCallback()" />
            </template>
            <template #body="slotProps">
              <NuxtLink :to="'/users/' + slotProps.data.user"
                class="inline-flex items-center font-medium transition-colors"
                style="color: var(--primary-color);">
                <i class="pi pi-user mr-1 text-xs"></i>
                {{ slotProps.data.user }}
              </NuxtLink>
            </template>
          </Column>
          <Column field="collection" :header="t('Colección')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <span
                class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md"
                style="background-color: var(--highlight-bg); color: var(--text-color); padding: 0.25rem 0.5rem;">
                <i class="pi pi-folder mr-1"></i>
                {{ slotProps.data.collection }}
              </span>
            </template>
          </Column>
          <Column field="query" :header="t('Pregunta')" :sortable="true">
            <template #body="slotProps">
              <a class="flex items-start cursor-pointer p-2 rounded transition-colors" style="background-color: var(--surface-hover);"
                @click="showChat(dialog, slotProps.data.id)">
                <span class="text-sm leading-relaxed" style="color: var(--text-color);">{{ slotProps.data.query }}</span>
              </a>
            </template>
          </Column>
          <Column field="date" :header="t('Fecha')" :sortable="true">
            <template #body="slotProps">
              <div class="flex flex-col">
                <span class="text-xs" style="color: var(--text-color);">{{ formatDateTime(slotProps.data.date) }}</span>
                <span class="text-xs" style="color: var(--text-color-secondary);">{{ new Date(slotProps.data.date).toLocaleDateString() }}</span>
              </div>
            </template>
          </Column>
          <Column field="like" :header="t('Like')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <div class="flex justify-center">
                <span v-html="formatLike(slotProps.data.like)" class="text-lg" />
              </div>
            </template>
          </Column>
          <Column field="hayrespuesta" :header="t('¿Respuesta?')" :sortable="false" class="text-center">
            <template #body="slotProps">
              <div class="flex justify-center">
                <span v-html="formatRespuestaSiNo(slotProps.data.hayrespuesta)" class="text-sm" />
              </div>
            </template>
          </Column>
          <Column field="sabias" :header="t('¿Sabías?')" :sortable="false" class="text-center">
            <template #body="slotProps">
              <div class="flex justify-center">
                <span v-html="formatSabias(slotProps.data.response?.sabias)" class="text-sm" />
              </div>
            </template>
          </Column>
          <Column field="response" :header="t('Idioma y Traducciones')" :sortable="false" class="text-center" style="min-width: 150px;">
            <template #body="slotProps">
              <div v-if="slotProps.data.response" class="flex flex-col gap-2 items-center">
                <!-- Idioma -->
                <div v-if="slotProps.data.response?.idioma" class="flex justify-center">
                  <span class="inline-flex items-center px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
                    <i class="pi pi-globe mr-1"></i>
                    {{ slotProps.data.response.idioma }}
                  </span>
                </div>
                
                <!-- Traducciones -->
                <div v-if="slotProps.data.response?.langs && slotProps.data.response.langs.length > 0" class="flex flex-wrap justify-center gap-1">
                  <span v-for="(translation, index) in slotProps.data.response.langs" :key="index"
                    class="inline-flex items-center px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full shadow-sm">
                    <i class="pi pi-language mr-1"></i>
                    {{ translation }}
                  </span>
                </div>
              </div>
            </template>
          </Column>
          <Column field="link" :header="t('Enlace y Clicks')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <div class="flex flex-col gap-2 items-center">
                <!-- Enlace -->
                <div class="flex justify-center">
                  <ChatLink v-show="slotProps.data.code" :code="slotProps.data.code" :link="slotProps.data.short_url" />
                </div>
                
                <!-- Clicks -->
                <div v-if="slotProps.data.counter" class="flex items-center justify-center">
                  <span class="inline-flex items-center px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
                    <i class="pi pi-mouse-pointer mr-1"></i>
                    {{ formatIntNumber(slotProps.data.counter) }}
                  </span>
                </div>
              </div>
            </template>
          </Column>

          <Column field="time" :header="t('Tiempo')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <div class="flex items-center justify-center">
                <i class="pi pi-clock mr-1 text-green-500"></i>
                <span class="text-sm font-medium text-green-600">{{ slotProps.data.time }}s</span>
              </div>
            </template>
          </Column>
          <Column field="prompt_tokens" :header="t('TK.In')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <div class="flex items-center justify-center">
                <i class="pi pi-arrow-right mr-1 text-blue-500"></i>
                <span class="text-sm font-medium text-blue-600">{{ formatIntNumber(slotProps.data.prompt_tokens)
                  }}</span>
              </div>
            </template>
          </Column>
          <Column field="completion_tokens" :header="t('TK.Out')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <div class="flex items-center justify-center">
                <i class="pi pi-arrow-left mr-1 text-purple-500"></i>
                <span class="text-sm font-medium text-purple-600">{{ formatIntNumber(slotProps.data.completion_tokens)
                  }}</span>
              </div>
            </template>
          </Column>
          <Column field="response.clasificacion" :header="t('Clasificación')" :sortable="true" style="min-width: 250px;">
            <template #body="slotProps">
              <div v-if="slotProps.data.response" class="flex flex-col gap-2">
                <!-- Clasificación -->
                <div v-if="slotProps.data.response.clasificacion" class="flex items-center gap-2">
                  <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md"
                    style="background-color: var(--highlight-bg); color: var(--text-color); padding: 0.25rem 0.5rem;">
                    <i class="pi pi-tag mr-1"></i>
                    <strong>{{ t('Clasificación') }}:</strong> {{ slotProps.data.response.clasificacion }}
                  </span>
                </div>
                
                <!-- Porcentaje de asignación -->
                <div v-if="slotProps.data.response.porcentaje_asignacion !== undefined && slotProps.data.response.porcentaje_asignacion !== null" class="flex items-center gap-2">
                  <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md"
                    style="background-color: var(--highlight-bg); color: var(--text-color);">                    
                    {{ slotProps.data.response.porcentaje_asignacion }}%
                  </span>
                </div>
                
                <!-- Razonamiento breve -->
                <!--
                <div v-if="slotProps.data.response.razonamiento_breve" class="flex items-start gap-2">
                  <div class="flex-1">
                    <span class="text-xs text-gray-500 font-semibold block mb-1">{{ t('Razonamiento') }}:</span>
                    <span class="text-xs text-gray-700 line-clamp-3" v-tooltip.top="slotProps.data.response.razonamiento_breve">
                      {{ slotProps.data.response.razonamiento_breve }}
                    </span>
                  </div>
                </div>
                -->
                <!-- Clasificación Top3 -->
                <!--
                <div v-if="slotProps.data.response.clasificacion_top3 && slotProps.data.response.clasificacion_top3.length > 0" class="flex flex-col gap-1">
                  <span class="text-xs text-gray-500 font-semibold">{{ t('Top 3') }}:</span>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="(item, index) in slotProps.data.response.clasificacion_top3" :key="index"
                      class="inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                      <i class="pi pi-circle-fill mr-1" :style="{ fontSize: '0.5rem' }"></i>
                      {{ item.categoria }} ({{ item.porcentaje }}%)
                    </span>
                  </div>
                </div>
                -->
              </div>
            </template>
          </Column>
          <Column field="response.model" :header="t('Configuración RAG')" :sortable="true" style="min-width: 250px;">
            <template #body="slotProps">
              <div v-if="slotProps.data.response" class="flex flex-col gap-1.5 text-xs">
                <!-- Modelo -->
                <div v-if="slotProps.data.response.model" class="flex items-center gap-2">
                  <i class="pi pi-cog" style="color: var(--text-color-secondary);"></i>
                  <span class="font-semibold" style="color: var(--text-color-secondary);">Model:</span>
                  <span class="font-mono px-1.5 py-0.5 rounded" style="background-color: var(--surface-hover); color: var(--text-color);">{{ slotProps.data.response.model }}</span>
                </div>
                
                <!-- Temperature -->
                <div v-if="slotProps.data.response.temperature !== undefined && slotProps.data.response.temperature !== null" class="flex items-center gap-2">
                  <i class="pi pi-gauge text-orange-500"></i>
                  <span class="font-semibold" style="color: var(--text-color-secondary);">Temperature:</span>
                  <span style="color: var(--text-color);">{{ slotProps.data.response.temperature }}</span>
                </div>
                
                <!-- Semantic -->
                <!--
                <div v-if="slotProps.data.response.semantic !== undefined" class="flex items-center gap-2">
                  <i :class="slotProps.data.response.semantic ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'"></i>
                  <span class="font-semibold text-gray-600">Semantic:</span>
                  <span :class="slotProps.data.response.semantic ? 'text-green-600' : 'text-red-600'">
                    {{ slotProps.data.response.semantic ? 'Sí' : 'No' }}
                  </span>
                </div>
                -->    
                <!-- BM25 -->
                <!--
                <div v-if="slotProps.data.response.bm25 !== undefined" class="flex items-center gap-2">
                  <i :class="slotProps.data.response.bm25 ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'"></i>
                  <span class="font-semibold text-gray-600">BM25:</span>
                  <span :class="slotProps.data.response.bm25 ? 'text-green-600' : 'text-red-600'">
                    {{ slotProps.data.response.bm25 ? 'Sí' : 'No' }}
                  </span>
                </div>
                -->    
                <!-- TopN -->
                <!--
                <div v-if="slotProps.data.response.topN !== undefined && slotProps.data.response.topN !== null" class="flex items-center gap-2">
                  <i class="pi pi-sort-numeric-up text-blue-500"></i>
                  <span class="font-semibold text-gray-600">TopN:</span>
                  <span class="text-gray-800">{{ slotProps.data.response.topN }}</span>
                </div>
                -->  
                <!-- Context -->
                <!--
                <div v-if="slotProps.data.response.context !== undefined" class="flex items-center gap-2">
                  <i :class="slotProps.data.response.context ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'"></i>
                  <span class="font-semibold text-gray-600">Context:</span>
                  <span :class="slotProps.data.response.context ? 'text-green-600' : 'text-red-600'">
                    {{ slotProps.data.response.context ? 'Sí' : 'No' }}
                  </span>
                </div>
                -->  
                <!-- Num Queries -->
                <!--
                <div v-if="slotProps.data.response.num_queries !== undefined && slotProps.data.response.num_queries !== null" class="flex items-center gap-2">
                  <i class="pi pi-list text-purple-500"></i>
                  <span class="font-semibold text-gray-600">Num Queries:</span>
                  <span class="text-gray-800">{{ slotProps.data.response.num_queries }}</span>
                </div>
                -->  
                <!-- Filter -->
                <!--
                <div v-if="slotProps.data.response.filter !== undefined && slotProps.data.response.filter !== null" class="flex items-center gap-2">
                  <i class="pi pi-filter text-gray-500"></i>
                  <span class="font-semibold text-gray-600">Filter:</span>
                  <span class="text-gray-800 font-mono">{{ slotProps.data.response.filter }}</span>
                </div>
                -->  
                <!-- Min Count -->
                <!--
                <div v-if="slotProps.data.response.min_count !== undefined && slotProps.data.response.min_count !== null" class="flex items-center gap-2">
                  <i class="pi pi-sort-amount-down text-gray-500"></i>
                  <span class="font-semibold text-gray-600">Min Count:</span>
                  <span class="text-gray-800">{{ slotProps.data.response.min_count }}</span>
                </div>
                -->  
                <!-- Use Docs -->
                <!--
                <div v-if="slotProps.data.response.use_docs !== undefined && slotProps.data.response.use_docs !== null" class="flex items-center gap-2">
                  <i class="pi pi-file text-gray-500"></i>
                  <span class="font-semibold text-gray-600">Use Docs:</span>
                  <span class="text-gray-800">{{ slotProps.data.response.use_docs }}</span>
                </div>
                -->  
                <!-- Index -->
                <!--
                <div v-if="slotProps.data.response.index" class="flex items-center gap-2">
                  <i class="pi pi-database text-gray-500"></i>
                  <span class="font-semibold text-gray-600">Index:</span>
                  <span class="text-gray-800 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{{ slotProps.data.response.index }}</span>
                </div>
                -->  
                <!-- Clean Query -->
                <!--
                <div v-if="slotProps.data.response.clean_query !== undefined" class="flex items-center gap-2">
                  <i :class="slotProps.data.response.clean_query ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'"></i>
                  <span class="font-semibold text-gray-600">Clean Query:</span>
                  <span :class="slotProps.data.response.clean_query ? 'text-green-600' : 'text-red-600'">
                    {{ slotProps.data.response.clean_query ? 'Sí' : 'No' }}
                  </span>
                </div>
                -->  
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mejoras para los badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Responsive improvements */
@media (max-width: 768px) {
  :deep(.p-datatable) {
    font-size: 0.75rem;
  }

  :deep(.p-datatable-tbody > tr > td) {
    padding: 0.5rem 0.25rem;
  }

  :deep(.p-datatable-thead > tr > th) {
    padding: 0.5rem 0.25rem;
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
</style>
