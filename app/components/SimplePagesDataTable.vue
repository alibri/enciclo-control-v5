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

  showTitle: {
    type: Boolean,
    default: true
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
</script>

<template>
  <DataTable ref="dt" :value="value" :rows="rows" :paginator="paginator" responsive-layout="scroll">
    <template #header>
      <div style="text-align: right">
        <Button size="small" icon="pi pi-file-excel" :label="t('Exportar')" @click="exportCSV($event)" outlined />
      </div>
    </template>
    <Column
      v-if="showUser"
      field="user"
      :header="t('Usuario')"
      :sortable="true"
      style="width: 15%"
      class="text-color-secondary"
    >
      <template #body="slotProps">
        <NuxtLink :to="'/users/'+slotProps.data.user" class="text-red-500 border-none border-bottom-1 border-dotted">
          {{ slotProps.data.user }}
        </NuxtLink>
      </template>
    </Column>
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
  </DataTable>
</template>
