<script lang="ts" setup>
const { t } = useI18n();

interface Props {
  rows?: number;
  value?: any[];
  showUser?: boolean;
  showTitle?: boolean;
  paginator?: boolean;
}

withDefaults(defineProps<Props>(), {
  rows: 5,
  value: () => [],
  showUser: true,
  showTitle: true,
  paginator: false
});
</script>

<template>
  <BaseDataTable :rows="rows" :value="value" :show-user="showUser" :paginator="paginator">
    <template #userColumn="{ data }">
      <NuxtLink :to="'/users/'+data.user" class="text-red-500 border-none border-b border-dotted">
        {{ data.user }}
      </NuxtLink>
    </template>
    
    <Column v-if="showTitle" field="title" :header="t('Título')" :sortable="true" style="width: 50%">
      <template #body="slotProps">
        <PageLink :page="slotProps.data" />
      </template>
    </Column>
    <Column v-if="showTitle" field="collection" :header="t('Colección')" :sortable="true" style="width: 15%">
      <template #body="slotProps">
        <span class="text-yellow-500">{{ slotProps.data.collection }}</span>
      </template>
    </Column>
    <Column field="date" :header="t('Fecha')" :sortable="true" style="width: 15%">
      <template #body="slotProps">
        <span class="text-sm">{{ formatDateTime(slotProps.data.date) }}</span>
      </template>
    </Column>
    <Column field="type" :header="t('Tipo')" :sortable="true" style="width: 15%">
      <template #body="slotProps">
        <Tag :severity="formatPageType(slotProps.data.type)" :value="slotProps.data.type" />
      </template>
    </Column>
  </BaseDataTable>
</template>
