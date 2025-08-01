<script lang="ts" setup>
import PageService from '~/services/pageService';

const { t } = useI18n();
const { exportDataGeneric } = useUtilsData();
const pageService = new PageService();

defineProps({
  rows: {
    type: Number,
    default: 5
  },

  value: {
    type: Array,
    default: null
  },

  paginator: {
    type: Boolean,
    default: false
  }
});

const dt = ref();
const exportCSV = () => {
  dt.value.exportCSV();
};

const exportWiki = async () => {
  await exportDataGeneric(t('Exportando páginas wiki'), exportFunction);
};

const exportFunction = async () => {
  console.log(dt.value);
  return await pageService.exportWiki(dt.value);
};

</script>

<template>
  <DataTable ref="dt" :value="value" :rows="rows" :paginator="paginator" responsive-layout="scroll">
    <!--<template #header>
      <div style="text-align: right">
        <Button
          size="small"
          icon="pi pi-file-excel"
          :label="t('Exportar')"
          outlined
          severity="success"
          @click="exportCSV()"
        />
        <Button
          size="small"
          class="ml-1"
          icon="pi pi-file-excel"
          :label="t('Marcas')"
          outlined
          @click="exportWiki($event)"
        />
      </div>
    </template>-->
    <Column field="collection" :header="t('Colección')" :sortable="true" style="width: 15%">
        <template #body="slotProps">
          <span class="text-yellow-500">{{ slotProps.data.collection }}</span>
        </template>
      </Column>
      <Column field="title" :header="t('Título')" :sortable="true" style="width: 80%">
      <template #body="slotProps">
        <PageLink :page="slotProps.data" />
      </template>
    </Column>
    <Column field="weight" :header="t('Peso')" :sortable="true" style_="width: 5%" class="text-right">
      <template #body="slotProps">
        <span class="text-green-300">{{ formatIntNumber(slotProps.data.weight) }}</span>
      </template>
    </Column>
  </DataTable>
</template>
