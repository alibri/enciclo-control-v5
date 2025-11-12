<script setup lang='ts'>
import { formatStringPre } from '~/utils/format';
import TestService from '~/services/testService';

interface Props {
  result: any;
  config?: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  evaluated: [evaluationId: number]
}>();

const { t } = useI18n();
const { showMessage, removeGroup } = useMessages();

const testService = new TestService();

// Ratings para evaluación
const ratingRespuesta = ref<number | undefined>(undefined);
const ratingVelocidad = ref<number | undefined>(undefined);
const evaluating = ref(false);
const evaluationSent = ref(false);
const evaluationId = ref<number | null>(null);

// Resetear evaluación cuando cambie el resultado
watch(() => props.result, () => {
  evaluationSent.value = false;
  ratingRespuesta.value = undefined;
  ratingVelocidad.value = undefined;
  evaluationId.value = null;
});

// Función para convertir markdown a HTML
const formatMarkdown = (markdown: string | null | undefined): string => {
  if (!markdown) return '';
  return formatStringPre(markdown);
};

// Computed para el contenido HTML
const contentHtml = computed(() => {
  if (props.result?.content) {
    return formatMarkdown(props.result.content);
  }
  if (props.result?.response) {
    return formatMarkdown(props.result.response);
  }
  return '';
});

// Computed para el HTML de "Sabías que"
const sabiasHtml = computed(() => {
  if (props.result?.sabias) {
    return formatMarkdown(props.result.sabias);
  }
  return '';
});

// Función para evaluar la respuesta
const evaluateRAG = async () => {
  if (!ratingRespuesta.value || !ratingVelocidad.value) {
    showMessage('warn', t('Advertencia'), t('Por favor califique tanto la respuesta como la velocidad'), 3000);
    return;
  }

  evaluating.value = true;
  showMessage('info', t('Evaluando'), t('Enviando evaluación...'), -1, 'eval');

  try {
    const response = await testService.evaluateRAG({
      query: props.result.query,
      config: props.config,
      result: props.result,
      rating: {
        respuesta: ratingRespuesta.value,
        velocidad: ratingVelocidad.value
      }
    });

    if (checkLogged(response)) {
      // Extraer el ID de la evaluación de la respuesta
      // La respuesta puede estar en response.data.value o response.data.result
      const resultData = response?.data?.result || response?.data?.value;
      const id = resultData?.id || response?.data?.id;
      if (id) {
        evaluationId.value = id;
        emit('evaluated', id);
      }
      showMessage('success', t('Éxito'), t('Evaluación enviada correctamente'), 3000);
      evaluationSent.value = true;
      // Opcional: resetear los ratings después de enviar
      // ratingRespuesta.value = null;
      // ratingVelocidad.value = null;
    } else {
      showMessage('error', t('Error'), response?.data?.result?.message || response?.data?.value?.message || t('Error al enviar la evaluación'), -1);
    }
  } catch (error: any) {
    showMessage('error', t('Error'), error?.message || t('Error al enviar la evaluación'), -1);
  } finally {
    evaluating.value = false;
    removeGroup('eval');
  }
};
</script>

