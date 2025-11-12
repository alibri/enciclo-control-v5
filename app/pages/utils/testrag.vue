<script setup lang='ts'>
import { useConfirm } from 'primevue/useconfirm';
import TestService from '~/services/testService';

const { showMessage, removeGroup } = useMessages();
const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();

const testService = new TestService();
const blocked = ref(false);
const query = ref('');
const result = ref<any>(null);

// Obtener valores por defecto desde variables de entorno
const defaultAgent = runtimeConfig.public?.DEFAULT_LLM_AGENT || 'gemini';
const defaultModel = runtimeConfig.public?.DEFAULT_LLM_MODEL || 'gemini-2.0-flash';
const defaultCollection = runtimeConfig.public?.COLLECTION_NAME || 'chunks';

// Cargar AGENTS_MODELS para validar el modelo inicial
const agentsModelsJson = runtimeConfig.public?.AGENTS_MODELS || '{}';
let agentsModels: Record<string, string[]> = {};
try {
  agentsModels = JSON.parse(agentsModelsJson);
} catch (e) {
  console.error('Error parsing AGENTS_MODELS:', e);
  agentsModels = { openai: [], gemini: [] };
}

// Validar que el modelo por defecto esté disponible para el agente por defecto
const initialModel: string = (() => {
  const models = agentsModels[defaultAgent] || [];
  if (models.includes(defaultModel)) {
    return defaultModel;
  } else if (models.length > 0) {
    return models[0] || defaultModel;
  }
  return defaultModel;
})();

// Parámetros de configuración con valores por defecto
const config = ref({
  agent: defaultAgent,
  model: initialModel,
  semantic: true,
  bm25: true,
  context: true,
  clean_query: true,
  topN: 5,
  num_queries: 2,
  use_docs: -1,
  min_count: -1,
  collection: defaultCollection,
  temperature: 1.0,
  classification: '<automática>'
});

const testRAG = async () => {
  if (!query.value.trim()) {
    showMessage('warn', t('Advertencia'), t('Por favor ingrese una pregunta'), 3000);
    return;
  }

  blocked.value = true;
  result.value = null;
  showMessage('info', t('Test RAG'), t('Ejecutando consulta RAG...'), -1, 'tc');
  
  try {
    const response = await testService.testRAG({
      query: query.value,
      config: {
        agent: config.value.agent,
        model: config.value.model,
        semantic: config.value.semantic,
        bm25: config.value.bm25,
        context: config.value.context,
        clean_query: config.value.clean_query,
        topN: config.value.topN,
        num_queries: config.value.num_queries,
        use_docs: config.value.use_docs,
        min_count: config.value.min_count,
        db: config.value.collection,
        temperature: config.value.temperature,
        classification: config.value.classification
      }
    });
    
    removeGroup('tc');
    
    if (checkLogged(response)) {
      // La respuesta tiene la estructura: { success: true, result: { ... } }
      result.value = response?.data?.result || response?.data?.value.result;
      showMessage('success', t('Éxito'), t('Consulta ejecutada correctamente'), 3000);
    } else {
      showMessage('error', t('Error'), response?.data?.result?.message || response?.data?.value?.message || t('Error al ejecutar la consulta'), -1);
    }
  } catch (error: any) {
    removeGroup('tc');
    showMessage('error', t('Error'), error?.message || t('Error al ejecutar la consulta'), -1);
  } finally {
    blocked.value = false;
  }
};

</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
    <!-- Header Section -->
    <div class="mb-6">
      <div class="flex items-center space-x-3">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          <i class="pi pi-globe mr-2 text-blue-500"></i>
          {{ t('Test RAG') }}
        </h2>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Query Section -->
      <RAGQueryForm
        v-model="query"
        :disabled="blocked"
        button-label="Ejecutar Consulta"
        :full-width="true"
        @execute="testRAG"
      />

      <!-- Configuration Section -->
      <div class="xl:col-span-1">
        <RAGConfigForm
          v-model="config"
          title="Configuración"
          icon-color="text-green-500"
          :disabled="blocked"
        />
      </div>
    </div>

    <!-- Results Section -->
    <RAGResultView v-if="result" :result="result" :config="config" />

    <!-- Empty State -->
    <div v-else-if="!blocked" class="mt-6">
      <Card>
        <template #content>
          <div class="text-center py-12">
            <i class="pi pi-info-circle text-4xl text-gray-400 mb-4"></i>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{{ t('Listo para probar') }}</h3>
            <p class="text-gray-500 dark:text-gray-400">{{ t('Ingrese una pregunta y configure los parámetros para comenzar') }}</p>
          </div>
        </template>
      </Card>
    </div>

    <!-- Loading State -->
    <div v-if="blocked" class="mt-6">
      <Card>
        <template #content>
          <div class="text-center py-12">
            <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4"></i>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{{ t('Ejecutando consulta...') }}</h3>
            <p class="text-gray-500 dark:text-gray-400">{{ t('Por favor espere mientras se procesa la consulta RAG') }}</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
