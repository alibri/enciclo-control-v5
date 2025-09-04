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

const openEditor = async () => {
  const response = await pageService.getPageInfo(props.page.collection, props.page.title);
  console.log(response.data);
  if (checkLogged(response)) {
    openPage(getEditorLink(props.page.collection, response.data.value.page.title));
  }
};
</script>

<template>
  <span>
    <a style="cursor: pointer;" @click="openPage(getPageLink(page.collection, page.title))"><i class="pi pi-external-link bg-green-500 text-white p-1 rounded-full" /></a>
    <a style="cursor: pointer;" class="ml-1" @click="openEditor()"><i class="pi pi-file-edit bg-red-500 text-white p-1 rounded-full" /></a>
    <a style="cursor: pointer;" class="font-bold border-none border-b border-dotted ml-1" @click="pageStore.loadPage(page.collection, page.title)">
      <strong>{{ page.title }}</strong>
    </a>
    <a style="cursor: pointer;" @click="editOnFly(dialog, page as { collection: string, title: string })"><i class="pi pi-pencil bg-blue-500 text-white p-1 rounded-full ml-1" /></a>
  </span>
</template>
