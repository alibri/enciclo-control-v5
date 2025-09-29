<script lang="ts" setup>

import type { Ref } from 'vue';
import ChatLink from './ChatLink.vue';
import 'flag-icons/css/flag-icons.min.css';

const { showMessage } = useMessages();
const { t } = useI18n();

const dialogRef = inject<Ref<{ data: { chat: string } }>>('dialogRef');

const chat = ref<any>(dialogRef!.value.data.chat);
chat.value.response.langs = getChatLanguages(chat.value.response);

const getLanguageFlag = (lang: string) => {
  const flagMap: { [key: string]: { type: 'fi' | 'img', value: string } } = {
    'es': { type: 'fi', value: 'es' },
    'en': { type: 'fi', value: 'gb' },
    'fr': { type: 'fi', value: 'fr' },
    'pt': { type: 'fi', value: 'pt' },
    'cat': { type: 'img', value: '/flags/catalonia.svg' },
    'eu': { type: 'img', value: '/flags/basque.svg' },
    'gl': { type: 'img', value: '/flags/galicia.svg' }
  };
  return flagMap[lang] || { type: 'fi', value: 'es' };
};

</script>

<template>
  <!-- Header con información del chat -->
  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4 border border-blue-200">
    <div class="flex flex-wrap gap-2 mb-3">
      <div class="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
        <i class="pi pi-calendar text-blue-600"></i>
        <span class="text-sm font-medium text-gray-700">{{ formatDateTime(chat?.date) }}</span>
      </div>
      <div class="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
        <i class="pi pi-folder text-yellow-600"></i>
        <span class="text-sm font-medium text-gray-700">{{ chat?.collection }}</span>
      </div>
      <div class="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
        <i class="pi pi-user text-blue-600"></i>
        <span class="text-sm font-medium text-gray-700">{{ chat?.user }}</span>
      </div>
      <div class="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
        <i class="pi pi-clock text-red-600"></i>
        <span class="text-sm font-medium text-gray-700">{{ formatFloat(chat?.time, 6) }}s</span>
      </div>
      <div class="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
        <i class="pi pi-tag text-green-600"></i>
        <span class="text-sm font-medium text-gray-700">{{ formatIntNumber(chat?.prompt_tokens + chat?.completion_tokens) }} tokens</span>
      </div>
      <div class="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
        <i class="pi pi-cog text-purple-600"></i>
        <span class="text-sm font-medium text-gray-700">{{ chat?.response?.model }}</span>
      </div>
      <div v-show="chat?.response?.idioma" class="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border">
        <i class="pi pi-globe text-indigo-600"></i>
        <span class="text-sm font-medium text-gray-700">{{ chat?.response?.idioma }}</span>
      </div>
    </div>
    
    <!-- Chip con contador y enlace -->
    <div class="flex items-center gap-3">
      <span v-if="chat?.code">
        <div
          class="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg">
          {{ chat?.counter }}
        </div>
        <ChatLink :code="chat?.code" :link="chat?.short_url" />
      </span>
      <div v-else class="text-gray-500 text-sm italic text-center py-4">
        {{ t('No compartido') }}
      </div>
    </div>

  </div>

  <!-- Contenido principal -->
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
    <div class="p-4">
      <Tabs value="principal" class="custom-tabs">
        <TabList>
          <Tab value="principal">{{ t('Principal') }}</Tab>
          <Tab v-for="(translation, index) in chat?.response?.langs" :key="index" :value="translation">
            <div class="flex items-center gap-2">
              <template v-if="getLanguageFlag(translation).type === 'fi'">
                <span :class="'fi fi-' + getLanguageFlag(translation).value" class="w-4 h-4"></span>
              </template>
              <template v-else>
                <img :src="getLanguageFlag(translation).value" :alt="translation" class="w-4 h-4 object-contain" />
              </template>
              <span class="text-sm font-medium">{{ translation.toUpperCase() }}</span>
            </div>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="principal">
            <div class="prose prose-sm max-w-none">
              <div v-html="formatStringPre(chat?.response?.content)" class="leading-relaxed" />
            </div>
          </TabPanel>
          <TabPanel v-for="(translation, index) in chat?.response?.langs" :key="index" :value="translation">
            <div class="prose prose-sm max-w-none">
              <div v-html="formatStringPre(chat?.response?.translations.find((t: any) => t.key === translation)?.value)" class="leading-relaxed" />
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
    <div class="p-4 border-t border-gray-100">
      <span v-if="chat?.like">
      <div v-html="formatLike(chat?.like)" class="text-center" />
      </span>
      <span v-else>
        <div class="text-gray-500 text-sm italic text-center py-4">
          {{ t('No se ha pulsado like/dislike a la pregunta') }}
        </div>
      </span>
    </div>


  </div>
  <!-- Sección Sabías que -->
  <template v-if="chat?.response?.sabias">
    <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg shadow-sm mb-4">
      <div class="p-4 border-b border-amber-200">
        <h4 class="text-lg font-semibold text-amber-800 flex items-center gap-2">
          <i class="pi pi-lightbulb text-amber-600"></i>
          {{ t('Sabías que') }}
        </h4>
      </div>
      <div class="p-4">
        <Tabs value="sabias-principal" class="custom-tabs">
          <TabList>
            <Tab value="sabias-principal">{{ t('Principal') }}</Tab>
            <Tab v-for="(translation, index) in chat?.response?.translations?.find((t: any) => t.key === 'titular').value" :key="index" :value="'sabias-' + index">
              <div class="flex items-center gap-2">
                <template v-if="getLanguageFlag(String(index)).type === 'fi'">
                  <span :class="'fi fi-' + getLanguageFlag(String(index)).value" class="w-4 h-4"></span>
                </template>
                <template v-else>
                  <img :src="getLanguageFlag(String(index)).value" :alt="String(index)" class="w-4 h-4 object-contain" />
                </template>
                <span class="text-sm font-medium">{{ String(index).toUpperCase() }}</span>
              </div>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="sabias-principal">
              <div class="bg-white p-4 rounded-lg border border-amber-100">
                <h5 class="font-bold text-amber-900 mb-3 text-lg">{{ chat?.response.titular }}</h5>
                <p class="text-gray-700 leading-relaxed">
                  {{ chat?.response?.sabias }}
                </p>
              </div>
            </TabPanel>
            <TabPanel v-for="(translation, index) in chat?.response?.translations?.find((t: any) => t.key === 'titular').value" :key="index" :value="'sabias-' + index">
              <div class="bg-white p-4 rounded-lg border border-amber-100">
                <h5 class="font-bold text-amber-900 mb-3 text-lg">{{ translation }}</h5>
                <p class="text-gray-700 leading-relaxed">{{ chat?.response?.translations.find((t: any) => t.key === 'sabias').value[index] }}</p>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  </template>
  <!-- Sección Preguntas y Entidades -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
    <!-- Preguntas -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div class="p-4 border-b border-gray-100">
        <h4 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i class="pi pi-question-circle text-blue-600"></i>
          {{ t('Preguntas') }}
        </h4>
      </div>
      <div class="p-4">
        <div v-if="chat?.response?.queries?.length" class="space-y-2">
          <div v-for="(question, index) in chat?.response?.queries" :key="index" 
               class="bg-blue-50 border border-blue-200 rounded-lg p-3 hover:bg-blue-100 transition-colors">
            <div class="flex items-start gap-2">
              <i class="pi pi-lightbulb text-blue-600 mt-1 text-sm"></i>
              <span class="text-sm text-gray-700 leading-relaxed">{{ question }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 text-sm italic text-center py-4">
          No hay preguntas disponibles
        </div>
      </div>
    </div>

    <!-- Entidades -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div class="p-4 border-b border-gray-100">
        <h4 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i class="pi pi-search text-green-600"></i>
          {{ t('Entidades') }}
        </h4>
      </div>
      <div class="p-4">
        <div v-if="chat?.response?.entidades?.length" class="space-y-2">
          <div v-for="(entity, index) in chat?.response.entidades" :key="index" 
               class="bg-green-50 border border-green-200 rounded-lg p-3 hover:bg-green-100 transition-colors">
            <div class="flex items-start gap-2">
              <i class="pi pi-tag text-green-600 mt-1 text-sm"></i>
              <span class="text-sm text-gray-700 leading-relaxed">{{ entity }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 text-sm italic text-center py-4">
          {{ t('No hay entidades disponibles') }}
        </div>
      </div>
    </div>
  </div>
  <!-- Sección Fuentes y Relacionados -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
    <!-- Fuentes -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div class="p-4 border-b border-gray-100">
        <h4 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i class="pi pi-book text-purple-600"></i>
          {{ t('Fuentes') }}
        </h4>
        <div v-if="chat?.response.documents_used" class="mt-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <i class="pi pi-file mr-1"></i>
            {{ chat?.response.documents_used }} {{ t('documentos') }}
          </span>
        </div>
      </div>
      <div class="p-4">
        <div v-if="chat?.response?.sources?.length" class="space-y-3">
          <div v-for="(source, index) in chat?.response.sources" :key="index" 
               class="border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-sm transition-all">
            <a :href="source.source" target="_blank" 
               class="text-purple-600 hover:text-purple-800 font-medium text-sm block mb-2 hover:underline">
              <i class="pi pi-external-link mr-1"></i>
              [{{ source.collection }}] - {{ source.title }}
            </a>
            <p class="text-xs text-gray-600 leading-relaxed line-clamp-3">
              {{ source.content }}
            </p>
          </div>
        </div>
        <div v-else class="text-gray-500 text-sm italic text-center py-4">
          {{ t('No hay fuentes disponibles') }}
        </div>
      </div>
    </div>

    <!-- Relacionados -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div class="p-4 border-b border-gray-100">
        <h4 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i class="pi pi-link text-indigo-600"></i>
          {{ t('Relacionados') }}
        </h4>
      </div>
      <div class="p-4">
        <div v-if="chat?.response?.related?.length" class="space-y-2">
          <div v-for="(source, index) in chat?.response.related" :key="index" 
               class="border border-gray-200 rounded-lg p-3 hover:border-indigo-300 hover:shadow-sm transition-all">
            <a :href="getPageLink(source.collection, source.title)" target="_blank" 
               class="text-indigo-600 hover:text-indigo-800 font-medium text-sm block hover:underline">
              <i class="pi pi-external-link mr-1"></i>
              [{{ source.collection }}] - {{ source.title }}
            </a>
          </div>
        </div>
        <div v-else class="text-gray-500 text-sm italic text-center py-4">
          {{ t('No hay contenido relacionado') }} 
        </div>
      </div>
    </div>
  </div>
  <!-- Sección Tiempos y Uso -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Tiempos -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div class="p-4 border-b border-gray-100">
        <h4 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i class="pi pi-clock text-orange-600"></i>
          {{ t('Tiempos') }}
        </h4>
      </div>
      <div class="p-4">
        <DataTable :value="chat?.response.times" striped-rows size="small" class="custom-datatable">
          <Column field="field">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <i class="pi pi-stopwatch text-orange-500 text-xs"></i>
                <span class="font-medium text-sm text-gray-700">{{ slotProps.data.field }}</span>
              </div>
            </template>
          </Column>
          <Column field="value" class="text-right">
            <template #body="slotProps">
              <span class="text-orange-600 text-sm font-mono font-medium bg-orange-50 px-2 py-1 rounded">
                {{ formatFloat(slotProps.data.value, 6) }}s
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Uso -->
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div class="p-4 border-b border-gray-100">
        <h4 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i class="pi pi-chart-bar text-teal-600"></i>
          {{ t('Uso') }}
        </h4>
      </div>
      <div class="p-4">
        <DataTable :value="chat?.response.usage" striped-rows size="small" class="custom-datatable">
          <Column field="field">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <i class="pi pi-database text-teal-500 text-xs"></i>
                <span class="font-medium text-sm text-gray-700">{{ slotProps.data.field }}</span>
              </div>
            </template>
          </Column>
          <Column field="value" class="text-right">
            <template #body="slotProps">
              <span class="text-teal-600 text-sm font-mono font-medium bg-teal-50 px-2 py-1 rounded">
                {{ formatIntNumber(slotProps.data.value) }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<style scoped>
.p-inputtextarea {
  font-family: monospace;
  font-size: 12px;
}

/* Estilos personalizados para las pestañas */
.custom-tabs :deep(.p-tabs-nav) {
  background: #f8fafc;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #e2e8f0;
}

.custom-tabs :deep(.p-tabs-nav li) {
  margin-right: 4px;
}

.custom-tabs :deep(.p-tabs-nav li .p-tabs-nav-link) {
  border-radius: 6px 6px 0 0;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 500;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.custom-tabs :deep(.p-tabs-nav li .p-tabs-nav-link:hover) {
  background: #e2e8f0;
  color: #475569;
}

.custom-tabs :deep(.p-tabs-nav li.p-highlight .p-tabs-nav-link) {
  background: #3b82f6;
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.custom-tabs :deep(.p-tabs-panels) {
  background: white;
  border-radius: 0 0 8px 8px;
  border: 1px solid #e2e8f0;
  border-top: none;
}

/* Estilos para las tablas de datos */
.custom-datatable :deep(.p-datatable) {
  border: none;
}

.custom-datatable :deep(.p-datatable .p-datatable-header) {
  background: #f8fafc;
  border: none;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #374151;
}

.custom-datatable :deep(.p-datatable .p-datatable-tbody > tr) {
  border-bottom: 1px solid #f1f5f9;
}

.custom-datatable :deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}

.custom-datatable :deep(.p-datatable .p-datatable-tbody > tr > td) {
  border: none;
  padding: 12px 16px;
}

/* Utilidad para truncar texto */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Mejoras responsivas */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .custom-tabs :deep(.p-tabs-nav) {
    flex-wrap: wrap;
  }
  
  .custom-tabs :deep(.p-tabs-nav li .p-tabs-nav-link) {
    padding: 8px 12px;
    font-size: 0.875rem;
  }
}
</style>
