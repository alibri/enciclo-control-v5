<script lang="ts" setup>
const { t } = useI18n();

interface Props {
  rows?: number;
  value?: any[];
  showEnd?: boolean;
  showUser?: boolean;
  paginator?: boolean;
}

withDefaults(defineProps<Props>(), {
  rows: 5,
  value: () => [],
  showEnd: false,
  showUser: true,
  paginator: false
});
</script>

<template>
  <BaseDataTable :rows="rows" :value="value" :show-user="showUser" :paginator="paginator">
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
  </BaseDataTable>
</template>
