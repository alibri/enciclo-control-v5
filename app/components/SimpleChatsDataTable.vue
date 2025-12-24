<script lang="ts" setup>
const { t } = useI18n();
const dialog = useDialog();

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
  </BaseDataTable>
</template>
