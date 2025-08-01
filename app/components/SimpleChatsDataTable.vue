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

const dialog = useDialog();

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
    <Column field="collection" :header="t('Colección')" :sortable="true" style="width: 15%" class="text-yellow-500" />
    <Column field="query" :header="t('Pregunta')" :sortable="true" style="width: 50%">
      <template #body="slotProps">
        <a style="cursor: pointer;" class="font-bold border-none border-b border-dotted ml-1" @click="showChat(dialog, slotProps.data.id)">
          <strong>{{ slotProps.data.query }}</strong>
        </a>          
      </template>
    </Column>
    <Column field="date" :header="t('Fecha')" :sortable="true" style="width: 15%">
      <template #body="slotProps">
        <span class="text-sm">{{ formatDateTime(slotProps.data.date) }}</span>
      </template>
    </Column>
    <Column field="time" :header="t('ts')" :sortable="true" class="text-center text-xs text-green-500">
      <template #body="slotProps">
        {{ slotProps.data.time }}s
      </template>            
    </Column>
    <Column field="prompt_tokens" :header="t('T.In')" :sortable="true" class="text-right text-xs text-blue-500">
      <template #body="slotProps">
        {{ formatIntNumber(slotProps.data.prompt_tokens) }}
      </template>            
    </Column>
    <Column field="completion_tokens" :header="t('T.Out')" :sortable="true" class="text-right text-xs text-blue-500">
      <template #body="slotProps">
        {{ formatIntNumber(slotProps.data.completion_tokens) }}
      </template>            
    </Column>
</DataTable>
</template>
