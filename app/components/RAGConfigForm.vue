<script setup lang='ts'>
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

interface RAGConfig {
  agent: string;
  model: string;
  collection: string;
  classification: string;
  semantic: boolean;
  bm25: boolean;
  context: boolean;
  clean_query: boolean;
  topN: number;
  num_queries: number;
  use_docs: number;
  min_count: number;
  temperature: number;
  tono_audiencia: string;
}

interface Props {
  modelValue: RAGConfig;
  title?: string;
  iconColor?: string;
  idPrefix?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Configuración',
  iconColor: 'text-green-500',
  idPrefix: '',
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: RAGConfig];
}>();

const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();

// Cargar AGENTS_MODELS desde archivo JSON
const { data: agentsModelsData } = useFetch<AgentsModels>('/agents-models.json', {
  default: () => ({ openai: {}, gemini: {} }),
  server: false
});

const agentsModels = computed(() => agentsModelsData.value || { openai: {}, gemini: {} });

// Obtener valores por defecto desde variables de entorno
const defaultAgent = runtimeConfig.public?.DEFAULT_LLM_AGENT || 'gemini';
const defaultModel = runtimeConfig.public?.DEFAULT_LLM_MODEL || 'gemini-2.0-flash';
const defaultCollection: string = String(runtimeConfig.public?.COLLECTION_NAME || 'chunks');

// Crear opciones para agentes basadas en las claves del objeto
const agentOptions = computed(() => {
  return Object.keys(agentsModels.value).map(agent => ({
    label: agent.charAt(0).toUpperCase() + agent.slice(1),
    value: agent
  }));
});

// Computed para obtener los modelos del agente seleccionado
const modelOptions = computed(() => {
  const agentModels = agentsModels.value[props.modelValue.agent] || {};
  const modelNames = Object.keys(agentModels);
  return modelNames.map(model => {
    const modelInfo = agentModels[model];
    const inputPrice = modelInfo?.input?.toFixed(2) || '0.00';
    const outputPrice = modelInfo?.output?.toFixed(2) || '0.00';
    return {
      label: `${model} (In: $${inputPrice}/1M, Out: $${outputPrice}/1M)`,
      value: model,
      inputPrice,
      outputPrice
    };
  });
});

// Opciones para la colección
const collectionOptions = [
  { label: 'Actual', value: 'chunks' },
  { label: 'Nuevo', value: 'chunks_new' }
];

// Opciones para la clasificación
const classificationOptions = [
  { label: '[automática]', value: 'auto' },
  { label: 'pregunta general', value: 'pregunta general' },
  { label: 'definición', value: 'definición' },
  { label: 'biografía/identidad', value: 'biografía/identidad' },
  { label: 'hecho puntual (lugar/fecha/causa)', value: 'hecho puntual (lugar/fecha/causa)' },
  { label: 'dato/medida/lista corta', value: 'dato/medida/lista corta' },
  { label: 'lista/enumeración', value: 'lista/enumeración' },
  { label: 'explicación/tema', value: 'explicación/tema' },
  { label: 'opinión/preferencia personal', value: 'opinión/preferencia personal' },
  { label: 'comparación/ordenación', value: 'comparación/ordenación' },
  { label: 'geografía (capital/localización)', value: 'geografía (capital/localización)' },
  { label: 'verificación/controversia', value: 'verificación/controversia' },
  { label: 'instrucción/encargo', value: 'instrucción/encargo' },
  { label: 'tópico/palabras clave', value: 'tópico/palabras clave' },
  { label: 'declaración/tema general', value: 'declaración/tema general' }
];

// Opciones para el tono de audiencia
const tonoAudienciaOptions = [
  { label: 'INFANTIL', value: 'INFANTIL' },
  { label: 'PRIMARIA', value: 'PRIMARIA' },
  { label: 'SECUNDARIA', value: 'SECUNDARIA' },
  { label: 'BACHILLERATO', value: 'BACHILLERATO' },
  { label: 'UNIVERSIDAD/PROFESIONAL', value: 'UNIVERSIDAD/PROFESIONAL' },
  { label: 'REFUERZO/INCLUSIVA', value: 'REFUERZO/INCLUSIVA' },
  { label: 'TÉCNICO_APLICADO', value: 'TÉCNICO_APLICADO' }
];



