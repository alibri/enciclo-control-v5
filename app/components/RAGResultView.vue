<script setup lang='ts'>
import { formatStringPre } from '~/utils/format';
import { getPageLink } from '~/utils/openExternal';
import TestService from '~/services/testService';
import { getApiUrl } from '~/utils/api';
import { useAuthStore } from '~/stores/auth';
import { storeToRefs } from 'pinia';
import 'flag-icons/css/flag-icons.min.css';

interface ModelInfo {
  input: number;
  output: number;
  max_tokens: number;
}

interface AgentsModels {
  [agent: string]: {
    [model: string]: ModelInfo;
  };
}

interface Props {
  result: any;
  config?: any;
  showEvaluation?: boolean;
  showJson?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showEvaluation: true,
  showJson: true
});
const emit = defineEmits<{
  evaluated: [evaluationId: number]
}>();

const { t } = useI18n();
const { showMessage, removeGroup } = useMessages();

const testService = new TestService();
const printing = ref(false);
const { session_id } = storeToRefs(useAuthStore());

// Cargar precios de modelos desde archivo JSON
const { data: agentsModelsData } = useFetch<AgentsModels>('/agents-models.json', {
  default: () => ({ openai: {}, gemini: {} }),
  server: false
});

const agentsModels = computed(() => agentsModelsData.value || { openai: {}, gemini: {} });

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

// Obtener idiomas disponibles de las traducciones
const availableLanguages = computed(() => {
  const translations = props.result?.translations || {};
  const languages: string[] = [];
  
  // Buscar idiomas en las traducciones directas (content)
  Object.keys(translations).forEach(key => {
    if (key !== 'titular' && key !== 'sabias' && typeof translations[key] === 'string') {
      languages.push(key);
    }
  });
  
  return languages;
});

// Función para obtener la bandera del idioma
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

