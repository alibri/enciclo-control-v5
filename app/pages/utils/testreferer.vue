<script setup lang='ts'>
import { useConfirm } from 'primevue/useconfirm';
import TestService from '~/services/testService';

const { showMessage, removeGroup } = useMessages();
const { t } = useI18n();

const testService = new TestService();
const resultReferer = ref();
const resultRefererReferer = ref();

const testReferer = async () => {
    blocked.value = true;
    resultReferer.value = '';
    showMessage('info', t('Test Configuración'), t('Comprobando Configuración...'), -1, 'tc');
    const response = await testService.testReferer({ referer: referer.value, rango: rango.value });
    removeGroup('tc');
    if (checkLogged(response)) {
        resultReferer.value = response?.data?.value?.message;
    } else {
        showMessage('error', t('Error'), response?.data?.value?.message, -1);
    }
    blocked.value = false;
};

const testRefererReferer = async () => {
    blocked.value = true;
    resultRefererReferer.value = '';
    showMessage('info', t('Test Referer'), t('Comprobando Referer...'), -1, 'tc');
    const response = await testService.testReferer({ referer: referersingle.value });
    removeGroup('tc');
    if (checkLogged(response)) {
        resultRefererReferer.value = response?.data?.value?.message;
    } else {
        showMessage('error', t('Error'), response?.data?.value?.message, -1);
    }
    blocked.value = false;
};

const referer = ref('');
const rango = ref('');
const referersingle = ref('');

const blocked = ref(false);

</script>
    
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
    <!-- Header Section -->
    <div class="mb-6">
      <div class="flex items-center space-x-3">
        <h2 class="text-3xl font-bold text-gray-900">
          <i class="pi pi-link mr-2 text-blue-500"></i>
          {{ t('Test Referer') }}</h2>
        <Badge v-if="resultReferer || resultRefererReferer" value="✓" severity="success" />
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- Single Referer Test Card -->
      <Card>
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-link text-blue-500"></i>
            <span>{{ t('Test Referer Individual') }}</span>
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="referersingle" class="block text-sm font-medium text-gray-700">
                <i class="pi pi-globe text-gray-400 mr-2"></i>
                {{ t('URL Referer') }}
              </label>
              <InputText 
                id="referersingle" 
                v-model="referersingle" 
                class="w-full"
                :placeholder="t('Ej: https://www.ejemplo.com')"
              />
            </div>
            
            <div class="flex justify-center">
              <Button 
                :label="t('Probar Referer')" 
                icon="pi pi-search" 
                :loading="blocked"
                @click="testRefererReferer" 
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Referer Configuration Test Card -->
      <Card>
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-cog text-green-500"></i>
            <span>{{ t('Test Configuración') }}</span>
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="referer" class="block text-sm font-medium text-gray-700">
                <i class="pi pi-globe text-gray-400 mr-2"></i>
                {{ t('Referer Base') }}
              </label>
              <InputText 
                id="referer" 
                v-model="referer" 
                class="w-full"
                :placeholder="t('Ej: https://www.ejemplo.com')"
              />
            </div>
            
            <div class="space-y-2">
              <label for="rango" class="block text-sm font-medium text-gray-700">
                <i class="pi pi-list text-gray-400 mr-2"></i>
                {{ t('Rango de Referers') }}
              </label>
              <Textarea 
                id="rango" 
                v-model="rango" 
                class="w-full" 
                rows="4"
                :placeholder="t('Ingrese los referers a probar, uno por línea...')"
              />
            </div>
            
            <div class="flex justify-center">
              <Button 
                :label="t('Probar Configuración')" 
                icon="pi pi-search" 
                :loading="blocked"
                @click="testReferer" 
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Results Section -->
    <div v-if="resultReferer || resultRefererReferer" class="mt-6 space-y-4">
      <!-- Single Referer Result -->
      <Card v-if="resultRefererReferer">
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-check-circle text-green-500"></i>
            <span>{{ t('Resultado Test Referer Individual') }}</span>
          </div>
        </template>
        <template #content>
          <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div v-html="resultRefererReferer"></div>
          </div>
        </template>
      </Card>

      <!-- Referer Configuration Result -->
      <Card v-if="resultReferer">
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-check-circle text-green-500"></i>
            <span>{{ t('Resultado Test Configuración') }}</span>
          </div>
        </template>
        <template #content>
          <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div v-html="resultReferer"></div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Empty State -->
    <div v-else-if="!blocked" class="mt-6">
      <Card>
        <template #content>
          <div class="text-center py-12">
            <i class="pi pi-info-circle text-4xl text-gray-400 mb-4"></i>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('Listo para probar') }}</h3>
            <p class="text-gray-500">{{ t('Ingrese un referer o configuración para comenzar las pruebas') }}</p>
          </div>
        </template>
      </Card>
    </div>

    <!-- Loading State -->
    <div v-if="blocked" class="mt-6">
      <Card>
        <template #content>
          <div class="text-center py-12">
            <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4"></i>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('Ejecutando pruebas...') }}</h3>
            <p class="text-gray-500">{{ t('Por favor espere mientras se procesan los referers') }}</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped></style>
