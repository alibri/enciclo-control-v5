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
  return (type.value as Array<{ name: string }>).map(item => item.name);
});

const collectionValue = computed(() => {
  return (selectedCollections.value as Array<{ name: string }>).map(item => item.name);
});
const type = ref([]);

const selectedQuery = ref<{ name: string; value: string | null } | null>(null);
const queries = ref<{ name: string; value: string | null }[]>([]);

const data = ref([]);

const loading = ref(false);

const doSearch = async () => {
  loading.value = true;
  selectedQuery.value = null;
  const response = await pageService.searchPages(
    keyword.value,
    (selectedCollections.value as Array<{ name: string }>).map(item => item.name).join(','),
    (type.value as Array<{ value: string }>).map(item => item.value).join(',')
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
  if (!selectedQuery.value?.value) {
    return;
  }
  loading.value = true;
  const response = await pageService.execQuery(selectedQuery.value.value, (selectedCollections.value as Array<{ name: string }>).map(item => item.name).join(','));
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
  <div class="card">
    <h2>{{ t('Búsqueda') }}</h2>
    <hr>
    <div class="grid grid-cols-12 p-1">
      <div class="col-span-12">
        <h4>{{ t('Búsqueda por texto') }}</h4>
        <div class="p-6 flex flex-col md:flex-row gap-3">
          <FloatLabel variant="on">
            <MultiSelect v-model="selectedCollections" :options="collections" option-label="name" id="collections"
            :placeholder="t('Colecciones')" :max-selected-labels="3" class="w-full md:w-80" />
            <label for="collections">{{ t('Colecciones') }}</label>
          </FloatLabel>
          <FloatLabel variant="on"> 
            <MultiSelect v-model="type" :options="searchType" option-label="name" :placeholder="t('Tipo')"
            class="w-full md:w-80" id="type" />
            <label for="type">{{ t('Tipo') }}</label>
          </FloatLabel>

            <FloatLabel variant="on">
          <InputGroup id="keyword" class="w-full md:w-96">
            <InputText v-model="keyword" :placeholder="t('Texto de búsqueda')" @keyup.enter="doSearch" />
              <Button icon="pi pi-times" @click="keyword = ''" />
              <Button icon="pi pi-search" severity="warning" @click="doSearch" />
            </InputGroup>
            <label for="keyword">{{ t('Texto de búsqueda') }}</label>
          </FloatLabel>
        </div>
        <hr>
        <h4>{{ t('Búsqueda por consulta predefinida') }}</h4>
        <div class=" p-6 flex flex-col md:flex-row gap-3">
          <FloatLabel variant="on">
            <MultiSelect v-model="selectedCollections" :options="collections" option-label="name"
              :placeholder="t('Colecciones')" class="w-full md:w-80" id="collections" />
            <label for="collections">{{ t('Colecciones') }}</label>
          </FloatLabel>
          <FloatLabel variant="on">
            <InputGroup id="consultas" class="w-full md:w-96">
            <Dropdown v-model="selectedQuery" :options="queries" option-label="name" :placeholder="t('Consultas')"
              :max-selected-labels="3" />
              <Button icon="pi pi-times" @click="selectedQuery = null" />
              <Button icon="pi pi-search" severity="warning" @click="doSearchQuery" />
            </InputGroup>
            <label for="consultas">{{ t('Consultas') }}</label>
          </FloatLabel>
        </div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="grid grid-cols-12 p-1">
      <div class="col-span-12">
        <span v-if="!selectedQuery?.value && keyword">
          <h2>{{ t('Resultados de la búsqueda de') }} "<strong>{{ keyword }}</strong>"</h2>
          <div class="mb-1 bg-gray-100 p-2">
            {{ t('Tipo') }}: <span class="text-orange-400">{{ typeValue }}</span> - {{ t('Colecciones') }}: <span
              class="text-blue-400">{{ collectionValue }}</span>
          </div>
        </span>
        <span v-else-if="selectedQuery?.value">
          {{ t('Consulta genérica') }}: <strong>{{ selectedQuery?.name }}</strong>
        </span>
        <span v-else>
          <span class="text-red-500">{{ t('Selecciona una consulta o un texto de búsqueda') }}</span>
        </span>
        <span v-if="selectedQuery?.value || keyword">
          <div class="mt-1"><span class="text-green-700 font-bold">{{ formatIntNumber(data.length) }}</span> {{
            t('Entradas encontradas') }}</div>
        </span>
        <DataTable ref="dt" class="mt-2" :value="data" :loading="loading" :rows="50" :paginator="true"
          responsive-layout="scroll"
          paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          paginatorPosition="both" :rows-per-page-options="[25, 50, 100]">
          <template #header>
            <div style_="text-align: right">
              <Button size="small" icon="pi pi-file-excel" :label="t('Excel')" outlined severity="success"
                @click="exportCSV()" />
              <Button size="small" class="ml-1" icon="pi pi-file-excel" :label="t('Marcas')" outlined
                @click="exportWiki()" />
            </div>
          </template>
          <Column field="title" :header="t('Título')" :sortable="true">
            <template #body="slotProps">
              <PageLink :page="slotProps.data" />
            </template>
          </Column>
          <Column field="alias" :header="t('Alias')" :sortable="true">
            <template #body="slotProps">
              {{ slotProps.data.alias }}
            </template>
          </Column>
          <Column field="collection" :header="t('Colección')" :sortable="true">
            <template #body="slotProps">
              <span class="text-yellow-500">{{ slotProps.data.collection }}</span>
            </template>
          </Column>
          <Column field="touched" :header="t('Modificación')" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm">{{ formatDateTime(slotProps.data.touched) }}</span>
            </template>
          </Column>
          <Column field="wordcount" :header="t('Num.Palabras')" :sortable="true" class="text-right">
            <template #body="slotProps">
              <span class="text-green-400">{{ formatIntNumber(slotProps.data.wordcount) }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>
