<script setup lang='ts'>
interface RAGConfig {
  agent: string;
  model: string;
  semantic: boolean;
  bm25: boolean;
  context: boolean;
  clean_query: boolean;
  topN: number;
  num_queries: number;
  use_docs: number;
  min_count: number;
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

// Cargar AGENTS_MODELS desde variables de entorno
const agentsModelsJson = runtimeConfig.public?.AGENTS_MODELS || '{}';
let agentsModels: Record<string, string[]> = {};
try {
  agentsModels = JSON.parse(agentsModelsJson);
} catch (e) {
  console.error('Error parsing AGENTS_MODELS:', e);
  agentsModels = { openai: [], gemini: [] };
}

// Obtener valores por defecto desde variables de entorno
const defaultAgent = runtimeConfig.public?.DEFAULT_LLM_AGENT || 'gemini';
const defaultModel = runtimeConfig.public?.DEFAULT_LLM_MODEL || 'gpt-4o-mini';

// Crear opciones para agentes basadas en las claves del objeto
const agentOptions = Object.keys(agentsModels).map(agent => ({
  label: agent.charAt(0).toUpperCase() + agent.slice(1),
  value: agent
}));

// Computed para obtener los modelos del agente seleccionado
const modelOptions = computed(() => {
  const models = agentsModels[props.modelValue.agent] || [];
  return models.map(model => ({
    label: model,
    value: model
  }));
});

// Computed para el valor local que emite actualizaciones
const localConfig = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Watcher para actualizar el modelo cuando cambie el agente
watch(() => localConfig.value.agent, (newAgent) => {
  const models = agentsModels[newAgent] || [];
  const currentModel = localConfig.value.model || '';
  if (models.length > 0 && !models.includes(currentModel)) {
    const firstModel = models[0];
    if (firstModel) {
      localConfig.value = { ...localConfig.value, model: firstModel };
    } else {
      localConfig.value = { ...localConfig.value, model: defaultModel };
    }
  } else if (models.length === 0) {
    localConfig.value = { ...localConfig.value, model: defaultModel };
  }
});

// Función helper para generar IDs únicos
const getId = (name: string) => {
  return props.idPrefix ? `${props.idPrefix}${name}` : name;
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
          <label :for="getId('agent')" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <i class="pi pi-server text-gray-400 mr-2"></i>
            {{ t('Agente') }}
          </label>
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
        </div>

        <!-- Model -->
        <div class="space-y-2">
          <label :for="getId('model')" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <i class="pi pi-microchip text-gray-400 mr-2"></i>
            {{ t('Modelo') }}
          </label>
          <Select 
            :id="getId('model')" 
            v-model="localConfig.model" 
            :options="modelOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            :disabled="disabled"
            :placeholder="t('Seleccione un modelo')"
          />
        </div>

        <!-- Boolean Parameters -->
        <div class="space-y-3">
          <div class="flex items-center">
            <ToggleSwitch 
              :id="getId('semantic')" 
              v-model="localConfig.semantic" 
              :binary="true"
              :disabled="disabled"
            />
            <label :for="getId('semantic')" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
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
            <label :for="getId('bm25')" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
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
            <label :for="getId('context')" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
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
            <label :for="getId('clean_query')" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {{ t('Limpiar la consulta (sin limpieza no hay clasificación ni traducción)') }}
            </label>
          </div>
        </div>

        <!-- Numeric Parameters -->
        <div class="space-y-3">
          <div class="space-y-2">
            <label :for="getId('topN')" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <i class="pi pi-sort-numeric-up text-gray-400 mr-2"></i>
              {{ t('Número máximo de resultados de búsqueda semántica/BM25') }}
            </label>
            <InputNumber 
              :id="getId('topN')" 
              v-model="localConfig.topN" 
              class="w-full"
              :min="1"
              :max="100"
              showButtons
              :disabled="disabled"
            />
          </div>

          <div class="space-y-2">
            <label :for="getId('num_queries')" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <i class="pi pi-list text-gray-400 mr-2"></i>
              {{ t('Número de consultas alternativas a realizar') }}
            </label>
            <InputNumber 
              :id="getId('num_queries')" 
              v-model="localConfig.num_queries" 
              class="w-full"
              :min="1"
              :max="10"
              showButtons
              :disabled="disabled"
            />
          </div>

          <div class="space-y-2">
            <label :for="getId('use_docs')" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <i class="pi pi-file text-gray-400 mr-2"></i>
              {{ t('Número de documentos completos a usar') }}
            </label>
            <InputNumber 
              :id="getId('use_docs')" 
              v-model="localConfig.use_docs" 
              class="w-full"
              :min="0"
              :max="10"
              showButtons
              :disabled="disabled"
            />
          </div>

          <div class="space-y-2">
            <label :for="getId('min_count')" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <i class="pi pi-filter text-gray-400 mr-2"></i>
              {{ t('Número mínimo de apariciones de un documento para ser considerado') }}
            </label>
            <InputNumber 
              :id="getId('min_count')" 
              v-model="localConfig.min_count" 
              class="w-full"
              :min="2"
              :max="20"
              showButtons
              :disabled="disabled"
            />
          </div>
        </div>

        <!-- Notas al pie con enlaces a precios -->
        <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('Precios de modelos') }}:
            <a 
              href="https://ai.google.dev/gemini-api/docs/pricing" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-600 dark:text-blue-400 hover:underline ml-1"
            >
              Gemini
            </a>
            <span class="mx-1">•</span>
            <a 
              href="https://platform.openai.com/docs/pricing" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              OpenAI
            </a>
          </p>
        </div>
      </div>
    </template>
  </Card>
</template>

