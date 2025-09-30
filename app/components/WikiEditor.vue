<script lang="ts" setup>
import PageService from '~/services/pageService';

const { showMessage } = useMessages();
const pageService = new PageService();
const { t } = useI18n();

const dialogRef = inject('dialogRef') as { value: { data: { wiki: string, page: any } } };

const wiki = ref(dialogRef.value.data.wiki);
const page = ref(dialogRef.value.data.page);

// Computed properties para contadores
const characterCount = computed(() => {
  return wiki.value ? wiki.value.length : 0;
});

const wordCount = computed(() => {
  if (!wiki.value || wiki.value.trim() === '') return 0;
  return wiki.value.trim().split(/\s+/).filter(word => word.length > 0).length;
});

const lineCount = computed(() => {
  if (!wiki.value) return 0;
  return wiki.value.split('\n').length;
});

const saveWiki = async () => {
  const response = await pageService.saveWiki(page.value.collection, page.value.title, wiki.value);
  if (checkLogged(response)) {
    showMessage('success', t('Guardar'), t('Entrada guardada correctamente'), 3000, 'tc');
  }
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Header con botón de guardar -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
      <h3 class="text-lg font-semibold text-gray-800">
        <i class="pi pi-file-edit text-blue-600 mr-2"></i>
        {{ t('Editor de Wiki') }}
      </h3>
      <button
        @click="saveWiki()"
        class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {{ t('Guardar') }}
      </button>
    </div>
    
    <!-- Área de edición -->
    <div class="p-4">
      <div class="space-y-3">
        <label class="block text-sm font-medium text-gray-700">
          {{ t('Contenido Wiki') }}
        </label>
        <textarea
          v-model="wiki"
          rows="20"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical font-mono text-sm leading-relaxed"
          :placeholder="t('Escribe el contenido wiki aquí...')"
        />
      </div>
    </div>
    
    <!-- Footer con contadores -->
    <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-1">
            <i class="pi pi-file text-gray-400"></i>
            <span class="font-medium">{{ formatIntNumber(characterCount) }}</span>
            <span class="text-gray-500">{{ t('caracteres') }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <i class="pi pi-align-left text-gray-400"></i>
            <span class="font-medium">{{ formatIntNumber(wordCount) }}</span>
            <span class="text-gray-500">{{ t('palabras') }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <i class="pi pi-list text-gray-400"></i>
            <span class="font-medium">{{ formatIntNumber(lineCount) }}</span>
            <span class="text-gray-500">{{ t('líneas') }}</span>
          </div>
        </div>
        <div class="text-xs text-gray-500">
          {{ t('Actualizado en tiempo real') }}
        </div>
      </div>
    </div>
  </div>
</template>
