<script setup lang='ts'>
// import { FilterMatchMode, FilterOperator } from 'primevue/api';
import ChatLink from '@/components/ChatLink.vue';
import StatsService from '@/services/statsService';
import { showChat } from '@/utils/page';

import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

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
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold text-gray-800">{{ t('Consultas Pregúntame') }}</h2>
      <div class="text-sm text-gray-500">
        <i class="pi pi-info-circle mr-1"></i>
        {{ t('Doble clic en una fila para ver detalles') }}
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
            <div class="flex justify-between items-center">
              <div class="left-0">
                <Button icon="pi pi-refresh" :label="t('Refrescar')" class="p-button-secondary" @click="loadData()" />
                <Button icon="pi pi-file-excel" class="p-button-success ml-2" @click="exportData()" />
              </div>
              <div class="flex items-center justify-center">
                <label class="mr-2" for="switch1">{{ t('SIN RESPUESTA') }}</label>
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
          <Column field="id" :header="t('#')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <a class="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                @click="showChat(dialog, slotProps.data.id)">
                <i class="pi pi-eye text-blue-500 mr-2 mt-0.5 flex-shrink-0" v-tooltip.top="t('Ver detalle')"></i> </a>
            </template>
          </Column>
          <Column field="user" :header="t('Usuario')" :sortable="true">
            <template #filter="{ filterModel, filterCallback }">
              <InputText v-model="filterModel.value" v-tooltip.top.focus="t('Pulsa ENTER para aplicar')" type="text"
                class="p-column-filter" :placeholder="t('busqueda-nombre')" @keydown.enter="filterCallback()" />
            </template>
            <template #body="slotProps">
              <NuxtLink :to="'/users/' + slotProps.data.user"
                class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors">
                <i class="pi pi-user mr-1 text-xs"></i>
                {{ slotProps.data.user }}
              </NuxtLink>
            </template>
          </Column>
          <Column field="collection" :header="t('Colección')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <span
                class="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-md">
                <i class="pi pi-folder mr-1"></i>
                {{ slotProps.data.collection }}
              </span>
            </template>
          </Column>
          <Column field="query" :header="t('Pregunta')" :sortable="true">
            <template #body="slotProps">
              <a class="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                @click="showChat(dialog, slotProps.data.id)">
                <span class="text-sm leading-relaxed">{{ slotProps.data.query }}</span>
              </a>
            </template>
          </Column>
          <Column field="date" :header="t('Fecha')" :sortable="true">
            <template #body="slotProps">
              <div class="flex flex-col">
                <span class="text-xs text-gray-600">{{ formatDateTime(slotProps.data.date) }}</span>
                <span class="text-xs text-gray-400">{{ new Date(slotProps.data.date).toLocaleDateString() }}</span>
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
          <Column field="response" :header="t('Idioma')" :sortable="false" class="text-center">
            <template #body="slotProps">
              <div class="flex justify-center">
                <span v-show="slotProps.data.response?.idioma"
                  class="inline-flex items-center px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
                  <i class="pi pi-globe mr-1"></i>
                  {{ slotProps.data.response?.idioma }}
                </span>
              </div>
            </template>
          </Column>
          <Column field="response" :header="t('Traducciones')" :sortable="false" class="text-center">
            <template #body="slotProps">
              <div class="flex flex-wrap justify-center gap-1">
                <span v-for="(translation, index) in slotProps.data.response?.langs" :key="index"
                  class="inline-flex items-center px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full shadow-sm">
                  <i class="pi pi-language mr-1"></i>
                  {{ translation }}
                </span>
              </div>
            </template>
          </Column>
          <Column field="model" :header="t('Modelo')" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center">
                <i class="pi pi-cog mr-2 text-gray-400"></i>
                <span class="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">{{
                  slotProps.data.response.model }}</span>
              </div>
            </template>
          </Column>
          <Column field="link" :header="t('Enlace')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <div class="flex justify-center">
                <ChatLink v-show="slotProps.data.code" :code="slotProps.data.code" :link="slotProps.data.short_url" />
              </div>
            </template>
          </Column>
          <Column field="counter" :header="t('Clicks')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <div class="flex items-center justify-center">
                <i class="pi pi-mouse-pointer mr-1 text-blue-500"></i>
                <span class="text-sm font-medium text-blue-600">{{ formatIntNumber(slotProps.data.counter) }}</span>
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