// Computed para el valor local que emite actualizaciones
const localConfig = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Watcher para actualizar el modelo cuando cambie el agente
watch(() => localConfig.value.agent, (newAgent) => {
  const agentModels = agentsModels.value[newAgent] || {};
  const modelNames = Object.keys(agentModels);
  const currentModel = localConfig.value.model || defaultModel;
  if (modelNames.length > 0 && !modelNames.includes(currentModel)) {
    const firstModel = modelNames[0];
    if (firstModel) {
      localConfig.value = { ...localConfig.value, model: firstModel };
    } else {
      localConfig.value = { ...localConfig.value, model: defaultModel };
    }
  } else if (modelNames.length === 0) {
    localConfig.value = { ...localConfig.value, model: defaultModel };
  }
});

// Watcher para establecer el valor por defecto de la colección
watch(() => localConfig.value.collection, (newCollection) => {
  if (!newCollection || newCollection === '') {
    localConfig.value = { ...localConfig.value, collection: defaultCollection };
  }
}, { immediate: true });

// Watcher para establecer el valor por defecto del tono de audiencia
watch(() => localConfig.value.tono_audiencia, (newTonoAudiencia) => {
  if (!newTonoAudiencia || newTonoAudiencia === '') {
    localConfig.value = { ...localConfig.value, tono_audiencia: 'UNIVERSIDAD/PROFESIONAL' };
  }
}, { immediate: true });

// Función helper para generar IDs únicos
const getId = (name: string) => {
  return props.idPrefix ? `${props.idPrefix}${name}` : name;
};

// Función helper para obtener la opción completa del modelo por su valor
const getModelOption = (value: string) => {
  return modelOptions.value.find(option => option.value === value);
};
</script>

