<script lang="ts" setup>
import PageService from '~/services/pageService';

const { showMessage } = useMessages();
const pageService = new PageService();
const { t } = useI18n();

const dialogRef = inject('dialogRef') as { value: { data: { wiki: string, page: any } } };

const wiki = ref(dialogRef.value.data.wiki);
const page = ref(dialogRef.value.data.page);

const saveWiki = async () => {
  const response = await pageService.saveWiki(page.value.collection, page.value.title, wiki.value);
  if (checkLogged(response)) {
    showMessage('success', t('Guardar'), t('Entrada guardada correctamente'), 3000, 'tc');
  }
};
</script>

<template>
  <Toolbar class="p-1 mb-1">
    <template #start>
      <Button icon="pi pi-save" outlined severity="primary" @click="saveWiki()" />
    </template>
  </Toolbar>
  <div class="flex items-center gap-3 mb-2">
    <Textarea v-model="wiki" rows="20" class="flex-1" />
  </div>
</template>

<style scoped>
.p-inputtextarea {
  font-family: monospace;
  font-size: 12px;
}
</style>
