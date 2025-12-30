<script setup lang='ts'>
import { useConfirm } from 'primevue/useconfirm';
import TestService from '~/services/testService';

useAuthGuard();

const { showMessage, removeGroup } = useMessages();
const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();

const testService = new TestService();
const blocked = ref(false);
const query = ref('');
const resultA = ref<any>(null);
const resultB = ref<any>(null);
const abEvaluated = ref(false);
const evaluatingAB = ref(false);

// Obtener valores por defecto desde variables de entorno
const defaultAgent: string = String(runtimeConfig.public?.DEFAULT_LLM_AGENT || 'gemini');
const defaultModel: string = String(runtimeConfig.public?.DEFAULT_LLM_MODEL || 'gemini-2.0-flash');
const defaultCollection: string = String(runtimeConfig.public?.COLLECTION_NAME || 'chunks');

// Cargar AGENTS_MODELS para validar el modelo inicial
const agentsModelsJson: string = String(runtimeConfig.public?.AGENTS_MODELS || '{}');
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
  use_docs: -1,
  min_count: -1,
  collection: defaultCollection,
  temperature: 1.0,
  classification: 'auto',
  tono_audiencia: 'UNIVERSIDAD/PROFESIONAL'
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
  use_docs: -1,
  min_count: -1,
  collection: defaultCollection,
  temperature: 1.0,
  classification: 'auto',
  tono_audiencia: 'UNIVERSIDAD/PROFESIONAL'
});

