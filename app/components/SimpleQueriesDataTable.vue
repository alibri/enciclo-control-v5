<script lang="ts" setup>
const { t } = useI18n();

defineProps({
  rows: {
    type: Number,
    default: 5
  },

  value: {
    type: Array,
    default: null
  },

  showUser: {
    type: Boolean,
    default: true
  },

  paginator: {
    type: Boolean,
    default: false
  }
});

const dt = ref();
const exportCSV = ($event: MouseEvent) => {
  dt.value.exportCSV();
};
</script>

<template>
  <DataTable ref="dt" :value="value" :rows="rows" :paginator="paginator" responsive-layout="scroll">
    <template #header>
      <div class="text-right">
        <Button size="small" icon="pi pi-file-excel" :label="t('Exportar')" @click="exportCSV($event)" outlined />
      </div>
    </template>
    <Column v-if="showUser" field="user" :header="t('Usuario')" :sortable="true" style="width: 15%">
      <template #body="slotProps">
        <NuxtLink :to="'/users/'+slotProps.data.user" class="text-red-500 border-none border-b border-dotted">
          {{ slotProps.data.user }}
        </NuxtLink>
      </template>
    </Column>
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
  </DataTable>
</template>
