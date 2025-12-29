<script lang="ts" setup>
import PageService from '~/services/pageService';

const pageService = new PageService();
const dialog = useDialog();
const pageStore = usePageStore();

const props = defineProps({
  page: {
    type: Object,
    default: null
  }
});

const logger = useLogger();

const openEditor = async () => {
  const response = await pageService.getPageInfo(props.page.collection, props.page.title);
  if (checkLogged(response)) {
    const responseData = response?.data?.value as any;
    if (responseData?.page?.title) {
      openPage(getEditorLink(props.page.collection, responseData.page.title));
    }
  }
};
</script>

<template>
  <div class="flex items-center gap-2 p-2 border hover:shadow-md transition-all duration-200" style="border-color: var(--surface-border);">
    <!-- Botón para abrir página externa -->
    <Button
      icon="pi pi-external-link"
      severity="success"
      size="small"
      text
      rounded
      :aria-label="`Abrir ${page.title} en nueva ventana`"
      v-tooltip.top="'Abrir en nueva ventana'"
      @click="openPage(getPageLink(page.collection, page.title))"
    />
    
    <!-- Botón para editar página -->
    <Button
      icon="pi pi-file-edit"
      severity="danger"
      size="small"
      text
      rounded
      :aria-label="`Editar ${page.title}`"
      v-tooltip.top="'Editar página'"
      @click="openEditor()"
    />
    
    <!-- Título de la página como enlace principal -->
    <button
      class="flex-1 text-left font-semibold hover:text-blue-600 transition-colors duration-200 border-b border-dotted hover:border-blue-500 pb-1"
      style="color: var(--text-color); border-color: var(--surface-border);"
      @click="pageStore.loadPage(page.collection, page.title)"
      :aria-label="`Cargar página ${page.title}`"
    >
      {{ page.title }}
    </button>
    
    <!-- Botón para edición rápida -->
    <Button
      icon="pi pi-pencil"
      severity="primary"
      size="small"
      text
      rounded
      :aria-label="`Edición rápida de ${page.title}`"
      v-tooltip.top="'Edición rápida'"
      @click="editOnFly(dialog, { collection: page.collection, title: page.title })"
    />
  </div>
</template>
