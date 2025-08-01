<script setup lang='ts'>
import PageService from '~/services/pageService';

const { t } = useI18n();
const pageService = new PageService();
const { exportDataGeneric } = useUtilsData();

const keyword = ref('');
const collections = ref([]);
const selectedCollections = ref([]);
const searchType = ref([
  { name: t('Título'), value: 'title' },
  { name: t('HTML'), value: 'html' },
  { name: t('MARCAS'), value: 'wiki' },
  { name: t('TXT'), value: 'txt' },
  { name: t('REGEX'), value: 'regex' },
  { name: t('Entidades'), value: 'entidad' },
]);

const typeValue = computed(() => {
  return type.value.map(item => item.name);
});

const collectionValue = computed(() => {
  return selectedCollections.value.map(item => item.name);
});
const type = ref([]);

const selectedQuery = ref([]);
const queries = ref([]);

const data = ref([]);

const loading = ref(false);

const doSearch = async () => {
  loading.value = true;
  selectedQuery.value = null;
  const response = await pageService.searchPages(
    keyword.value,
    selectedCollections.value.map(item => item.name),
    type.value.map(item => item.value)
  );
  if (checkLogged(response)) {
    data.value = response.data?.value?.results;
  }
  loading.value = false;
};

const defaultQuery = { name: t('[sin selección]'), value: null };

const loadData = async () => {
  let response = await pageService.getCollections();
  if (!checkLogged(response)) {
    return;
  }

  collections.value = response.data?.value?.collections;

  response = await pageService.getQueries();
  if (checkLogged(response)) {
    queries.value = [defaultQuery, ...response.data?.value?.queries];
  }
};

const dt = ref();
const exportCSV = () => {
  dt.value.exportCSV();
};

const exportWiki = async () => {
  await exportDataGeneric(t('Exportando páginas wiki'), exportFunction);
};

const exportFunction = async () => {
  return await pageService.exportWiki(data.value);
};

const doSearchQuery = async () => {
  if (!selectedQuery.value.value) {
    return;
  }
  loading.value = true;
  const response = await pageService.execQuery(selectedQuery.value.value, selectedCollections.value.map(item => item.name));
  if (checkLogged(response)) {
    data.value = response.data?.value?.results;
  }
  loading.value = false;
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <span>
    <div class="card">
      <div style_="alignment: center">
        <h2>
          {{ t('Búsqueda') }}
        </h2>
        <div class="card flex flex-column md:flex-row gap-3">
          <MultiSelect
            v-model="selectedCollections"
            :options="collections"
            option-label="name"
            :placeholder="t('Colecciones')"
            :max-selected-labels="3"
            class="w-full md:w-20rem"
          />
          <MultiSelect
            v-model="type"
            :options="searchType"
            option-label="name"
            :placeholder="t('Tipo')"
            :max-selected-labels="3"
            class="w-full md:w-20rem"
          />
          <InputGroup>
            <InputText v-model="keyword" :placeholder="t('Texto de búsqueda')" @keyup.enter="doSearch" />
            <Button icon="pi pi-times" @click="keyword=''" />
            <Button icon="pi pi-search" severity="warning" @click="doSearch" />
          </InputGroup>
        </div>
        <div class="card flex flex-column md:flex-row gap-3">
          <MultiSelect
            v-model="selectedCollections"
            :options="collections"
            option-label="name"
            :placeholder="t('Colecciones')"
            :max-selected-labels="3"
            class="w-full md:w-20rem"
          />
          <InputGroup>
            <Dropdown
              v-model="selectedQuery"
              :options="queries"
              option-label="name"
              :placeholder="t('Consultas')"
              :max-selected-labels="3"
              class="w-full"
            />
            <Button icon="pi pi-times" @click="selectedQuery=null" />
            <Button icon="pi pi-search" severity="warning" @click="doSearchQuery" />
          </InputGroup>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="grid p-1">
        <div class="col-12">
          <span v-if="!selectedQuery?.value">
            <div>
              {{ t('Resultados de la búsqueda de') }}  "<strong>{{ keyword }}</strong>"
            </div>
            <div class="mb-1 surface-200">
              {{ t('Tipo') }}: <span class="text-orange-300">{{ typeValue }}</span> - {{ t('Colecciones') }}: <span class="text-blue-300">{{ collectionValue }}</span>
            </div>
          </span>
          <span v-else>
            {{ t('Consulta genérica') }}: <strong>{{ selectedQuery?.name }}</strong>
          </span>
          <div class="mt-1"><span class="text-green-700 font-bold">{{ formatIntNumber(data.length) }}</span> {{ t('Entradas encontradas') }}</div>
          <DataTable
            ref="dt"
            class="mt-2"
            :value="data"
            :loading="loading"
            :rows="50"
            :paginator="true"
            responsive-layout="scroll"
            paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            paginatorPosition="both"
            :rows-per-page-options="[25, 50, 100]"
          >
            <template #header>
              <div style_="text-align: right">
                <Button
                  size="small"
                  icon="pi pi-file-excel"
                  :label="t('Excel')"
                  outlined
                  severity="success"
                  @click="exportCSV($event)"
                />
                <Button
                  size="small"
                  class="ml-1"
                  icon="pi pi-file-excel"
                  :label="t('Marcas')"
                  outlined
                  @click="exportWiki($event)"
                />
              </div>
            </template>
            <Column field="title" :header="t('Título')" :sortable="true" style_="width: 50%">
              <template #body="slotProps">
                <PageLink :page="slotProps.data" />
              </template>
            </Column>
            <Column field="alias" :header="t('Alias')" :sortable="true" style_="width: 50%">
              <template #body="slotProps">
                {{ slotProps.data.alias }}
              </template>
            </Column>
            <Column field="collection" :header="t('Colección')" :sortable="true" style_="width: 15%">
              <template #body="slotProps">
                <span class="text-yellow-500">{{ slotProps.data.collection }}</span>
              </template>
            </Column>
            <Column field="touched" :header="t('Modificación')" :sortable="true" style_="width: 15%">
              <template #body="slotProps">
                <span class="text-sm">{{ formatDateTime(slotProps.data.touched) }}</span>
              </template>
            </Column>
            <Column field="wordcount" :header="t('Num.Palabras')" :sortable="true" style_="width: 15%" class="text-right">
              <template #body="slotProps">
                <span class="text-green-300">{{ formatIntNumber(slotProps.data.wordcount) }}</span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </span>
</template>
