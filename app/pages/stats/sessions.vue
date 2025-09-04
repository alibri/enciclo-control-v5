<script setup  lang="ts">
// import { FilterMatchMode, FilterOperator } from 'primevue/api';
import StatsService from '~/services/statsService';

// const { filters } = usePrimeDataTable();
const { t } = useI18n();
const { getParamsData, lazyParams, exportDataGeneric, resetLazyParams } = useUtilsData();

const statsService = new StatsService();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  user: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
});

const clearFilter = () => {
  initFilters();
};

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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
  const response = await statsService.getLastSessions(data);
  if (checkLogged(response)) {
    stats.value = response?.data?.value?.list;
    totalRecords.value = response?.data?.value?.total;
  }
  loading.value = false;
};

const exportFunction = async (data: any) => {
  return await statsService.exportSessions(data);
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
  console.log('onFilter', lazyParams.value);
  loadData();
};

onMounted(() => {
  resetLazyParams(dt.value.rows, filters.value);
  loadData();
});
</script>

<template>
  <div class="card">
    <h2>{{ t('Sesiones') }}</h2>
    <div class="grid grid-cols-12 p-1">
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
          paginatorPosition="both"
          :rows-per-page-options="[25, 50, 100]"
          responsive-layout="scroll"
          data-key="id"
          striped-rows
          sort-mode="multiple"
          show-gridlines
          :loading="loading"
          :global-globalFilterFields-fields="['user', 'name']"
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
          <Column field="id" header="#" :sortable="true">
            <template #body="slotProps">
              <NuxtLink :to="'/sessions/'+slotProps.data.id" class="p-button-text">
                <Button icon="pi pi-search" type="button" class="p-button-text" />
              </NuxtLink>
            </template>
          </Column>
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
              <NuxtLink :to="'/users/'+slotProps.data.user" class="text-red-500 border-none border-b border-dotted">
                {{ slotProps.data.user }}
              </NuxtLink>
            </template>
          </Column>
          <Column field="begin" :header="t('Inicio')" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm">{{ formatDateTime(slotProps.data.begin) }}</span>
            </template>
          </Column>
          <Column field="end" :header="t('Tiempo')" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm">{{ formatSegundosAHora(slotProps.data.ts) }}</span>
            </template>
          </Column>
          <Column field="pages" :header="t('Páginas')" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm">{{ slotProps.data.pages }}</span>
            </template>
          </Column>
          <Column field="mode" :header="t('Modo')" :sortable="true">
            <template #body="slotProps">
              <Tag :severity="formatLoginMode(slotProps.data.mode)" :value="slotProps.data.mode" />
            </template>
          </Column>
          <Column field="browser" :header="t('Browser')" :sortable="true" class="text-gray-500" />
          <Column field="version" :header="t('Version')" :sortable="true" class="text-gray-400" />
          <Column field="platform" :header="t('SO')" :sortable="true" class="text-gray-500" />
          <Column field="mobile" :header="t('Mobile')" :sortable="true">
            <template #body="slotProps">
              <i
                :class="'pi ' + (slotProps.data.mobile ? 'pi pi-check bg-green-500 text-xs text-white font-bold rounded m-2 p-2' : '')"
              />
            </template>
          </Column>
          <Column field="tablet" :header="t('Tablet')" :sortable="true">
            <template #body="slotProps">
              <i
                :class="'pi ' + (slotProps.data.tablet ? 'pi pi-check bg-green-500 text-xs text-white font-bold rounded m-2 p-2' : '')"
              />
            </template>
          </Column>
          <Column field="agent" :header="t('Agent')" :sortable="true" class="text-xs text-gray-400" />
          <Column field="ip" :header="t('IP')" :sortable="true" class="text-yellow-500" />
          <Column field="glc_country_name" :header="t('Pais')" :sortable="true" class="text-xs text-green-500" />
          <Column field="glc_city" :header="t('Region')" :sortable="true" class="text-xs text-blue-300" />
        </DataTable>
      </div>
    </div>
  </div>
</template>