<template>
  <Card>
    <template #title>
      <div class="flex items-center space-x-2">
        <i :class="['pi pi-cog', iconColor]"></i>
        <span>{{ t(title) }}</span>
      </div>
    </template>
    <template #content>
      <div class="space-y-4">
        <!-- Agent -->
        <div class="space-y-2">
          <IftaLabel>
          <Select 
            :id="getId('agent')" 
            v-model="localConfig.agent" 
            :options="agentOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            :disabled="disabled"
            :placeholder="t('Seleccione un agente')"
          />
          <label :for="getId('agent')" class="block text-sm font-medium" style="color: var(--text-color);">
            <i class="pi pi-server text-gray-400 mr-2"></i>
            {{ t('Agente') }}
          </label>
          </IftaLabel>
        </div>

        <!-- Model -->
        <div class="space-y-2">
          <IftaLabel>
          <Select 
            :id="getId('model')" 
            v-model="localConfig.model" 
            :options="modelOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            :disabled="disabled"
            :placeholder="t('Seleccione un modelo')"
          >
            <template #option="slotProps">
              <div>
                <span class="font-bold">{{ slotProps.option.value }}</span>
                <span> (</span>
                <span class="text-green-600 ">In: ${{ slotProps.option.inputPrice }}/1M</span>
                <span>, </span>
                <span class="text-blue-600 ">Out: ${{ slotProps.option.outputPrice }}/1M</span>
                <span>)</span>
              </div>
            </template>
            <template #value="slotProps">
              <div v-if="slotProps.value">
                <span class="font-bold">{{ slotProps.value }}</span>
                <span v-if="getModelOption(slotProps.value)"> (</span>
                <span v-if="getModelOption(slotProps.value)" class="text-green-600 ">In: ${{ getModelOption(slotProps.value)?.inputPrice }}/1M</span>
                <span v-if="getModelOption(slotProps.value)">, </span>
                <span v-if="getModelOption(slotProps.value)" class="text-blue-600 ">Out: ${{ getModelOption(slotProps.value)?.outputPrice }}/1M</span>
                <span v-if="getModelOption(slotProps.value)">)</span>
              </div>
              <span v-else>{{ slotProps.placeholder }}</span>
            </template>
          </Select>
          <label :for="getId('model')" class="block text-sm font-medium" style="color: var(--text-color);">
            <i class="pi pi-microchip text-gray-400 mr-2"></i>
            {{ t('Modelo') }}
          </label>
        </IftaLabel>
        </div>
        <div class="space-y-2">
          <label :for="getId('temperature')" class="block text-sm font-medium" style="color: var(--text-color);">
            <i class="pi pi-sliders-h text-gray-400 mr-2"></i>
            {{ t('Temperatura') }}
            <span class="ml-2" style="color: var(--text-color-secondary);">({{ localConfig.temperature }})</span>
          </label>
          <Slider 
            :id="getId('temperature')" 
            v-model="localConfig.temperature" 
            :min="0"
            :max="2"
            :step="0.1"
            class="w-full"
            :disabled="disabled"
          />
        </div>

        <!-- Collection -->
        <div class="space-y-2">
          <IftaLabel>
            <Select 
            :id="getId('collection')" 
            v-model="localConfig.collection" 
            :options="collectionOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            :disabled="disabled"
            :placeholder="t('Seleccione chunks')"
          />
          <label :for="getId('collection')" class="block text-sm font-medium" style="color: var(--text-color);">
            <i class="pi pi-database text-gray-400 mr-2"></i>
            {{ t('Chunks') }}
          </label>
          </IftaLabel>
        </div>

        <!-- Classification -->
        <div class="space-y-2">
          <IftaLabel>
          <Select 
            :id="getId('classification')" 
            v-model="localConfig.classification" 
            :options="classificationOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            :disabled="disabled"
            :placeholder="t('Seleccione una clasificación')"
          />
          <label :for="getId('classification')" class="block text-sm font-medium" style="color: var(--text-color);">
            <i class="pi pi-tags text-gray-400 mr-2"></i>
            {{ t('Clasificación') }}
          </label>

        </IftaLabel>
        </div>

        <!-- Tono de Audiencia -->
        <div class="space-y-2">
          <IftaLabel>
          <Select 
            :id="getId('tono_audiencia')" 
            v-model="localConfig.tono_audiencia" 
            :options="tonoAudienciaOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            :disabled="disabled"
            :placeholder="t('Seleccione el tono de audiencia')"
          />
          <label :for="getId('tono_audiencia')" class="block text-sm font-medium" style="color: var(--text-color);">
            <i class="pi pi-users text-gray-400 mr-2"></i>
            {{ t('Tono de Audiencia') }}
          </label>
        </IftaLabel>
        </div>

        <!-- Advanced Parameters Accordion -->
        <Accordion :activeIndex="null">
          <AccordionTab>
            <template #header>
              <div class="flex items-center space-x-2">
                <i class="pi pi-sliders-h text-gray-400"></i>
                <span>{{ t('Parámetros avanzados') }}</span>
              </div>
            </template>
            <div class="space-y-4">
              <!-- Boolean Parameters -->
              <div class="space-y-3">
                <div class="flex items-center">
                  <ToggleSwitch 
                    :id="getId('semantic')" 
                    v-model="localConfig.semantic" 
                    :binary="true"
                    :disabled="disabled"
                  />
                  <label :for="getId('semantic')" class="ml-2 text-sm ">
                    {{ t('Buscar en la base de datos semántica') }}
                  </label>
                </div>

                <div class="flex items-center">
                  <ToggleSwitch 
                    :id="getId('bm25')" 
                    v-model="localConfig.bm25" 
                    :binary="true"
                    :disabled="disabled"
                  />
                  <label :for="getId('bm25')" class="ml-2 text-sm ">
                    {{ t('Buscar en la base de datos BM25 (texto plano)') }}
                  </label>
                </div>

                <div class="flex items-center">
                  <ToggleSwitch 
                    :id="getId('context')" 
                    v-model="localConfig.context" 
                    :binary="true"
                    :disabled="disabled"
                  />
                  <label :for="getId('context')" class="ml-2 text-sm ">
                    {{ t('Añadir contexto a los resultados') }}
                  </label>
                </div>

                <div class="flex items-center">
                  <ToggleSwitch 
                    :id="getId('clean_query')" 
                    v-model="localConfig.clean_query" 
                    :binary="true"
                    :disabled="disabled"
                  />
                  <label :for="getId('clean_query')" class="ml-2 text-sm ">
                    {{ t('Limpiar la consulta (sin limpieza no hay clasificación ni traducción)') }}
                  </label>
                </div>
              </div>

              <!-- Numeric Parameters -->
              <div class="space-y-3">
                <div class="space-y-2">
                  <IftaLabel>
                  <InputNumber 
                    :id="getId('topN')" 
                    v-model="localConfig.topN" 
                    class="w-full"
                    :min="1"
                    :max="100"
                    showButtons
                    :disabled="disabled"
                  />
                  <label :for="getId('topN')" class="block text-sm font-medium" style="color: var(--text-color);">
                    <i class="pi pi-sort-numeric-up text-gray-400 mr-2"></i>
                    {{ t('Número máximo de resultados de búsqueda semántica/BM25') }}
                  </label>
                </IftaLabel>
                </div>

                <div class="space-y-2">
                  <IftaLabel>
                  <InputNumber 
                    :id="getId('num_queries')" 
                    v-model="localConfig.num_queries" 
                    class="w-full"
                    :min="1"
                    :max="10"
                    showButtons
                    :disabled="disabled"
                  />
                  <label :for="getId('num_queries')" class="block text-sm font-medium" style="color: var(--text-color);">
                    <i class="pi pi-list text-gray-400 mr-2"></i>
                    {{ t('Número de consultas alternativas a realizar') }}
                  </label>
                </IftaLabel>
                </div>

                <div class="space-y-2">
                  <IftaLabel>
                  <InputNumber 
                    :id="getId('use_docs')" 
                    v-model="localConfig.use_docs" 
                    class="w-full"
                    :min="-1"
                    :max="10"
                    showButtons
                    :disabled="disabled"
                  />
                  <label :for="getId('use_docs')" class="block text-sm font-medium" style="color: var(--text-color);">
                    <i class="pi pi-file text-gray-400 mr-2"></i>
                    {{ t('Número de documentos completos a usar') }}
                  </label>
                </IftaLabel>
                </div>

                <div class="space-y-2">
                  <IftaLabel>
                  <InputNumber 
                    :id="getId('min_count')" 
                    v-model="localConfig.min_count" 
                    class="w-full"
                    :min="-1"
                    :max="20"
                    showButtons
                    :disabled="disabled"
                  />
                  <label :for="getId('min_count')" class="block text-sm font-medium" style="color: var(--text-color);">
                    <i class="pi pi-filter text-gray-400 mr-2"></i>
                    {{ t('Número mínimo de apariciones de un documento para ser considerado') }}
                  </label>
                </IftaLabel>
                </div>
              </div>
            </div>
          </AccordionTab>
        </Accordion>

        <!-- Notas al pie con enlaces a precios -->
        <div class="mt-6 pt-4">
          <p class="text-xs  text-center">
            {{ t('Precios de modelos') }}:
            <a 
              href="https://ai.google.dev/gemini-api/docs/pricing" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-600  hover:underline ml-1"
            >
              Gemini
            </a>
            <span class="mx-1">•</span>
            <a 
              href="https://platform.openai.com/docs/pricing" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-600  hover:underline"
            >
              OpenAI
            </a>
          </p>
        </div>
      </div>
    </template>
  </Card>
</template>

