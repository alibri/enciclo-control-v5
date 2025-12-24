<script lang="ts" setup>
interface Props {
  rows?: number;
  value?: any[];
  showUser?: boolean;
  paginator?: boolean;
  exportEnabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  rows: 5,
  value: () => [],
  showUser: true,
  paginator: false,
  exportEnabled: true
});

const dt = ref();
const { t } = useI18n();

const exportCSV = () => {
  dt.value?.exportCSV();
};

// Exponer métodos para componentes hijos
defineExpose({
  exportCSV,
  dt
});
</script>

<template>
  <DataTable ref="dt" :value="value" :rows="rows" :paginator="paginator" responsive-layout="scroll">
    <template #header>
      <div v-if="exportEnabled" class="text-right">
        <Button 
          size="small" 
          icon="pi pi-file-excel" 
          :label="t('Exportar')" 
          @click="exportCSV()" 
          outlined 
        />
      </div>
    </template>
    
    <!-- Slot para columnas personalizadas -->
    <slot />
    
    <!-- Columna de usuario por defecto si showUser es true y no hay slot personalizado -->
    <Column
      v-if="showUser && !$slots.userColumn"
      field="user"
      :header="t('Usuario')"
      :sortable="true"
      style="width: 15%"
    >
      <template #body="slotProps">
        <NuxtLink :to="'/users/'+slotProps.data.user" class="text-red-500 border-none border-b border-dotted">
          {{ slotProps.data.user }}
        </NuxtLink>
      </template>
    </Column>
    
    <!-- Slot para columna de usuario personalizada -->
    <Column
      v-if="showUser && $slots.userColumn"
      field="user"
      :header="t('Usuario')"
      :sortable="true"
      style="width: 15%"
    >
      <template #body="slotProps">
        <slot name="userColumn" :data="slotProps.data" />
      </template>
    </Column>
  </DataTable>
</template>

