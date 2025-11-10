<script setup lang='ts'>
import { useConfirm } from 'primevue/useconfirm';
import TestService from '~/services/testService';

const { showMessage, removeGroup } = useMessages();
const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();

const testService = new TestService();
const blocked = ref(false);
const query = ref('');
const resultA = ref<any>(null);
const resultB = ref<any>(null);

// Obtener valores por defecto desde variables de entorno
const defaultAgent = runtimeConfig.public?.DEFAULT_LLM_AGENT || 'gemini';
const defaultModel = runtimeConfig.public?.DEFAULT_LLM_MODEL || 'gpt-4o-mini';

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

// Parámetros de configuración A con valores por defecto
const configA = ref({
  agent: defaultAgent,
  model: initialModel,
  semantic: true,
  bm25: true,
  context: true,
  clean_query: true,
  topN: 5,
  num_queries: 2,
  use_docs: 1,
  min_count: 5
});

// Parámetros de configuración B con valores por defecto
const configB = ref({
  agent: defaultAgent,
  model: initialModel,
  semantic: true,
  bm25: true,
  context: true,
  clean_query: true,
  topN: 5,
  num_queries: 2,
  use_docs: 1,
  min_count: 5
});

const testRAGAB = async () => {
  if (!query.value.trim()) {
    showMessage('warn', t('Advertencia'), t('Por favor ingrese una pregunta'), 3000);
    return;
  }

  blocked.value = true;
  resultA.value = null;
  resultB.value = null;
  showMessage('info', t('Test RAG A/B'), t('Ejecutando consultas RAG en paralelo...'), -1, 'tc');
  
  try {
    // Ejecutar ambas consultas en paralelo
    const [responseA, responseB] = await Promise.all([
      testService.testRAG({
        query: query.value,
        config: {
          agent: configA.value.agent,
          model: configA.value.model,
          semantic: configA.value.semantic,
          bm25: configA.value.bm25,
          context: configA.value.context,
          clean_query: configA.value.clean_query,
          topN: configA.value.topN,
          num_queries: configA.value.num_queries,
          use_docs: configA.value.use_docs,
          min_count: configA.value.min_count
        }
      }),
      testService.testRAG({
        query: query.value,
        config: {
          agent: configB.value.agent,
          model: configB.value.model,
          semantic: configB.value.semantic,
          bm25: configB.value.bm25,
          context: configB.value.context,
          clean_query: configB.value.clean_query,
          topN: configB.value.topN,
          num_queries: configB.value.num_queries,
          use_docs: configB.value.use_docs,
          min_count: configB.value.min_count
        }
      })
    ]);
    
    removeGroup('tc');
    
    // Procesar resultado A
    if (checkLogged(responseA)) {
      resultA.value = responseA?.data?.value;
    } else {
      resultA.value = { error: responseA?.data?.value?.message || t('Error al ejecutar la consulta A') };
    }
    
    // Procesar resultado B
    if (checkLogged(responseB)) {
      resultB.value = responseB?.data?.value;
    } else {
      resultB.value = { error: responseB?.data?.value?.message || t('Error al ejecutar la consulta B') };
    }
    
    if (resultA.value && !resultA.value.error && resultB.value && !resultB.value.error) {
      showMessage('success', t('Éxito'), t('Ambas consultas ejecutadas correctamente'), 3000);
    } else if (resultA.value?.error || resultB.value?.error) {
      showMessage('warn', t('Advertencia'), t('Una o ambas consultas fallaron'), 3000);
    }
  } catch (error: any) {
    removeGroup('tc');
    showMessage('error', t('Error'), error?.message || t('Error al ejecutar las consultas'), -1);
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
          <i class="pi pi-code mr-2 text-blue-500"></i>
          {{ t('Test RAG A/B') }}
        </h2>
      </div>
    </div>

    <!-- Query Section -->
    <div class="mb-6">
      <RAGQueryForm
        v-model="query"
        :disabled="blocked"
        button-label="Ejecutar Test A/B"
        @execute="testRAGAB"
      />
    </div>

    <!-- Configuration Section -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
      <!-- Configuration A -->
      <RAGConfigForm
        v-model="configA"
        title="Configuración A"
        icon-color="text-green-500"
        id-prefix="A"
        :disabled="blocked"
      />

      <!-- Configuration B -->
      <RAGConfigForm
        v-model="configB"
        title="Configuración B"
        icon-color="text-blue-500"
        id-prefix="B"
        :disabled="blocked"
      />
    </div>

    <!-- Results Section -->
    <div v-if="resultA || resultB" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- Result A -->
      <Card v-if="resultA">
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-check-circle text-green-500"></i>
            <span>{{ t('Resultado A') }}</span>
          </div>
        </template>
        <template #content>
          <div v-if="resultA.error" class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p class="text-red-700 dark:text-red-300">{{ resultA.error }}</p>
          </div>
          <div v-else class="space-y-4">
            <!-- Response Content -->
            <div v-if="resultA.response || resultA.content" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {{ t('Respuesta') }}
              </h3>
              <div class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {{ resultA.response || resultA.content }}
              </div>
            </div>

            <!-- Sources -->
            <div v-if="resultA.sources && resultA.sources.length > 0" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {{ t('Fuentes') }}
              </h3>
              <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li v-for="(source, index) in resultA.sources" :key="index">
                  {{ source }}
                </li>
              </ul>
            </div>

            <!-- Times -->
            <div v-if="resultA.times" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {{ t('Tiempos de Ejecución') }}
              </h3>
              <div class="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div v-for="(value, key) in resultA.times" :key="key" class="flex justify-between">
                  <span class="font-medium">{{ key }}:</span>
                  <span>{{ value }}s</span>
                </div>
              </div>
            </div>

            <!-- Raw Result (for debugging) -->
            <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <pre>{{ JSON.stringify(resultA, null, 2) }}</pre>
            </div>
          </div>
        </template>
      </Card>

      <!-- Result B -->
      <Card v-if="resultB">
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-check-circle text-blue-500"></i>
            <span>{{ t('Resultado B') }}</span>
          </div>
        </template>
        <template #content>
          <div v-if="resultB.error" class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p class="text-red-700 dark:text-red-300">{{ resultB.error }}</p>
          </div>
          <div v-else class="space-y-4">
            <!-- Response Content -->
            <div v-if="resultB.response || resultB.content" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {{ t('Respuesta') }}
              </h3>
              <div class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {{ resultB.response || resultB.content }}
              </div>
            </div>

            <!-- Sources -->
            <div v-if="resultB.sources && resultB.sources.length > 0" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {{ t('Fuentes') }}
              </h3>
              <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li v-for="(source, index) in resultB.sources" :key="index">
                  {{ source }}
                </li>
              </ul>
            </div>

            <!-- Times -->
            <div v-if="resultB.times" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {{ t('Tiempos de Ejecución') }}
              </h3>
              <div class="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div v-for="(value, key) in resultB.times" :key="key" class="flex justify-between">
                  <span class="font-medium">{{ key }}:</span>
                  <span>{{ value }}s</span>
                </div>
              </div>
            </div>

            <!-- Raw Result (for debugging) -->
            <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <pre>{{ JSON.stringify(resultB, null, 2) }}</pre>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Empty State -->
    <div v-else-if="!blocked" class="mt-6">
      <Card>
        <template #content>
          <div class="text-center py-12">
            <i class="pi pi-info-circle text-4xl text-gray-400 mb-4"></i>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{{ t('Listo para probar') }}</h3>
            <p class="text-gray-500 dark:text-gray-400">{{ t('Ingrese una pregunta y configure los parámetros A y B para comenzar') }}</p>
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
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{{ t('Ejecutando consultas en paralelo...') }}</h3>
            <p class="text-gray-500 dark:text-gray-400">{{ t('Por favor espere mientras se procesan ambas consultas RAG') }}</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

