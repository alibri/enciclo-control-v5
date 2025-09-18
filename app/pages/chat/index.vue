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
    <h2>{{ t('Consultas Pregúntame') }}</h2>
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
          @row-dblclick="onRowDoubleClick($event)"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <div class="left-0">
                <Button
                  icon="pi pi-refresh"
                  :label="t('Refrescar')"
                  class="p-button-secondary"
                  @click="loadData()"
                />
                <Button icon="pi pi-file-excel" class="p-button-success ml-2" @click="exportData()" />
              </div>
              <div class="flex items-center justify-center">
                <label class="mr-2" for="switch1">{{ t('SIN RESPUESTA') }}</label>
                <ToggleSwitch v-model="no_respuesta" id="switch1" @change="loadData()" />
              </div>
              <div class="flex items-center gap-2">
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  class="p-button-outlined"
                  @click="searchTerm = ''; loadData()"
                />
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
          <Column field="id" :header="t('ID')" :sortable="true">
            <template #body="slotProps">
              <span class="text-center text-xs text-gray-700 font-bold">{{ slotProps.data.id }}</span>
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
          <Column field="collection" :header="t('Colección')" :sortable="true" class="text-yellow-500" />
          <Column field="query" :header="t('Pregunta')" :sortable="true" style="width: 50%">
            <template #body="slotProps">
              
              <a style="cursor: pointer;" class="font-bold border-none border-b border-dotted ml-1" @click="showChat(dialog, slotProps.data.id)">
                <i class="pi pi-eye text-blue-500" v-tooltip.top="t('Ver detalle')" style="cursor:pointer;"></i>  {{ slotProps.data.query }}
              </a>
            </template>
          </Column>
          <Column field="date" :header="t('Fecha')" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm">{{ formatDateTime(slotProps.data.date) }}</span>
            </template>
          </Column>
          <Column field="like" :header="t('Like')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <span v-html="formatLike(slotProps.data.like)" />
            </template>
          </Column>
          <Column field="hayrespuesta" :header="t('¿Respuesta?')" :sortable="false" class="text-center">
            <template #body="slotProps">
              <span v-html="formatRespuestaSiNo(slotProps.data.hayrespuesta)" />
            </template>
          </Column>
          <Column field="sabias" :header="t('¿Sabías?')" :sortable="false" class="text-center">
            <template #body="slotProps">
              <span v-html="formatSabias(slotProps.data.response?.sabias)" />
            </template>
          </Column>
          <Column field="response" :header="t('Idioma')" :sortable="false" class="text-center">
            <template #body="slotProps">
              <span v-show="slotProps.data.response?.idioma" class="bg-blue-300 text-white border p-1 m-1 text-xs">{{ slotProps.data.response?.idioma }}</span>
            </template>
          </Column>
          <Column field="response" :header="t('Traducciones')" :sortable="false" class="text-center">
            <template #body="slotProps">
              <span v-for="(translation, index) in slotProps.data.response?.langs" :key="index" class="bg-red-600 text-white border p-1 m-1 text-xs">{{ translation }}</span>
            </template>
          </Column>
          <Column field="model" :header="t('Modelo')" :sortable="true">
            <template #body="slotProps">
              <pre class="text-xs text-gray-500">{{ slotProps.data.response.model }}</pre>
            </template>
          </Column>
          <Column field="link" :header="t('Enlace')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <ChatLink v-show="slotProps.data.code" :code="slotProps.data.code" :link="slotProps.data.short_url" />
            </template>
          </Column>
          <Column field="counter" :header="t('Clicks')" :sortable="true" class="text-center text-xs text-blue-500">
            <template #body="slotProps">
              {{ formatIntNumber(slotProps.data.counter) }}
            </template>
          </Column>

          <Column field="time" :header="t('ts')" :sortable="true" class="text-center text-xs text-green-500">
            <template #body="slotProps">
              {{ slotProps.data.time }}s
            </template>
          </Column>
          <Column field="prompt_tokens" :header="t('TK.In')" :sortable="true" class="text-right text-xs text-blue-500">
            <template #body="slotProps">
              {{ formatIntNumber(slotProps.data.prompt_tokens) }}
            </template>
          </Column>
          <Column field="completion_tokens" :header="t('TK.Out')" :sortable="true" class="text-right text-xs text-blue-500">
            <template #body="slotProps">
              {{ formatIntNumber(slotProps.data.completion_tokens) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>
