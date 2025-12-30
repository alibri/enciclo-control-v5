<script setup lang='ts'>
import PageService from '~/services/pageService';

useAuthGuard();

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
  <div class="min-h-screen p-4" style="background-color: var(--surface-ground);">
    <!-- Header Section -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <h2 class="text-3xl font-bold" style="color: var(--text-color);">
            <i class="pi pi-search mr-2 text-blue-500"></i>
            {{ t('Búsqueda') }}</h2>
          <Badge v-if="data.length > 0" :value="formatIntNumber(data.length)" severity="info" />
        </div>
        <div v-if="data.length > 0" class="flex items-center space-x-2">
          <Button 
            :label="t('Excel')" 
            icon="pi pi-file-excel" 
            size="small"
            outlined 
            severity="success"
            @click="exportCSV()" 
          />
          <Button 
            :label="t('Marcas')" 
            icon="pi pi-file" 
            size="small"
            outlined 
            severity="info"
            @click="exportWiki()" 
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <!-- Search Forms -->
      <div class="xl:col-span-12 space-y-6">
        <!-- Text Search Card -->
        <Card>
          <template #title>
            <div class="flex items-center space-x-2">
              <i class="pi pi-search text-blue-500"></i>
              <span>{{ t('Búsqueda por texto') }}</span>
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <label for="collections" class="block text-sm font-medium" style="color: var(--text-color);">
                  {{ t('Colecciones') }}
                </label>
                <MultiSelect 
                  v-model="selectedCollections" 
                  :options="collections" 
                  option-label="name" 
                  id="collections"
                  :placeholder="t('Seleccionar colecciones')" 
                  :max-selected-labels="3" 
                  class="w-full"
                  display="chip"
                />
              </div>
              
              <div class="space-y-2">
                <label for="type" class="block text-sm font-medium" style="color: var(--text-color);">
                  {{ t('Tipo de búsqueda') }}
                </label>
                <MultiSelect 
                  v-model="type" 
                  :options="searchType" 
                  option-label="name" 
                  :placeholder="t('Seleccionar tipos')"
                  class="w-full" 
                  id="type"
                  display="chip"
                />
              </div>
              
              <div class="space-y-2">
                <label for="keyword" class="block text-sm font-medium" style="color: var(--text-color);">
                  {{ t('Texto de búsqueda') }}
                </label>
                <InputGroup id="keyword" class="w-full">
                  <InputText 
                    v-model="keyword" 
                    :placeholder="t('Ingrese texto a buscar...')" 
                    @keyup.enter="doSearch"
                    class="flex-1"
                  />
                  <Button 
                    icon="pi pi-times" 
                    severity="secondary"
                    @click="keyword = ''" 
                  />
                  <Button 
                    icon="pi pi-search" 
                    severity="primary"
                    :loading="loading"
                    @click="doSearch" 
                  />
                </InputGroup>
              </div>
            </div>
          </template>
        </Card>

        <!-- Query Search Card -->
        <Card>
          <template #title>
            <div class="flex items-center space-x-2">
              <i class="pi pi-database text-green-500"></i>
              <span>{{ t('Búsqueda por consulta predefinida') }}</span>
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="collections-query" class="block text-sm font-medium" style="color: var(--text-color);">
                  {{ t('Colecciones') }}
                </label>
                <MultiSelect 
                  v-model="selectedCollections" 
                  :options="collections" 
                  option-label="name"
                  :placeholder="t('Seleccionar colecciones')" 
                  class="w-full" 
                  id="collections-query"
                  display="chip"
                />
              </div>
              
              <div class="space-y-2">
                <label for="consultas" class="block text-sm font-medium" style="color: var(--text-color);">
                  {{ t('Consultas predefinidas') }}
                </label>
                <InputGroup id="consultas" class="w-full">
                  <Dropdown 
                    v-model="selectedQuery" 
                    :options="queries" 
                    option-label="name" 
                    :placeholder="t('Seleccionar consulta')"
                    class="flex-1"
                  />
                  <Button 
                    icon="pi pi-times" 
                    severity="secondary"
                    @click="selectedQuery = null" 
                  />
                  <Button 
                    icon="pi pi-search" 
                    severity="primary"
                    :loading="loading"
                    @click="doSearchQuery" 
                  />
                </InputGroup>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Results Section -->
      <div v-if="data.length > 0 || loading" class="xl:col-span-12">
        <Card>
          <template #title>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <i class="pi pi-list text-purple-500"></i>
                <span>{{ t('Resultados') }}</span>
                <Badge :value="formatIntNumber(data.length)" severity="info" />
              </div>
            </div>
          </template>
          <template #content>
            <!-- Search Info -->
            <div v-if="!selectedQuery?.value && keyword" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex items-center space-x-2 mb-2">
                <i class="pi pi-info-circle text-blue-500"></i>
                <h3 class="font-semibold text-blue-900">
                  {{ t('Resultados de la búsqueda de') }} "<span class="text-blue-700">{{ keyword }}</span>"
                </h3>
              </div>
              <div class="text-sm text-blue-700">
                <span class="font-medium">{{ t('Tipo') }}:</span> 
                <Badge v-for="t in typeValue" :key="t" :value="t" severity="warning" class="ml-1" />
                <span class="font-medium ml-3">{{ t('Colecciones') }}:</span> 
                <Badge v-for="c in collectionValue" :key="c" :value="c" severity="info" class="ml-1" />
              </div>
            </div>
            
            <div v-else-if="selectedQuery?.value" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center space-x-2">
                <i class="pi pi-check-circle text-green-500"></i>
                <span class="font-semibold text-green-900">
                  {{ t('Consulta ejecutada') }}: <span class="text-green-700">{{ selectedQuery?.name }}</span>
                </span>
              </div>
            </div>
            
            <div v-else class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-center space-x-2">
                <i class="pi pi-exclamation-triangle text-red-500"></i>
                <span class="text-red-700">{{ t('Selecciona una consulta o un texto de búsqueda') }}</span>
              </div>
            </div>

            <!-- Data Table -->
            <DataTable 
              ref="dt" 
              :value="data" 
              :loading="loading" 
              :rows="50" 
              :paginator="true"
              responsive-layout="scroll"
              paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
              paginatorPosition="both" 
              :rows-per-page-options="[25, 50, 100]"
              class="p-datatable-sm"
            >
              <Column field="title" :header="t('Título')" :sortable="true">
                <template #body="slotProps">
                  <div class="flex items-center space-x-2">
                    <i class="pi pi-file text-gray-400"></i>
                    <PageLink :page="slotProps.data" class="font-medium text-blue-600 hover:text-blue-800" />
                  </div>
                </template>
              </Column>
              
              <Column field="alias" :header="t('Alias')" :sortable="true">
                <template #body="slotProps">
                  <span class="text-sm" style="color: var(--text-color-secondary);">{{ slotProps.data.alias }}</span>
                </template>
              </Column>
              
              <Column field="collection" :header="t('Colección')" :sortable="true">
                <template #body="slotProps">
                  <Badge :value="slotProps.data.collection" severity="warning" />
                </template>
              </Column>
              
              <Column field="touched" :header="t('Modificación')" :sortable="true">
                <template #body="slotProps">
                  <div class="flex items-center space-x-2">
                    <i class="pi pi-clock text-gray-400"></i>
                    <span class="text-sm" style="color: var(--text-color-secondary);">{{ formatDateTime(slotProps.data.touched) }}</span>
                  </div>
                </template>
              </Column>
              
              <Column field="wordcount" :header="t('Palabras')" :sortable="true" class="text-right">
                <template #body="slotProps">
                  <div class="flex items-center justify-end space-x-1">
                    <i class="pi pi-hashtag text-gray-400"></i>
                    <span class="font-medium text-green-600">{{ formatIntNumber(slotProps.data.wordcount) }}</span>
                  </div>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
