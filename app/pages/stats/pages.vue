<script setup lang="ts">
import { FilterMatchMode, FilterOperator } from '~/utils/primevue';
import StatsService from '~/services/statsService';

const { filters } = usePrimeDataTable() as { filters: any };
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

  const response = await statsService.getPages(data);
  if (checkLogged(response)) {
    stats.value = response?.data?.value?.list;
    totalRecords.value = response?.data?.value?.total;
  }
  loading.value = false;
};

const exportFunction = async (data: any) => {
  return await statsService.exportPages(data);
};

const exportData = async () => {
  await exportDataGeneric(t('Exportando datos sesiones'), exportFunction);
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
  resetLazyParams(dt.value.rows, filters.value);
  loadData();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
    <!-- Header mejorado con estadísticas -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
      <div class="mb-4 lg:mb-0">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          <i class="pi pi-file-o mr-2 text-blue-500"></i>
          {{ t('Páginas') }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('Estadísticas de visualización de páginas') }}
        </p>
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

    <div class="grid grid-cols-12">
      <div class="col-span-12">
        <DataTable ref="dt" v-model:filters="filters" :value="stats" :paginator="true" :rows="25" :lazy="true"
          :total-records="totalRecords" filter-display="menu"
          paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          paginatorPosition="both" :rows-per-page-options="[25, 50, 100]" responsive-layout="scroll" data-key="id"
          striped-rows sort-mode="multiple" show-gridlines :loading="loading"
          :global-filter-fields="['user', 'title', 'collection']" :current-page-report-template="t('show-per-page')"
          class="p-datatable-sm" @page="onPage($event)" @sort="onSort($event)" @filter="onFilter($event)">
          <!-- Header con acciones mejoradas -->
          <template #header>
            <div class="flex flex-wrap justify-between items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-2">
                <i class="pi pi-table text-blue-500"></i>
                <span class="font-semibold text-gray-700">{{ t('Lista de Páginas') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">{{ formatIntNumber(totalRecords) }} {{ t('registros') }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center mt-2">
                <div class="flex items-center gap-2">
                  <Button type="button" icon="pi pi-filter-slash" class="p-button-outlined"
                    @click="clearFilter()" />
                  <IconField iconPosition="left">
                    <InputIcon class="pi pi-search"> </InputIcon>
                    <InputText v-model="filters.global.value" :placeholder="t('Búsqueda')" @keydown.enter="onFilter" />
                  </IconField>
                </div>
              </div>
          </template>

          <!-- Estados de carga y vacío mejorados -->
          <template #empty>
            <div class="text-center py-8">
              <i class="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
              <p class="text-gray-600 dark:text-gray-400">{{ t('No se han encontrado datos.') }}</p>
            </div>
          </template>

          <template #loading>
            <div class="text-center py-8">
              <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4"></i>
              <p class="text-gray-600 dark:text-gray-400">{{ t('Cargando datos...') }}</p>
            </div>
          </template>

          <!-- Columna Usuario mejorada -->
          <Column field="user" :header="t('Usuario')" :sortable="true" :style="{ minWidth: '120px' }">
            <template #filter="{ filterModel, filterCallback }">
              <InputText v-model="filterModel.value" v-tooltip.top.focus="t('Pulsa ENTER para aplicar')" type="text"
                class="p-column-filter" :placeholder="t('busqueda-nombre')" @keydown.enter="filterCallback()" />
            </template>
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <i class="pi pi-user text-gray-400"></i>
                <NuxtLink :to="'/users/' + slotProps.data.user"
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200">
                  {{ slotProps.data.user }}
                </NuxtLink>
              </div>
            </template>
          </Column>

          <!-- Columna Tipo mejorada -->
          <Column field="type" :header="t('Tipo')" :sortable="true" :style="{ minWidth: '100px' }">
            <template #body="slotProps">
              <Tag :severity="formatPageType(slotProps.data.type)" :value="slotProps.data.type" class="font-medium" />
            </template>
          </Column>

          <!-- Columna Colección mejorada -->
          <Column field="collection" :header="t('Colección')" :sortable="true" :style="{ minWidth: '120px' }">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <i class="pi pi-folder text-yellow-500"></i>
                <span class="text-yellow-700 dark:text-yellow-400 font-medium">
                  {{ slotProps.data.collection }}
                </span>
              </div>
            </template>
          </Column>

          <!-- Columna Título mejorada -->
          <Column field="title" :header="t('Título')" :sortable="true" :style="{ minWidth: '200px' }">
            <template #body="slotProps">
              <PageLink :page="slotProps.data" />
            </template>
          </Column>

          <!-- Columna Fecha mejorada -->
          <Column field="date" :header="t('Fecha')" :sortable="true" :style="{ minWidth: '140px' }">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <i class="pi pi-calendar text-gray-500"></i>
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  {{ formatDateTime(slotProps.data.date) }}
                </span>
              </div>
            </template>
          </Column>

          <!-- Columna Cache mejorada -->
          <Column field="cached" :header="t('Cache')" :sortable="true" class="text-center"
            :style="{ minWidth: '80px' }">
            <template #body="slotProps">
              <div class="flex justify-center">
                <Tag v-if="slotProps.data.cached" severity="success" :value="t('Sí')" icon="pi pi-check" />
                <Tag v-else severity="secondary" :value="t('No')" icon="pi pi-times" />
              </div>
            </template>
          </Column>

          <!-- Columna País mejorada -->
          <Column field="glc_country_name" :header="t('País')" :sortable="true" :style="{ minWidth: '100px' }">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <span v-if="slotProps.data.glc_country_name">
                  <i class="pi pi-globe text-green-500"></i>
                  <span class="text-green-700 dark:text-green-400 text-sm font-medium">
                    {{ slotProps.data.glc_country_name }}
                  </span>
                </span>
                <span v-else>
                  <i class="pi pi-globe text-gray-500"></i> -
                </span>
              </div>
            </template>
          </Column>

          <!-- Columna Región mejorada -->
          <Column field="glc_city" :header="t('Región')" :sortable="true" :style="{ minWidth: '100px' }">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <span v-if="slotProps.data.glc_city">
                  <i class="pi pi-map-marker text-blue-500"></i>
                  <span class="text-blue-700 dark:text-blue-400 text-sm font-medium">
                    {{ slotProps.data.glc_city }}
                  </span>
                </span>
                <span v-else>
                  <i class="pi pi-globe text-gray-500"></i> -
                </span>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>
