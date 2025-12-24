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
    <Column field="collections" :header="t('Colección')" :sortable="true" style="width: 15%" class="text-yellow-500" />
    <Column field="date" :header="t('Fecha')" :sortable="true" style="width: 15%">
      <template #body="slotProps">
        <span class="text-sm">{{ formatDateTime(slotProps.data.date) }}</span>
      </template>
    </Column>
    <Column field="term" :header="t('Term')" :sortable="true" class="font-bold" />
    <Column field="filter" header="Tipo" :sortable="true">
      <template #body="slotProps">
        <Tag v-if="slotProps.data.filter" severity="info">
          {{ slotProps.data.filter }}
        </Tag>
      </template>
    </Column>
    <Column field="order" :header="t('Orden')" :sortable="true">
      <template #body="slotProps">
        <Tag v-if="slotProps.data.order" severity="danger">
          {{ slotProps.data.order }}
        </Tag>
      </template>
    </Column>
    <Column field="from" :header="t('De')" :sortable="true" class="text-center text-sm" />
    <Column field="to" :header="t('Hasta')" :sortable="true" class="text-center text-sm" />
    <Column field="total" :header="t('Total')" :sortable="true" class="text-right text-sm">
      <template #body="slotProps">
        {{ formatIntNumber(slotProps.data.total) }}
      </template>
    </Column>
  </BaseDataTable>
</template>
