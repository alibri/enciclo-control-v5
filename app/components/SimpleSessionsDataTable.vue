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

  showEnd: {
    type: Boolean,
    default: false
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
      style="width: 35%"
    >
      <template #body="slotProps">
        <NuxtLink :to="'/users/'+slotProps.data.user" class="text-red-500 border-none border-bottom-1 border-dotted">
          {{ slotProps.data.user }}
        </NuxtLink>
      </template>
    </Column>

    <Column field="mode" :header="t('Modo')" :sortable="true" style="width: 35%">
      <template #body="slotProps">
        <Tag :severity="formatLoginMode(slotProps.data.mode)" :value="slotProps.data.mode" />
      </template>
    </Column>
    <Column field="begin" :header="t('Inicio')" :sortable="true" style="width: 35%">
      <template #body="slotProps">
        <span class="text-sm">{{ formatDateTime(slotProps.data.begin) }}</span>
      </template>
    </Column>
    <Column v-if="showEnd" field="ts" :header="t('Tiempo')" :sortable="true" style="width: 35%">
      <template #body="slotProps">
        <span class="text-sm">{{ formatSegundosAHora(slotProps.data.ts) }}</span>
      </template>
    </Column>
    <Column field="pages" :header="t('Páginas')" :sortable="true" style="width: 35%">
      <template #body="slotProps">
        <span class="text-sm">{{ slotProps.data.pages }}</span>
      </template>
    </Column>
    <Column style="width: 15%">
      <template #header>
        Ver
      </template>
      <template #body="slotProps">
        <NuxtLink :to="'/sessions/'+slotProps.data.id" class="p-button-text">
          <Button icon="pi pi-search" type="button" class="p-button-text" />
        </NuxtLink>
      </template>
    </Column>
  </DataTable>
</template>
