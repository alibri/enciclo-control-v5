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
  const response = await statsService.getQueries(data);
  if (checkLogged(response)) {
    stats.value = response?.data?.value?.list;
    totalRecords.value = response?.data?.value?.total;
  }
  loading.value = false;
};

const exportFunction = async (data: any) => {
  return await statsService.exportQueries(data);
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
  <div class="card">
    <h2>{{ t('Consultas') }}</h2>
    <div class="grid p-1">
      <div class="col-12">
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
          :global-filter-fields="['user']"
          :current-page-report-template="t('show-per-page')"
          @page="onPage($event)"
          @sort="onSort($event)"
          @filter="onFilter($event)"
        >
          <template #header>
            <div class="flex flex-wrap gap-1">
              <div class="left-0">
                <Button
                  icon="pi pi-refresh"
                  :label="t('Refrescar')"
                  class="p-button-secondary"
                  @click="loadData()"
                />
                <Button icon="pi pi-file-excel" class="p-button-success ml-2" @click="exportData()" />
              </div>
            </div>
          </template>
          <template #empty>
            {{ t('No se han encontrado datos.') }}
          </template>
          <template #loading>
            {{ t('Cargando datos..') }}' <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
          </template>
          <Column field="user" :header="t('Usuario')" :sortable="true">
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
              <NuxtLink :to="'/users/'+slotProps.data.user" class="text-red-500 border-none border-bottom-1 border-dotted">
                {{ slotProps.data.user }}
              </NuxtLink>
            </template>
          </Column>
          <Column field="collections" :header="t('Colección')" :sortable="true" style="width: 15%" class="text-yellow-500" />
          <Column field="date" :header="t('Fecha')" :sortable="true" style="width: 15%">
            <template #body="slotProps">
              <span class="text-sm">{{ formatDateTime(slotProps.data.date) }}</span>
            </template>
          </Column>
          <Column field="term" header="Term" :sortable="true" class="font-bold" />
          <Column field="filter" header="Tipo" :sortable="true">
            <template #body="slotProps">
              <Tag v-if="slotProps.data.filter" severity="info">
                {{ slotProps.data.filter }}
              </Tag>
            </template>
          </Column>
          <Column field="order" header="Orden" :sortable="true">
            <template #body="slotProps">
              <Tag v-if="slotProps.data.order" severity="danger">
                {{ slotProps.data.order }}
              </Tag>
            </template>
          </Column>
          <Column field="from" header="De" :sortable="true" class="text-center text-sm" />
          <Column field="to" header="Hasta" :sortable="true" class="text-center text-sm" />
          <Column field="total" header="Total" :sortable="true" class="text-right text-sm ">
            <template #body="slotProps">
              {{ formatIntNumber(slotProps.data.total) }}
            </template>
          </Column>
          <Column field="cached" :header="t('Cache')" :sortable="true">
            <template #body="slotProps">
              <i
                :class="'pi ' + (slotProps.data.cached ? 'pi pi-check bg-green-500 text-xs text-white font-bold border-round m-2 p-2' : '')"
              />
            </template>
          </Column>
          <Column field="glc_country_name" :header="t('Pais')" :sortable="true" class="text-xs text-green-500" />
          <Column field="glc_city" :header="t('Region')" :sortable="true" class="text-xs text-blue-500" />
        </DataTable>
      </div>
    </div>
  </div>
</template>