const testRAGAB = async () => {
  if (!query.value.trim()) {
    showMessage('warn', t('Advertencia'), t('Por favor ingrese una pregunta'), 3000);
    return;
  }

  // Comprobar que las configuraciones A y B sean diferentes
  const configAValues = configA.value;
  const configBValues = configB.value;
  
  const areConfigsEqual = 
    configAValues.agent === configBValues.agent &&
    configAValues.model === configBValues.model &&
    configAValues.semantic === configBValues.semantic &&
    configAValues.bm25 === configBValues.bm25 &&
    configAValues.context === configBValues.context &&
    configAValues.clean_query === configBValues.clean_query &&
    configAValues.topN === configBValues.topN &&
    configAValues.num_queries === configBValues.num_queries &&
    configAValues.use_docs === configBValues.use_docs &&
    configAValues.min_count === configBValues.min_count &&
    configAValues.temperature === configBValues.temperature &&
    configAValues.collection === configBValues.collection &&
    configAValues.classification === configBValues.classification &&
    configAValues.tono_audiencia === configBValues.tono_audiencia;

  if (areConfigsEqual) {
    showMessage('error', t('Error'), t('Las configuraciones A y B deben ser diferentes para realizar una comparación'), 5000);
    return;
  }

  blocked.value = true;
  resultA.value = null;
  resultB.value = null;
  abEvaluated.value = false;
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
          min_count: configA.value.min_count,
          db: configA.value.collection,
          temperature: configA.value.temperature,
          classification: configA.value.classification,
          tono_audiencia: configA.value.tono_audiencia
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
          min_count: configB.value.min_count,
          db: configB.value.collection,
          temperature: configB.value.temperature,
          classification: configB.value.classification,
          tono_audiencia: configB.value.tono_audiencia
        }
      })
    ]);
    
    removeGroup('tc');
    
    // Procesar resultado A
    if (checkLogged(responseA)) {
      const dataA = responseA?.data?.value as any;
      const resultData = dataA?.result || dataA?.value?.result || dataA?.value;
      resultA.value = resultData ? { ...resultData, query: query.value } : null;
    } else {
      const dataA = responseA?.data?.value as any;
      resultA.value = { error: dataA?.result?.message || dataA?.value?.message || t('Error al ejecutar la consulta A') };
    }
    
    // Procesar resultado B
    if (checkLogged(responseB)) {
      const dataB = responseB?.data?.value as any;
      const resultData = dataB?.result || dataB?.value?.result || dataB?.value;
      resultB.value = resultData ? { ...resultData, query: query.value } : null;
    } else {
      const dataB = responseB?.data?.value as any;
      resultB.value = { error: dataB?.result?.message || dataB?.value?.message || t('Error al ejecutar la consulta B') };
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

// Funciones para manejar los eventos de evaluación
const handleEvaluationA = (evaluationId: number) => {
  if (resultA.value && !resultA.value.error) {
    resultA.value.evaluationId = evaluationId;
  }
};

const handleEvaluationB = (evaluationId: number) => {
  if (resultB.value && !resultB.value.error) {
    resultB.value.evaluationId = evaluationId;
  }
};

// Función para evaluar el test A/B
const evaluateAB = async (winner: 'A' | 'B') => {
  if (!resultA.value?.evaluationId || !resultB.value?.evaluationId) {
    showMessage('warn', t('Advertencia'), t('Ambos resultados deben estar evaluados'), 3000);
    return;
  }

  evaluatingAB.value = true;
  showMessage('info', t('Evaluando Test A/B'), t('Enviando evaluación...'), -1, 'ab-eval');

  try {
    const response = await testService.evaluateRAGAB({
      idA: resultA.value.evaluationId,
      idB: resultB.value.evaluationId,
      winner: winner
    });

    if (checkLogged(response)) {
      abEvaluated.value = true;
      showMessage('success', t('Éxito'), t('Test A/B evaluado correctamente'), 3000);
    } else {
      const data = response?.data?.value as any;
      showMessage('error', t('Error'), data?.result?.message || data?.value?.message || t('Error al evaluar el test A/B'), -1);
    }
  } catch (error: any) {
    showMessage('error', t('Error'), error?.message || t('Error al evaluar el test A/B'), -1);
  } finally {
    evaluatingAB.value = false;
    removeGroup('ab-eval');
  }
};

// Computed para verificar si se puede evaluar el test A/B
const canEvaluateAB = computed(() => {
  return resultA.value?.evaluationId && resultB.value?.evaluationId && !abEvaluated.value;
});

</script>

<template>
  <div class="min-h-screen p-4" style="background-color: var(--surface-ground);">
    <!-- Header Section -->
    <div class="mb-6">
      <div class="flex items-center space-x-3">
        <h2 class="text-3xl font-bold" style="color: var(--text-color);">
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
      <div v-if="resultA && !resultA.error">
        <RAGResultView :result="resultA" :config="configA" :show-json="false" @evaluated="handleEvaluationA" />
      </div>
      <Card v-else-if="resultA?.error">
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-exclamation-triangle text-red-500"></i>
            <span>{{ t('Error en Resultado A') }}</span>
          </div>
        </template>
        <template #content>
          <div class="bg-red-50  p-4 rounded-lg">
            <p class="text-red-700">{{ resultA.error }}</p>
          </div>
        </template>
      </Card>

      <!-- Result B -->
      <div v-if="resultB && !resultB.error">
        <RAGResultView :result="resultB" :config="configB" :show-json="false" @evaluated="handleEvaluationB" />
      </div>
      <Card v-else-if="resultB?.error">
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-exclamation-triangle text-red-500"></i>
            <span>{{ t('Error en Resultado B') }}</span>
          </div>
        </template>
        <template #content>
          <div class="bg-red-50  p-4 rounded-lg">
            <p class="text-red-700">{{ resultB.error }}</p>
          </div>
        </template>
      </Card>
    </div>

    <!-- Test A/B Evaluation Section -->
    <div v-if="resultA && resultB && !resultA.error && !resultB.error" class="mt-6">
      <Card>
        <template #content>
          <div v-if="abEvaluated" class="text-center py-6">
            <div class="flex items-center justify-center space-x-2 text-green-600">
              <i class="pi pi-check-circle text-2xl"></i>
              <span class="text-lg font-semibold">{{ t('Test A/B evaluado') }}</span>
            </div>
          </div>
          <div v-else-if="canEvaluateAB" class="text-center py-6 space-y-4">
            <h3 class="text-lg font-semibold mb-4" style="color: var(--text-color);">
              {{ t('¿Cuál respuesta es mejor?') }}
            </h3>
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                :label="t('Elegir Respuesta A')"
                icon="pi pi-check"
                :loading="evaluatingAB"
                :disabled="evaluatingAB"
                @click="evaluateAB('A')"
                class="w-full sm:w-auto"
                severity="success"
                size="large"
              />
              <span class="font-medium" style="color: var(--text-color-secondary);">{{ t('o') }}</span>
              <Button
                :label="t('Elegir Respuesta B')"
                icon="pi pi-check"
                :loading="evaluatingAB"
                :disabled="evaluatingAB"
                @click="evaluateAB('B')"
                class="w-full sm:w-auto"
                severity="info"
                size="large"
              />
            </div>
          </div>
          <div v-else-if="!resultA.evaluationId || !resultB.evaluationId" class="text-center py-6">
            <p class="">
              {{ t('Evalúa ambas respuestas para poder compararlas') }}
            </p>
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
            <h3 class="text-lg font-medium mb-2" style="color: var(--text-color);">{{ t('Listo para probar') }}</h3>
            <p style="color: var(--text-color-secondary);">{{ t('Ingrese una pregunta y configure los parámetros A y B para comenzar') }}</p>
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
            <h3 class="text-lg font-medium mb-2" style="color: var(--text-color);">{{ t('Ejecutando consultas en paralelo...') }}</h3>
            <p style="color: var(--text-color-secondary);">{{ t('Por favor espere mientras se procesan ambas consultas RAG') }}</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

