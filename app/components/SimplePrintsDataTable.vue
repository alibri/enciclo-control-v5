<script lang="ts" setup>
const { t } = useI18n();

interface Props {
  rows?: number;
  value?: any[];
  showUser?: boolean;
  paginator?: boolean;
}

withDefaults(defineProps<Props>(), {
  rows: 5,
  value: () => [],
  showUser: true,
  paginator: false
});
</script>

<template>
  <BaseDataTable :rows="rows" :value="value" :show-user="showUser" :paginator="paginator">
    <Column field="title" :header="t('Título')" :sortable="true" style="width: 50%">
      <template #body="slotProps">
        <PageLink :page="slotProps.data" />
      </template>
    </Column>
    <Column field="collection" :header="t('Colección')" :sortable="true" style="width: 15%">
      <template #body="slotProps">
        <span class="text-yellow-500">{{ slotProps.data.collection }}</span>
      </template>
    </Column>
    <Column field="date" :header="t('Fecha')" :sortable="true" style="width: 15%">
      <template #body="slotProps">
        <span class="text-sm">{{ formatDateTime(slotProps.data.date) }}</span>
      </template>
    </Column>
  </BaseDataTable>
</template>
