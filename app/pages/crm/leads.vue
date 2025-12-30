<script setup  lang="ts">
import CRMService from '~/services/crmService';
import MessageService from '~/services/messageService';

useAuthGuard();

const { filters } = usePrimeDataTable();
const { t } = useI18n();
const { getParamsData, lazyParams, exportDataGeneric, resetLazyParams } = useUtilsData();
const { showMessage } = useMessages();
const logger = useLogger();

const crmService = new CRMService();
const messageService = new MessageService();

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

const selectedMensaje = ref<any>(null);
const selectedStatus = ref<any>(null);
const messages = ref([]);
const showEnviarMensaje = ref(false);

const enviarMensaje = async () => {
  loading.value = true;
  logger.debug('enviarMensaje', lastId, selectedMensaje?.value, selectedStatus?.value);

  const response = await crmService.sendMessage(lastId, selectedMensaje?.value?.id, selectedStatus?.value);
  if (checkLogged(response)) {
    showMessage('success', t('Consultas'), t('Mensaje enviado'), 3000);
    loadData();
  }

  loading.value = false;
};

const loadMessage = async () => {
  const response = await messageService.getMessages();
  if (checkLogged(response)) {
    messages.value = response.data?.value?.messages;
  }
};

let lastId: number | string | null = null;

const sendMessage = async (data: any) => {
  lastId = data.id;
  await loadMessage();
  showEnviarMensaje.value = true;
};

const loadData = async () => {
  loading.value = true;

  const data = getParamsData(lazyParams.value);
  const response = await crmService.getLeads(data);
  if (checkLogged(response)) {
    stats.value = response?.data?.value?.list || [];
    totalRecords.value = response?.data?.value?.total || 0;
  }
  loading.value = false;
};

/*
const exportFunction = async (data: any) => {
  return await statsService.exportQueries(data);
};
*/

// const exportData = async () => {
//   await exportDataGeneric(t('Exportando datos sesiones'), exportFunction);
// };

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
  <div class="card" style="background-color: var(--surface-card);">
    <Dialog v-model:visible="showEnviarMensaje" modal :header="t('Enviar mensaje')" :style="{ width: '50rem' }">
      <span class="p-text-secondary block mb-5">{{ t('Selecciona el mensaje y el estado') }}</span>
      <div class="flex align-items-center gap-3 mb-3">
        <label for="descripcion" class="font-semibold w-24">{{ t('Mensaje') }}</label>
        <Dropdown
          v-model="selectedMensaje"
          :options="messages"
          option-label="description"
          filter
          :placeholder="t('Selecciona mensaje')"
          class="w-full"
        >
          <template #option="slotProps">
            <div class="font-bold">
              {{ slotProps.option.description }} <span class="text-400">({{ slotProps.option.type }})</span>
            </div>
            <div class="text-400 text-xs" v-html="slotProps.option.html" />
          </template>
          <template #value="slotProps">
            <div v-if="slotProps.value">
              <div class="font-bold">
                {{ slotProps.value.description }} <span class="text-400">({{ slotProps.value.type }})</span>
              </div>
            </div>
            <span v-else>
              {{ slotProps.placeholder }}
            </span>
          </template>
        </Dropdown>
        <Dropdown
          v-model="selectedStatus"
          :options="getStatus()"
          option-label="label"
          filter
          :placeholder="t('Selecciona estado')"
          option-value="value"
          class="w-full"
        >
          <template #option="slotProps">
            <Tag :severity="formatStatus(slotProps.option.value)" class="text-sm" :value="slotProps.option.label" />
          </template>
        </Dropdown>
      </div>
      <div class="flex justify-content-end gap-2">
        <Button type="button" :label="t('Cancelar')" severity="secondary" @click="showEnviarMensaje = false" />
        <Button type="button" :label="t('Enviar')" @click="enviarMensaje()" />
      </div>
    </Dialog>

    <h2 style="color: var(--text-color);">{{ t('Consultas') }}</h2>
    <div class="grid p-1">
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
          :global-filter-fields="['name']"
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
                <!-- <Button icon="pi pi-file-excel" class="p-button-success ml-2" @click="exportData()" /> -->
                <span class="ml-5 text-xs">{{ t('Registros') }}: {{ formatIntNumber(totalRecords) }} {{ t('consultas') }}</span>
              </div>
            </div>
          </template>
          <template #empty>
            {{ t('No se han encontrado datos.') }}
          </template>
          <template #loading>
            {{ t('Cargando datos..') }}' <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
          </template>
          <Column header="#">
            <template #body="slotProps">
              <Button
                severity="info"
                text
                icon="pi pi-envelope"
                @click="sendMessage(slotProps.data)"
              />
              <!-- <Button
                severity="success"
                text
                icon="pi pi-pencil"
                @click="editUser(slotProps.data)"
              />
              <Button
                severity="danger"
                text
                icon="pi pi-trash"
                @click="deleteUser(slotProps.data)"
              /> -->
            </template>
          </Column>
          <Column field="status" :header="t('Estado')" :sortable="true" style="width: 15%">
            <template #body="slotProps">
              <Tag :severity="formatStatus(slotProps.data.status)" class="text-sm" :value="slotProps.data.status" />
            </template>
          </Column>
          <Column field="name" :header="t('Nombre')" :sortable="true">
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
              <span :to="'/users/'+slotProps.data.user" class="text-blue-500 border-none border-bottom-1 border-dotted">
                {{ slotProps.data.name }}
              </span>
            </template>
          </Column>
          <Column field="portales" :header="t('Colecciones')" :sortable="true">
            <template #body="slotProps">
              <span v-if="slotProps.data.portales">
                <span v-for="item in slotProps.data.portales.split(',')" :key="item">
                  <Tag :value="item" rounded />
                </span>
              </span>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-model="filterModel.value"
                v-tooltip.top.focus="'Pulsa ENTER para aplicar'"
                type="text"
                class="p-column-filter"
                :placeholder="`Búsqueda por colección - `"
                @keydown.enter="filterCallback()"
              />
            </template>
          </Column>

          <Column field="submission_at" :header="t('Fecha')" :sortable="true" style="width: 15%">
            <template #body="slotProps">
              <span class="text-sm">{{ formatDateTime(slotProps.data.submission_at) }}</span>
            </template>
          </Column>
          <Column field="email" :header="t('Email')" :sortable="true" />
          <Column field="telephone" :header="t('Teléfono')" :sortable="true" />
          <Column field="institution_name" :header="t('Institución')" :sortable="true">
            <template #body="slotProps">
              <span class="text-green-700 font-bold">{{ slotProps.data.institution_name }}</span>
            </template>
          </Column>
          <Column field="institution_type" :header="t('Tipo')" :sortable="true">
            <template #body="slotProps">
              <Tag severity="success">
                {{ slotProps.data.institution_type }}
              </Tag>
            </template>
          </Column>
          <Column field="address" :header="t('Dirección')" :sortable="true">
            <template #body="slotProps">
              <span class="text-xs text-left" v-html="slotProps.data.address" />
            </template>
          </Column>
          <Column field="ip" :header="t('IP')" :sortable="true" class="text-xs text-500" />
          <Column field="remote_id" :header="t('ID')" :sortable="true" class="text-xs font-bold" />
        </DataTable>
      </div>
    </div>
  </div>
</template>