// Computed para calcular el coste de los tokens
const tokenCost = computed(() => {
  if (!props.result?.usage || !props.result?.agent || !props.result?.model) {
    return null;
  }

  const agent = props.result.agent;
  let model = props.result.model;
  model = model.split('/')[1];

  console.log(agent, model);
  const modelInfo = agentsModels.value[agent]?.[model];

  if (!modelInfo) {
    return null;
  }

  const promptTokens = props.result.usage.prompt_tokens || 0;
  const completionTokens = props.result.usage.completion_tokens || 0;

  // Los precios están por millón de tokens
  const promptCost = (promptTokens / 1_000_000) * modelInfo.input;
  const completionCost = (completionTokens / 1_000_000) * modelInfo.output;
  const totalCost = promptCost + completionCost;

  return {
    promptCost,
    completionCost,
    totalCost,
    modelInfo
  };
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

// Función para generar PDF del componente
const generarPDF = async () => {
  if (!props.result) {
    showMessage('error', t('Error'), t('No hay resultado para exportar'));
    return;
  }

  printing.value = true;
  showMessage('info', t('Generando PDF'), t('Por favor espere...'), -1, 'pdf');

  try {
    // Obtener la URL de la API y el session_id
    const apiBaseUrl = getApiUrl();
    const token = session_id.value || useCookie('token').value;
    
    if (!token) {
      throw new Error(t('No se encontró la sesión'));
    }

    // Preparar los datos a enviar (JSON completo del resultado)
    const data = {
      session_id: token,
      data: props.result
    };

    // Llamar al endpoint exportchat
    const response = await fetch(`${apiBaseUrl}/exportchat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      // Intentar leer el mensaje de error si es JSON
      let errorMessage = t('Error al generar el PDF');
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `${t('Error')}: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Obtener el blob del PDF
    const blob = await response.blob();
    
    // Crear un enlace temporal para descargar el PDF
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generar nombre del archivo
    const query = props.result?.query || t('consulta');
    const filename = `${t('resultado_consulta')}_${query.substring(0, 50)}_${new Date().toISOString().split('T')[0]}.pdf`;
    link.setAttribute('download', filename);
    
    // Descargar el archivo
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Liberar la URL del objeto
    window.URL.revokeObjectURL(url);

    // Mostrar mensaje de éxito
    showMessage('success', t('Éxito'), t('PDF generado correctamente'), 3000);
    removeGroup('pdf');

  } catch (error: any) {
    console.error('Error generando PDF:', error);
    showMessage('error', t('Error'), error?.message || t('No se pudo generar el PDF'), -1);
    removeGroup('pdf');
  } finally {
    printing.value = false;
  }
};
</script>

<template>
  <div v-if="result" class="mt-6 space-y-6">
    <!-- Botón para generar PDF -->
    <div class="flex justify-start gap-2 no-print">
      <Button
        :label="t('Generar PDF')"
        icon="pi pi-file-pdf"
        @click="generarPDF"
        :loading="printing"
        severity="danger"
        class="px-4 py-2"
      />
    </div>
    
    <!-- Main Content Card -->
    <div class="print-area">
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
          <div class="flex items-center gap-4">
            <!-- Like -->
            <div v-if="result.like !== null && result.like !== undefined" class="flex items-center">
              <div v-if="result.like === 1" class="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <i class="pi pi-thumbs-up text-green-600 dark:text-green-400 text-xl"></i>
                <span class="text-sm font-semibold text-green-700 dark:text-green-300">{{ t('Me gusta') }}</span>
              </div>
              <div v-else-if="result.like === 0" class="flex items-center space-x-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <i class="pi pi-thumbs-down text-red-600 dark:text-red-400 text-xl"></i>
                <span class="text-sm font-semibold text-red-700 dark:text-red-300">{{ t('No me gusta') }}</span>
              </div>
            </div>
            
            <!-- Counter -->
            <div v-if="result.counter !== null && result.counter !== undefined" class="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <i class="pi pi-mouse-pointer text-blue-600 dark:text-blue-400"></i>
              <span class="text-sm font-semibold text-blue-700 dark:text-blue-300">{{ formatIntNumber(result.counter) }}</span>
              <span class="text-xs text-blue-600 dark:text-blue-400">{{ t('clicks') }}</span>
            </div>
            
            <!-- Short URL -->
            <div v-if="result.short_url" class="flex items-center no-print">
              <a 
                :href="result.short_url" 
                target="_blank"
                class="flex items-center space-x-2 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
              >
                <i class="pi pi-external-link text-indigo-600 dark:text-indigo-400"></i>
                <span class="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{{ t('Ver enlace') }}</span>
              </a>
            </div>
            
            <!-- Tiempo total -->
            <div v-if="result.times?.total" class="text-right">
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('Tiempo total') }}</div>
              <div class="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {{ typeof result.times.total === 'number' ? result.times.total.toFixed(2) : result.times.total }}s
              </div>
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
            <div v-if="contentHtml || (result.translations && availableLanguages.length > 0)" class="space-y-4">
              <!-- Contenido Principal -->
              <div v-if="result.content || result.response" class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="flex items-center space-x-2 mb-4">
                  <template v-if="getLanguageFlag('es').type === 'fi'">
                    <span class="fi fi-es w-5 h-5"></span>
                  </template>
                  <template v-else>
                    <img :src="getLanguageFlag('es').value" alt="es" class="w-5 h-5 object-contain" />
                  </template>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {{ t('Principal') }} (ES)
                  </h3>
                </div>
                <div class="prose prose-lg dark:prose-invert max-w-none markdown-content">
                  <div 
                    v-html="formatMarkdown(result.content || result.response)" 
                    class="text-gray-800 dark:text-gray-200 leading-relaxed"
                  ></div>
                </div>
              </div>
              
              <!-- Traducciones -->
              <div v-for="lang in availableLanguages" :key="lang" 
                   class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="flex items-center space-x-2 mb-4">
                  <template v-if="getLanguageFlag(lang).type === 'fi'">
                    <span :class="'fi fi-' + getLanguageFlag(lang).value" class="w-5 h-5"></span>
                  </template>
                  <template v-else>
                    <img :src="getLanguageFlag(lang).value" :alt="lang" class="w-5 h-5 object-contain" />
                  </template>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {{ lang.toUpperCase() }}
                  </h3>
                </div>
                <div class="prose prose-lg dark:prose-invert max-w-none markdown-content">
                  <div 
                    v-html="formatMarkdown(result.translations?.[lang])" 
                    class="text-gray-800 dark:text-gray-200 leading-relaxed"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Sabías que -->
            <div v-if="result.sabias || (result.translations?.sabias && availableLanguages.length > 0)" class="space-y-4">
              <!-- Sabías que Principal -->
              <div v-if="result.sabias" class="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-5 rounded-xl border-l-4 border-amber-500">
                <div class="flex items-start space-x-3">
                  <i class="pi pi-lightbulb text-amber-600 dark:text-amber-400 text-xl mt-1"></i>
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-3">
                      <template v-if="getLanguageFlag('es').type === 'fi'">
                        <span class="fi fi-es w-5 h-5"></span>
                      </template>
                      <template v-else>
                        <img :src="getLanguageFlag('es').value" alt="es" class="w-5 h-5 object-contain" />
                      </template>
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {{ t('Principal') }} (ES)
                      </h3>
                    </div>
                    <h3 v-if="result.titular" class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                      <span class="mr-2">{{ result.titular }}</span>
                    </h3>
                    <div 
                      v-html="formatMarkdown(result.sabias)" 
                      class="prose prose-lg dark:prose-invert max-w-none markdown-content text-gray-700 dark:text-gray-300 italic leading-relaxed"
                    ></div>
                  </div>
                </div>
              </div>
              
              <!-- Traducciones de Sabías que -->
              <template v-for="lang in availableLanguages" :key="lang">
                <div v-if="result.translations?.sabias?.[lang]"
                     class="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-5 rounded-xl border-l-4 border-amber-500">
                <div class="flex items-start space-x-3">
                  <i class="pi pi-lightbulb text-amber-600 dark:text-amber-400 text-xl mt-1"></i>
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-3">
                      <template v-if="getLanguageFlag(lang).type === 'fi'">
                        <span :class="'fi fi-' + getLanguageFlag(lang).value" class="w-5 h-5"></span>
                      </template>
                      <template v-else>
                        <img :src="getLanguageFlag(lang).value" :alt="lang" class="w-5 h-5 object-contain" />
                      </template>
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {{ lang.toUpperCase() }}
                      </h3>
                    </div>
                    <h3 v-if="result.translations?.titular?.[lang]" class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                      <span class="mr-2">{{ result.translations.titular[lang] }}</span>
                    </h3>
                    <div 
                      v-html="formatMarkdown(result.translations.sabias[lang])" 
                      class="prose prose-lg dark:prose-invert max-w-none markdown-content text-gray-700 dark:text-gray-300 italic leading-relaxed"
                    ></div>
                  </div>
                </div>
                </div>
              </template>
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
                <div class="flex items-center space-x-3">
                  <span class="flex-shrink-0 w-7 h-7 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
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
                <div v-if="source.title" class="mb-2">
                  <a 
                    v-if="source.collection && (source.friendly || source.title)"
                    :href="getPageLink(source.collection, source.friendly || source.title)" 
                    target="_blank"
                    class="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 text-lg block mb-1 hover:underline flex items-center"
                  >
                    <i class="pi pi-external-link mr-2 text-sm"></i>
                    {{ source.title }}
                  </a>
                  <div v-else class="font-bold text-gray-900 dark:text-gray-100 text-lg">
                    {{ source.title }}
                  </div>
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

          <!-- Related -->
          <div v-if="result.related && result.related.length > 0" class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-2 mb-4">
              <i class="pi pi-link text-indigo-600 dark:text-indigo-400"></i>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ t('Relacionados') }}
              </h3>
              <span class="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                {{ result.related.length }}
              </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(item, index) in result.related" :key="index" 
                   class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-indigo-500 hover:shadow-md transition-all">
                <div class="flex items-start gap-3">
                  <div v-if="item.image" class="flex-shrink-0">
                    <img :src="item.image" :alt="item.title" class="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div v-if="item.title" class="mb-2">
                      <a 
                        :href="getPageLink(item.collection, item.friendly || item.title)" 
                        target="_blank"
                        class="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-base block mb-1 hover:underline"
                      >
                        {{ item.title }}
                      </a>
                    </div>
                    <div v-if="item.collection" class="mb-2">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
                        <i class="pi pi-folder mr-1"></i>{{ item.collection }}
                      </span>
                      <span v-if="item.weight" class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                        <i class="pi pi-sort-amount-down mr-1"></i>{{ t('Peso') }}: {{ item.weight }}
                      </span>
                    </div>
                    <div v-if="item.description" class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                      {{ item.description }}
                    </div>
                    <div v-if="item.metadata && item.metadata !== '{}'" class="mt-2">
                      <details class="text-xs">
                        <summary class="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                          {{ t('Ver metadata') }}
                        </summary>
                        <pre class="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">{{ typeof item.metadata === 'string' ? item.metadata : JSON.stringify(item.metadata, null, 2) }}</pre>
                      </details>
                    </div>
                  </div>
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
                        <div v-if="doc.title" class="mb-1">
                          <a 
                            v-if="doc.collection && (doc.friendly || doc.title)"
                            :href="getPageLink(doc.collection, doc.friendly || doc.title)" 
                            target="_blank"
                            class="font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 text-base block hover:underline flex items-center"
                          >
                            <i class="pi pi-external-link mr-2 text-sm"></i>
                            {{ doc.title }}
                          </a>
                          <div v-else class="font-bold text-gray-900 dark:text-gray-100 text-base">
                            {{ doc.title }}
                          </div>
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
                  <div class="flex flex-col items-end">
                    <span class="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-semibold">
                      {{ result.usage.prompt_tokens?.toLocaleString() || 0 }}
                    </span>
                    <span v-if="tokenCost" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ${{ tokenCost.promptCost.toFixed(6) }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <i class="pi pi-arrow-left mr-2 text-blue-600"></i>{{ t('Completación') }}
                  </span>
                  <div class="flex flex-col items-end">
                    <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold">
                      {{ result.usage.completion_tokens?.toLocaleString() || 0 }}
                    </span>
                    <span v-if="tokenCost" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ${{ tokenCost.completionCost.toFixed(6) }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border-2 border-emerald-200 dark:border-emerald-800">
                  <span class="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                    <i class="pi pi-calculator mr-2"></i>{{ t('Total') }}
                  </span>
                  <div class="flex flex-col items-end">
                    <span class="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg text-sm font-bold shadow-md">
                      {{ result.usage.total_tokens?.toLocaleString() || 0 }}
                    </span>
                    <span v-if="tokenCost" class="text-xs text-gray-700 dark:text-white/90 mt-1 font-semibold">
                      ${{ tokenCost.totalCost.toFixed(6) }}
                    </span>
                  </div>
                </div>
                <div v-if="tokenCost && result.model" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border-l-4 border-yellow-500">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <i class="pi pi-dollar mr-2 text-yellow-600"></i>{{ t('Coste Total') }}
                    </span>
                    <span class="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg text-lg font-bold shadow-md">
                      ${{ tokenCost.totalCost.toFixed(6) }}
                    </span>
                  </div>
                  <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                    {{ t('Modelo') }}: {{ result.model }} ({{ t('Input') }}: ${{ tokenCost.modelInfo.input }}/1M, {{ t('Output') }}: ${{ tokenCost.modelInfo.output }}/1M)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Evaluación -->
          <div v-if="showEvaluation" class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 no-print">
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
          <details v-if="showJson" class="bg-gray-900 dark:bg-gray-950 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-gray-700 no-print">
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

.dark .custom-tabs :deep(.p-tabs-nav) {
  background: #1f2937;
  border-bottom-color: #374151;
}

.dark .custom-tabs :deep(.p-tabs-nav li .p-tabs-nav-link) {
  color: #9ca3af;
}

.dark .custom-tabs :deep(.p-tabs-nav li .p-tabs-nav-link:hover) {
  background: #374151;
  color: #d1d5db;
}

.dark .custom-tabs :deep(.p-tabs-nav li.p-highlight .p-tabs-nav-link) {
  background: #3b82f6;
  color: white;
}

.dark .custom-tabs :deep(.p-tabs-panels) {
  background: #1f2937;
  border-color: #374151;
}

@media print {
  .no-print {
    display: none !important;
  }

  /* Clases específicas para PDF */
  .no-pdf {
    display: none !important;
  }

  .pdf-only {
    display: block !important;
  }

  /* Mejorar la apariencia de la impresión */
  .print-area {
    box-shadow: none !important;
  }

  /* Mejorar la legibilidad del texto */
  body {
    color: #000 !important;
    background: #fff !important;
  }

  /* Estilos específicos para las imágenes en impresión */
  .print-area img {
    max-width: 100% !important;
    height: auto !important;
    display: block !important;
    margin: 0 auto !important;
    break-inside: avoid;
  }

  /* Asegurar que las tablas se impriman correctamente */
  table {
    break-inside: avoid;
  }

  /* Evitar cortes de texto en elementos importantes */
  .print-area > *,
  .print-area .space-y-6 > *,
  .print-area .space-y-4 > * {
    break-inside: avoid;
    orphans: 3;
    widows: 3;
  }

  /* Proteger párrafos y bloques de contenido */
  p,
  .markdown-content,
  .prose,
  .markdown-content > * {
    break-inside: avoid;
    orphans: 3;
    widows: 3;
  }

  /* Proteger secciones de contenido */
  .bg-white,
  .bg-gray-50,
  .bg-gradient-to-r {
    break-inside: avoid;
  }

  /* Mejorar la visualización de enlaces en PDF */
  a.print-link {
    color: #000 !important;
    text-decoration: underline;
  }
}
</style>

