<script setup lang='ts'>
interface Props {
  modelValue: string;
  disabled?: boolean;
  buttonLabel?: string;
  buttonIcon?: string;
  placeholder?: string;
  rows?: number;
  id?: string;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  buttonLabel: 'Ejecutar Consulta',
  buttonIcon: 'pi pi-play',
  placeholder: 'Ej: ¿Qué es una célula?',
  rows: 4,
  id: 'query',
  fullWidth: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'execute': [];
}>();

const { t } = useI18n();

const localQuery = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const handleExecute = () => {
  emit('execute');
};
</script>

<template>
  <div :class="{ 'xl:col-span-2': fullWidth }">
    <Card>
      <template #title>
        <div class="flex items-center space-x-2">
          <i class="pi pi-question-circle text-blue-500"></i>
          <span>{{ t('Pregunta') }}</span>
        </div>
      </template>
      <template #content>
        <div class="space-y-4">
          <div class="space-y-2">
              <Textarea 
              :id="id" 
              v-model="localQuery" 
              class="w-full" 
              :rows="rows"
              :placeholder="t(placeholder)"
              :disabled="disabled"
            />
          </div>
          
          <div class="flex justify-end">
            <Button 
              :label="t(buttonLabel)" 
              :icon="buttonIcon" 
              :loading="disabled"
              :disabled="disabled || !localQuery.trim()"
              @click="handleExecute" 
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