<template>
  <div v-if="result" class="mt-6 space-y-6">
    <!-- Main Content Card -->
    <Card class="shadow-lg">
      <template #title>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <i class="pi pi-check-circle text-green-600 dark:text-green-400 text-xl"></i>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ t('Resultado de la Consulta') }}</h2>
              <p v-if="result.query" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ result.query }}</p>
            </div>
          </div>
          <div v-if="result.times?.total" class="text-right">
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('Tiempo total') }}</div>
            <div class="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {{ typeof result.times.total === 'number' ? result.times.total.toFixed(2) : result.times.total }}s
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <div class="space-y-6">
          <!-- Análisis de la Consulta -->
          <div v-if="result.clasificacion || result.razonamiento_breve || result.es_pregunta" class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-2 mb-4">
              <i class="pi pi-search text-violet-600 dark:text-violet-400"></i>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ t('Análisis de la Consulta') }}
              </h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div v-if="result.es_pregunta" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                  <i class="pi pi-question-circle mr-2 text-violet-600"></i>{{ t('Es Pregunta') }}
                </span>
                <span class="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-semibold">
                  {{ result.es_pregunta }}
                </span>
              </div>
              <div v-if="result.clasificacion" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                  <i class="pi pi-tag mr-2 text-violet-600"></i>{{ t('Clasificación') }}
                </span>
                <span class="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-semibold capitalize">
                  {{ result.clasificacion }}
                </span>
              </div>
              <div v-if="result.porcentaje_asignacion !== undefined && result.porcentaje_asignacion !== null" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                  <i class="pi pi-percentage mr-2 text-violet-600"></i>{{ t('Porcentaje de Asignación') }}
                </span>
                <span class="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-semibold">
                  {{ result.porcentaje_asignacion }}%
                </span>
              </div>
              <div v-if="result.clasificacion_top3 && result.clasificacion_top3.length > 0" class="md:col-span-3 p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg border-l-4 border-violet-500">
                <div class="flex items-start space-x-2 mb-3">
                  <i class="pi pi-sort-amount-down text-violet-600 dark:text-violet-400 mt-0.5"></i>
                  <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('Top 3 Clasificaciones') }}</h4>
                </div>
                <div class="space-y-2">
                  <div v-for="(item, index) in result.clasificacion_top3" :key="index" 
                       class="flex items-center justify-between p-2 bg-white dark:bg-gray-800/50 rounded-lg">
                    <span class="text-sm text-gray-700 dark:text-gray-300 capitalize flex items-center">
                      <span class="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded text-xs font-semibold mr-2">
                        {{ index + 1 }}
                      </span>
                      {{ item.categoria }}
                    </span>
                    <span class="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-semibold">
                      {{ item.porcentaje }}%
                    </span>
                  </div>
                </div>
              </div>
              <div v-if="result.razonamiento_breve" class="md:col-span-3 p-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg border-l-4 border-violet-500">
                <div class="flex items-start space-x-2">
                  <i class="pi pi-comments text-violet-600 dark:text-violet-400 mt-0.5"></i>
                  <div class="flex-1">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">{{ t('Razonamiento Breve') }}</span>
                    <p class="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                      {{ result.razonamiento_breve }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Titular y Contenido Principal -->
          <div class="space-y-4">
            <div v-if="result.query" class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border-l-4 border-blue-500">
              <div class="flex items-start space-x-3">
                <i class="pi pi-bookmark text-blue-600 dark:text-blue-400 text-xl mt-1"></i>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {{ result.query }}
                  </h3>
                </div>
              </div>
            </div>

            <!-- Content / Respuesta -->
            <div v-if="contentHtml" class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="prose prose-lg dark:prose-invert max-w-none markdown-content">
                <div 
                  v-html="contentHtml" 
                  class="text-gray-800 dark:text-gray-200 leading-relaxed"
                ></div>
              </div>
            </div>

            <!-- Sabías que -->
            <div v-if="result.sabias" class="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-5 rounded-xl border-l-4 border-amber-500">
              <div class="flex items-start space-x-3">
                <i class="pi pi-lightbulb text-amber-600 dark:text-amber-400 text-xl mt-1"></i>
                <div class="flex-1">
                  <h3 v-if="result.titular" class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                    <span class="mr-2">{{ result.titular }}</span>
                  </h3>
                  <div 
                    v-if="sabiasHtml" 
                    v-html="sabiasHtml" 
                    class="prose prose-lg dark:prose-invert max-w-none markdown-content text-gray-700 dark:text-gray-300 italic leading-relaxed"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Configuración en 2 columnas -->
          <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-2 mb-4">
              <i class="pi pi-cog text-gray-600 dark:text-gray-400"></i>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ t('Configuración') }}
              </h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Columna 1 -->
              <div class="space-y-3">
                <div v-if="result.agent" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-server mr-2"></i>{{ t('Agente') }}
                  </span>
                  <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold">
                    {{ result.agent }}
                  </span>
                </div>
                <div v-if="result.model" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-microchip mr-2"></i>{{ t('Modelo') }}
                  </span>
                  <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-semibold">
                    {{ result.model }}
                  </span>
                </div>
                <div v-if="result.idioma" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-globe mr-2"></i>{{ t('Idioma') }}
                  </span>
                  <span class="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-semibold uppercase">
                    {{ result.idioma }}
                  </span>
                </div>
                <div v-if="result.temperature !== undefined && result.temperature !== null" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-sliders-h mr-2"></i>{{ t('Temperature') }}
                  </span>
                  <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-semibold">
                    {{ result.temperature }}
                  </span>
                </div>
                <div v-if="result.semantic !== undefined && result.semantic !== null" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-search mr-2"></i>{{ t('Semantic') }}
                  </span>
                  <span class="px-3 py-1" :class="result.semantic ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300'">
                    {{ result.semantic ? t('Sí') : t('No') }}
                  </span>
                </div>
                <div v-if="result.bm25 !== undefined && result.bm25 !== null" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-list mr-2"></i>{{ t('BM25') }}
                  </span>
                  <span class="px-3 py-1" :class="result.bm25 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300'">
                    {{ result.bm25 ? t('Sí') : t('No') }}
                  </span>
                </div>
                <div v-if="result.topN !== undefined && result.topN !== null" class="flex items-center justify-between py-2">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-sort-numeric-up mr-2"></i>{{ t('Top N') }}
                  </span>
                  <span class="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg text-sm font-semibold">
                    {{ result.topN }}
                  </span>
                </div>
              </div>
              <!-- Columna 2 -->
              <div class="space-y-3">
                <div v-if="result.context !== undefined && result.context !== null" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-book mr-2"></i>{{ t('Context') }}
                  </span>
                  <span class="px-3 py-1" :class="result.context ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300'">
                    {{ result.context ? t('Sí') : t('No') }}
                  </span>
                </div>
                <div v-if="result.num_queries !== undefined && result.num_queries !== null" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-question-circle mr-2"></i>{{ t('Número de Consultas') }}
                  </span>
                  <span class="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg text-sm font-semibold">
                    {{ result.num_queries }}
                  </span>
                </div>
                <div v-if="result.filter !== undefined && result.filter !== null" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-filter mr-2"></i>{{ t('Filtro') }}
                  </span>
                  <span class="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-lg text-sm font-semibold">
                    {{ result.filter || t('Ninguno') }}
                  </span>
                </div>
                <div v-if="result.min_count !== undefined && result.min_count !== null" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-sort-amount-down mr-2"></i>{{ t('Min Count') }}
                  </span>
                  <span class="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-semibold">
                    {{ result.min_count }}
                  </span>
                </div>
                <div v-if="result.use_docs !== undefined && result.use_docs !== null" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-file-edit mr-2"></i>{{ t('Use Docs') }}
                  </span>
                  <span class="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-semibold">
                    {{ result.use_docs }}
                  </span>
                </div>
                <div v-if="result.embedding" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-code mr-2"></i>{{ t('Embedding') }}
                  </span>
                  <span class="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-semibold text-xs max-w-xs truncate" :title="result.embedding">
                    {{ result.embedding }}
                  </span>
                </div>
                <div v-if="result.clean_query !== undefined && result.clean_query !== null" class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-filter-slash mr-2"></i>{{ t('Clean Query') }}
                  </span>
                  <span class="px-3 py-1" :class="result.clean_query ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300'">
                    {{ result.clean_query ? t('Sí') : t('No') }}
                  </span>
                </div>
                <div v-if="result.index" class="flex items-center justify-between py-2">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-database mr-2"></i>{{ t('Index') }}
                  </span>
                  <span class="px-3 py-1 bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold">
                    {{ result.index }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Entidades -->
          <div v-if="result.entidades && result.entidades.length > 0" class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-2 mb-4">
              <i class="pi pi-tags text-purple-600 dark:text-purple-400"></i>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ t('Entidades') }}
              </h3>
              <span class="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                {{ result.entidades.length }}
              </span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="(entidad, index) in result.entidades" :key="index" 
                    class="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-200 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-shadow">
                {{ entidad.nombre }}
                <span v-if="entidad.tipo" class="ml-1 text-xs opacity-75">({{ entidad.tipo }})</span>
              </span>
            </div>
          </div>

          <!-- Queries Generadas -->
          <div v-if="result.queries && result.queries.length > 0" class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-2 mb-4">
              <i class="pi pi-list text-indigo-600 dark:text-indigo-400"></i>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ t('Consultas Generadas') }}
              </h3>
              <span class="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                {{ result.queries.length }}
              </span>
            </div>
            <div class="space-y-2">
              <div v-for="(q, index) in result.queries" :key="index" 
                   class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-3 border-indigo-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div class="flex items-start space-x-2">
                  <span class="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-semibold mt-0.5">
                    {{ index + 1 }}
                  </span>
                  <p class="text-gray-700 dark:text-gray-300 flex-1">{{ q }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sources -->
          <div v-if="result.sources && result.sources.length > 0" class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-2 mb-4">
              <i class="pi pi-book text-teal-600 dark:text-teal-400"></i>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ t('Fuentes') }}
              </h3>
              <span class="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">
                {{ result.sources.length }}
              </span>
              <span v-if="result.documents_used" class="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium flex items-center">
                <i class="pi pi-file mr-1"></i>{{ t('Documentos') }}: {{ result.documents_used }}
              </span>
            </div>
            <div class="space-y-4">
              <div v-for="(source, index) in result.sources" :key="index" 
                   class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-teal-500 hover:shadow-md transition-all">
                <div v-if="source.title" class="font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                  {{ source.title }}
                </div>
                <div v-if="source.collection" class="mb-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200">
                    <i class="pi pi-folder mr-1"></i>{{ source.collection }}
                  </span>
                </div>
                <div v-if="source.content" class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
                  {{ source.content }}
                </div>
              </div>
            </div>
          </div>

          <!-- Documents (docs) -->
          <div v-if="result.docs && result.docs.length > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <Accordion :multiple="true" :activeIndex="[]">
              <AccordionTab>
                <template #header>
                  <div class="flex items-center space-x-3 w-full">
                    <i class="pi pi-file-pdf text-cyan-600 dark:text-cyan-400"></i>
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {{ t('Documentos Utilizados') }}
                      </h3>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {{ result.docs.length }} {{ result.docs.length === 1 ? t('documento') : t('documentos') }}
                      </p>
                    </div>
                    <span class="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-xs font-medium">
                      {{ result.docs.length }}
                    </span>
                  </div>
                </template>
                <div class="space-y-3 pt-2">
                  <div v-for="(doc, index) in result.docs" :key="index" 
                       class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-cyan-500 hover:shadow-md transition-all">
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex-1">
                        <div v-if="doc.title" class="font-bold text-gray-900 dark:text-gray-100 mb-1 text-base">
                          {{ doc.title }}
                        </div>
                        <div v-if="doc.friendly" class="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono">
                          {{ doc.friendly }}
                        </div>
                      </div>
                      <div v-if="doc.id" class="ml-3">
                        <span class="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded text-xs font-mono">
                          ID: {{ doc.id }}
                        </span>
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-2 mb-3">
                      <span v-if="doc.collection" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200">
                        <i class="pi pi-folder mr-1"></i>{{ doc.collection }}
                      </span>
                      <span v-if="doc.count" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                        <i class="pi pi-hashtag mr-1"></i>{{ t('Usos') }}: {{ doc.count }}
                      </span>
                      
                      <!--<span v-if="doc.chunk !== undefined" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
                        <i class="pi pi-th-large mr-1"></i>{{ t('Chunk') }}: {{ doc.chunk }}
                      </span>-->
                    </div>
                    <div v-if="doc.content" class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      <div class="max-h-32 overflow-y-auto">
                        {{ doc.content }}
                      </div>
                    </div>
                    <div v-if="doc.metadata" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <details class="text-xs">
                        <summary class="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                          {{ t('Ver metadata') }}
                        </summary>
                        <pre class="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">{{ JSON.stringify(doc.metadata, null, 2) }}</pre>
                      </details>
                    </div>
                  </div>
                </div>
              </AccordionTab>
            </Accordion>
          </div>

          <!-- Métricas de Rendimiento -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Times -->
            <div v-if="result.times" class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="flex items-center space-x-2 mb-4">
                <i class="pi pi-clock text-red-600 dark:text-red-400"></i>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ t('Tiempos de Ejecución') }}
                </h3>
              </div>
              <div class="space-y-2">
                <div v-for="(value, key) in result.times" :key="key" 
                     class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                    {{ String(key).replace(/_/g, ' ') }}:
                  </span>
                  <span class="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-semibold">
                    {{ typeof value === 'number' ? value.toFixed(4) : value }}s
                  </span>
                </div>
              </div>
            </div>

            <!-- Usage -->
            <div v-if="result.usage" class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="flex items-center space-x-2 mb-4">
                <i class="pi pi-chart-bar text-emerald-600 dark:text-emerald-400"></i>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ t('Uso de Tokens') }}
                </h3>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-arrow-right mr-2 text-emerald-600"></i>{{ t('Prompt') }}
                  </span>
                  <span class="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-semibold">
                    {{ result.usage.prompt_tokens?.toLocaleString() || 0 }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-arrow-left mr-2 text-blue-600"></i>{{ t('Completación') }}
                  </span>
                  <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold">
                    {{ result.usage.completion_tokens?.toLocaleString() || 0 }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border-2 border-emerald-200 dark:border-emerald-800">
                  <span class="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                    <i class="pi pi-calculator mr-2"></i>{{ t('Total') }}
                  </span>
                  <span class="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg text-sm font-bold shadow-md">
                    {{ result.usage.total_tokens?.toLocaleString() || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Evaluación -->
          <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-2 mb-4">
              <i class="pi pi-star text-yellow-600 dark:text-yellow-400"></i>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ t('Evaluar Respuesta') }}
              </h3>
            </div>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Rating Respuesta -->
                <div class="flex flex-col space-y-2">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <i class="pi pi-comment mr-2 text-blue-600"></i>{{ t('Calidad de la Respuesta') }}
                  </label>
                  <Rating 
                    v-model="ratingRespuesta" 
                    :stars="5" 
                    :cancel="false"
                    class="text-2xl"
                  />
                  <span v-if="ratingRespuesta" class="text-xs text-gray-500 dark:text-gray-400">
                    {{ ratingRespuesta }}/5 {{ t('estrellas') }}
                  </span>
                </div>

                <!-- Rating Velocidad -->
                <div class="flex flex-col space-y-2">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <i class="pi pi-bolt mr-2 text-orange-600"></i>{{ t('Velocidad de Respuesta') }}
                  </label>
                  <Rating 
                    v-model="ratingVelocidad" 
                    :stars="5" 
                    :cancel="false"
                    class="text-2xl"
                  />
                  <span v-if="ratingVelocidad" class="text-xs text-gray-500 dark:text-gray-400">
                    {{ ratingVelocidad }}/5 {{ t('estrellas') }}
                  </span>
                </div>
              </div>

              <!-- Botón Evaluar -->
              <div v-if="!evaluationSent" class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  :label="t('Evaluar')" 
                  icon="pi pi-send"
                  :loading="evaluating"
                  :disabled="!ratingRespuesta || !ratingVelocidad || evaluating"
                  @click="evaluateRAG"
                  class="w-full md:w-auto"
                  severity="success"
                />
              </div>
            </div>
          </div>

          <!-- Raw Result (for debugging) -->
          <details class="bg-gray-900 dark:bg-gray-950 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-gray-700">
            <summary class="cursor-pointer text-green-400 hover:text-green-300 mb-2 flex items-center space-x-2 font-semibold">
              <i class="pi pi-code"></i>
              <span>{{ t('Ver JSON completo (debug)') }}</span>
            </summary>
            <pre class="mt-3 text-green-400 overflow-x-auto">{{ JSON.stringify(result, null, 2) }}</pre>
          </details>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-weight: 700;
  color: rgb(17 24 39);
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}

.dark .markdown-content :deep(h1),
.dark .markdown-content :deep(h2),
.dark .markdown-content :deep(h3),
.dark .markdown-content :deep(h4),
.dark .markdown-content :deep(h5),
.dark .markdown-content :deep(h6) {
  color: rgb(243 244 246);
}

.markdown-content :deep(h1) {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  line-height: 2rem;
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.markdown-content :deep(h4) {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
  color: rgb(31 41 55);
  line-height: 1.625;
}

.dark .markdown-content :deep(p) {
  color: rgb(229 231 235);
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  margin-left: 1.5rem;
  color: rgb(31 41 55);
}

.dark .markdown-content :deep(ul),
.dark .markdown-content :deep(ol) {
  color: rgb(229 231 235);
}

.markdown-content :deep(ul) {
  list-style-type: disc;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-content :deep(strong),
.markdown-content :deep(b) {
  font-weight: 700;
  color: rgb(17 24 39);
}

.dark .markdown-content :deep(strong),
.dark .markdown-content :deep(b) {
  color: rgb(243 244 246);
}

.markdown-content :deep(em),
.markdown-content :deep(i) {
  font-style: italic;
}

.markdown-content :deep(code) {
  background-color: rgb(243 244 246);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  color: rgb(31 41 55);
}

.dark .markdown-content :deep(code) {
  background-color: rgb(55 65 81);
  color: rgb(229 231 235);
}

.markdown-content :deep(pre) {
  background-color: rgb(243 244 246);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.dark .markdown-content :deep(pre) {
  background-color: rgb(31 41 55);
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid rgb(59 130 246);
  padding-left: 1rem;
  font-style: italic;
  color: rgb(55 65 75);
  margin: 1rem 0;
}

.dark .markdown-content :deep(blockquote) {
  color: rgb(209 213 219);
}

.markdown-content :deep(a) {
  color: rgb(37 99 235);
  text-decoration: underline;
}

.dark .markdown-content :deep(a) {
  color: rgb(96 165 250);
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid rgb(209 213 219);
  padding: 0.5rem 1rem;
  text-align: left;
}

.dark .markdown-content :deep(th),
.dark .markdown-content :deep(td) {
  border-color: rgb(75 85 99);
}

.markdown-content :deep(th) {
  background-color: rgb(243 244 246);
  font-weight: 700;
}

.dark .markdown-content :deep(th) {
  background-color: rgb(55 65 81);
}

.markdown-content :deep(hr) {
  border-top: 1px solid rgb(209 213 219);
  margin: 1.5rem 0;
}

.dark .markdown-content :deep(hr) {
  border-color: rgb(75 85 99);
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}
</style>

