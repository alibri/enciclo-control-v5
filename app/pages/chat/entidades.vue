<script setup lang="ts">
// import { FilterMatchMode, FilterOperator } from 'primevue/api';
import EntityService from '~/services/entityService';

useAuthGuard();

const { filters } = usePrimeDataTable();
const { t } = useI18n();
const { getParamsData, lazyParams, exportDataGeneric, resetLazyParams } =
  useUtilsData();
const { showMessage, removeGroup } = useMessages();

const entityService = new EntityService();

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
    user: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
    }
  };
};

const loading = ref(true);
const stats = ref();
const dt = ref();
const totalRecords = ref(0);
const keyword = ref('');
const blocked = ref(false);

const modoEntidad = ref(true);
const entidades = ref('');
const pages = ref([]);
const entidadesEncontradasTexto = ref('');
const entidadesEncontradas = ref([]);
const respuesta = ref('');

const loadData = async () => {
  loading.value = true;

  const data = getParamsData(lazyParams.value);
  (data as any).keyword = keyword.value;
  const response = await entityService.getEntities(data);
  if (checkLogged(response)) {
    stats.value = response?.data?.value?.list;
    totalRecords.value = response?.data?.value?.total;
  }
  loading.value = false;
};

const copyEntidades = () => {
  navigator.clipboard.writeText(entidadesEncontradasTexto.value);
  showMessage('success', t('Copiado'), t('Texto copiado al portapapeles'), 5000);
};

const doSearch = async () => {
  await loadData();
};

const doSearchEntidades = async () => {
  blocked.value = true;
  showMessage('info', t('Buscando Entradas'), '<i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>', -1, 'tc');
  const response = await entityService.getPagesFromEntities({ entidades: entidades.value, type: (modoEntidad.value ? 'entities' : 'search') });
  if (checkLogged(response)) {
    pages.value = response?.data?.value?.list;
  }
  blocked.value = false;
  removeGroup('tc');
};

const doSearchEntidadesFromQueries = async () => {
  blocked.value = true;
  showMessage('info', t('Buscando Entidades'), '<i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>', -1, 'tc');
  const response = await entityService.getEntitiesFromText({ texto: respuesta.value });
  if (checkLogged(response)) {
    const entities = response?.data?.value?.list.map((entity: any) => `Nombre: ${entity.nombre}, Tipo: ${entity.tipo}, Contador: ${entity.contador}`).join('\n');
    entidadesEncontradasTexto.value = entities;
    entidadesEncontradas.value = response?.data?.value?.list;
  }
  blocked.value = false;
  removeGroup('tc');
};

const dialog = useDialog();

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
  <div>
    <BlockUI :blocked="blocked">
      <div class="card">
        <h2>{{ t("Buscar Entidades") }}</h2>
        <div class="grid p-1">
          <div class="col-span-8">
            <label class="font-bold">{{ t('Texto de origen') }}</label>
            <div class="pb-2">
              <Textarea v-model="respuesta" rows="10" cols="30" class="flex-auto  w-full" />
            </div>
            <div>
              <Button
                icon="pi pi-search"
                :label="t('Buscar')"
                class="p-button-primary"
                @click="doSearchEntidadesFromQueries()"
              />
            </div>
          </div>
          <div class="col-span-4">
            <div>
              <DataTable
                :value="entidadesEncontradas"
                :paginator="true"
                :total-records="entidadesEncontradas.length"
                :rows="5"
                paginator-template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                current-page-report-template="{first} to {last} of {totalRecords}"
                size="small"
                responsive-layout="scroll"
                striped-rows
                sort-mode="multiple"
                show-gridlines
                :loading="loading"
                class="flex-auto h-full- w-full"
              >
                <template #paginatorend>
                  <Button type="button" icon="pi pi-copy" text @click="copyEntidades()" />
                </template>
                <template #empty>
                  {{ t("No se han encontrado datos.") }}
                </template>
                <template #loading>
                  {{ t("Cargando datos..") }}
                  <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
                </template>
                <Column field="nombre" :header="t('Entidad')" :sortable="true" />
                <Column field="tipo" :header="t('Tipo')" :sortable="true" />
                <Column field="contador" :header="t('Contador')" :sortable="true" />
              </DataTable>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>{{ t("Prueba de Entidades") }}</h2>
        <div class="grid p-1">
          <div class="col-span-4">
            <div>
              <Textarea v-model="entidades" auto-resize rows="5" cols="30" class="flex-auto" />
            </div>
            <div class="flex">
              <div class="flex-initial flex align-items-left justify-content-center m-2 px-5 py-3 border-round">
                <label>{{ t('Buscar por Entidades') }}</label>
              </div>
              <div class="flex-initial flex align-items-center justify-content-centerm-2 px-5 py-3 border-round">
                <InputSwitch v-model="modoEntidad" />
              </div>
            </div>
            <div>
              <Button
                icon="pi pi-search"
                :label="t('Buscar')"
                class="p-button-primary"
                @click="doSearchEntidades()"
              />
            </div>
          </div>
          <div class="col-span-8">
            <PagesDataTable :value="pages" :rows="50" :paginator="true" />
          </div>
        </div>
      </div>

      <div class="card">
        <h2>{{ t("Entidades") }}</h2>
        <div class="grid p-1">
          <div class="col-span-12">
            <DataTable
              ref="dt"
              v-model:filters="filters"
              :value="stats"
              :paginator="true"
              :rows="50"
              :lazy="true"
              :total-records="totalRecords"
              filter-display="menu"
              paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
              paginator-position="both"
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
                <div
                  class="flex flex-wrap align-items-center justify-content-between gap-2"
                >
                  <div class="left-0">
                    <Button
                      icon="pi pi-refresh"
                      :label="t('Refrescar')"
                      class="p-button-secondary"
                      @click="loadData()"
                    />
                  </div>
                  <div class="right-0">
                    <InputGroup>
                      <InputText
                        v-model="keyword"
                        :placeholder="t('Texto de búsqueda')"
                        @keyup.enter="doSearch"
                      />
                      <Button icon="pi pi-times" @click="keyword = ''" />
                      <Button
                        icon="pi pi-search"
                        severity="warning"
                        @click="doSearch"
                      />
                    </InputGroup>
                  </div>
                </div>
              </template>
              <template #empty>
                {{ t("No se han encontrado datos.") }}
              </template>
              <template #loading>
                {{ t("Cargando datos..") }}
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
              </template>
              <Column field="entity" :header="t('Entidad')" :sortable="true" />
              <Column field="alias" :header="t('Friendly')" :sortable="true" />
              <Column
                field="created_at"
                :header="t('Creación')"
                :sortable="true"
                style="width: 15%"
              >
                <template #body="slotProps">
                  <span class="text-sm">{{
                    formatDateTime(slotProps.data.created_at)
                  }}</span>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
    </BlockUI>
  </div>
</template>
