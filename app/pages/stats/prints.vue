<script setup  lang="ts">
// import { FilterMatchMode, FilterOperator } from 'primevue/api';
import StatsService from '~/services/statsService';

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

const clearFilter = () => {
  initFilters();
};

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    user: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
  };
};

const loading = ref(true);
const stats = ref();
const dt = ref();
const totalRecords = ref(0);

const loadData = async () => {
  loading.value = true;

  const data = getParamsData(lazyParams.value);

  const response = await statsService.getPrints(data);
  if (checkLogged(response)) {
    stats.value = response?.data?.value?.list;
    totalRecords.value = response?.data?.value?.total;
  }
  loading.value = false;
};

const exportFunction = async (data: any) => {
  return await statsService.exportPrints(data);
};

const exportData = async () => {
  await exportDataGeneric(t('Exportando datos sesiones'), exportFunction);
};

const onPage = (event: any) => {
  console.log('onPage', event);
  lazyParams.value = event;
  console.log('onPage lazyParams', lazyParams.value);
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
  resetLazyParams(dt.value.rows, filters.value);
  loadData();
});
</script>

<template>
  <div class="card">
    <!-- Header mejorado -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ t('Impresiones') }}</h2>
        <p class="text-gray-600 text-sm">{{ t('Registro de páginas impresas por los usuarios') }}</p>
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

    <!-- Tabla mejorada -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
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
        paginatorPosition="both"
        :rows-per-page-options="[25, 50, 100]"
        responsive-layout="scroll"
        data-key="id"
        striped-rows
        sort-mode="multiple"
        show-gridlines
        :loading="loading"
        :global-filter-fields="['user', 'title', 'collection']"
        :current-page-report-template="t('show-per-page')"
        class="p-datatable-sm"
        @page="onPage($event)"
        @sort="onSort($event)"
        @filter="onFilter($event)"
      >
        <!-- Header de la tabla -->
        <template #header>
          <div class="flex flex-wrap justify-between items-center gap-4 p-4 bg-gray-50 border-b">
            <div class="flex items-center gap-2">
              <i class="pi pi-print text-blue-500"></i>
              <span class="font-semibold text-gray-700">{{ t('Lista de Impresiones') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">{{ totalRecords }} {{ t('registros') }}</span>
            </div>
          </div>
        </template>

        <!-- Estados de carga y vacío -->
        <template #empty>
          <div class="text-center py-8">
            <i class="pi pi-print text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 text-lg">{{ t('No se han encontrado datos.') }}</p>
          </div>
        </template>
        
        <template #loading>
          <div class="text-center py-8">
            <i class="pi pi-spin pi-spinner text-2xl text-blue-500 mb-2"></i>
            <p class="text-gray-600">{{ t('Cargando datos...') }}</p>
          </div>
        </template>

        <!-- Usuario -->
        <Column field="user" :header="t('Usuario')" :sortable="true" style="min-width: 120px">
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              v-tooltip.top.focus="t('Pulsa ENTER para aplicar')"
              type="text"
              class="p-column-filter"
              :placeholder="t('busqueda-nombre')"
              @keydown.enter="filterCallback()"
            />
          </template>
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <i class="pi pi-user text-gray-400"></i>
              <NuxtLink 
                :to="'/users/'+slotProps.data.user" 
                class="text-blue-600 hover:text-blue-800 font-medium no-underline hover:underline"
              >
                {{ slotProps.data.user }}
              </NuxtLink>
            </div>
          </template>
        </Column>

        <!-- Información del documento -->
        <Column :header="t('Documento')" :sortable="false" style="min-width: 300px">
          <template #body="slotProps">
            <div class="space-y-2">
              <!-- Título del documento -->
              <div class="flex items-start gap-2">
                <i class="pi pi-file text-gray-400 mt-1"></i>
                <div class="flex-1 min-w-0">
                  <PageLink :page="slotProps.data" />
                </div>
              </div>
              
              <!-- Tipo y colección -->
              <div class="flex items-center gap-2 flex-wrap">
                <div class="flex items-center gap-1">
                  <i class="pi pi-tag text-gray-400"></i>
                  <Tag 
                    :severity="formatPageType(slotProps.data.type)" 
                    :value="slotProps.data.type"
                    class="text-xs"
                  />
                </div>
                <div class="flex items-center gap-1">
                  <i class="pi pi-folder text-yellow-500"></i>
                  <span class="text-xs text-yellow-600 font-medium">{{ slotProps.data.collection }}</span>
                </div>
              </div>
            </div>
          </template>
        </Column>

        <!-- Fecha de impresión -->
        <Column field="date" :header="t('Fecha de Impresión')" :sortable="true" style="min-width: 150px">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <i class="pi pi-calendar text-gray-400"></i>
              <div class="text-sm">
                <div class="text-gray-700">{{ formatDateTime(slotProps.data.date) }}</div>
              </div>
            </div>
          </template>
        </Column>

        <!-- Ubicación -->
        <Column :header="t('Ubicación')" :sortable="false" style="min-width: 150px">
          <template #body="slotProps">
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-sm">
                <i class="pi pi-map-marker text-red-500"></i>
                <span class="text-gray-700">{{ slotProps.data.glc_country_name }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <i class="pi pi-building text-gray-400"></i>
                <span>{{ slotProps.data.glc_city }}</span>
              </div>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
