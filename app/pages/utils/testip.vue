<script setup lang='ts'>
import { useConfirm } from 'primevue/useconfirm';
import TestService from '~/services/testService';

useAuthGuard();

const { showMessage, removeGroup } = useMessages();
const { t } = useI18n();

const testService = new TestService();
const resultIP = ref();
const resultIPRange = ref();

const testIP = async () => {
    blocked.value = true;
    resultIP.value = '';
    showMessage('info', t('Test IP'), t('Comprobando IP...'), -1, 'tc');
    const response = await testService.testIP({ ip: ip.value });
    removeGroup('tc');
    if (checkLogged(response)) {
        resultIP.value = response?.data?.value?.message;
    } else {
        showMessage('error', t('Error'), response?.data?.value?.message, -1);
    }
    blocked.value = false;
};

const testIPRange = async () => {
    blocked.value = true;
    resultIPRange.value = '';
    showMessage('info', t('Test Rango IP'), t('Comprobando Rango IP...'), -1, 'tc');
    const response = await testService.testIP({ ip: ipRange.value, rango: rango.value });
    removeGroup('tc');
    if (checkLogged(response)) {
        resultIPRange.value = response?.data?.value?.message;
    } else {
        showMessage('error', t('Error'), response?.data?.value?.message, -1);
    }
    blocked.value = false;
};

const ip = ref('');
const ipRange = ref('');
const rango = ref('');

const blocked = ref(false);

</script>

<template>
  <div class="min-h-screen p-4" style="background-color: var(--surface-ground);">
    <!-- Header Section -->
    <div class="mb-6">
      <div class="flex items-center space-x-3">
        <h2 class="text-3xl font-bold" style="color: var(--text-color);">
          <i class="pi pi-globe mr-2 text-blue-500"></i>
          {{ t('Test IP') }}</h2>
        <Badge v-if="resultIP || resultIPRange" value="✓" severity="success" />
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- Single IP Test Card -->
      <Card>
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-globe text-blue-500"></i>
            <span>{{ t('Test IP Individual') }}</span>
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="ip" class="block text-sm font-medium" style="color: var(--text-color);">
                <i class="pi pi-map-marker text-gray-400 mr-2"></i>
                {{ t('Dirección IP') }}
              </label>
              <InputText 
                id="ip" 
                v-model="ip" 
                class="w-full"
                :placeholder="t('Ej: 192.168.1.1')"
              />
            </div>
            
            <div class="flex justify-center">
              <Button 
                :label="t('Probar IP')" 
                icon="pi pi-search" 
                :loading="blocked"
                @click="testIP" 
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- IP Range Test Card -->
      <Card>
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-sitemap text-green-500"></i>
            <span>{{ t('Test Rango IP') }}</span>
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="ipRange" class="block text-sm font-medium" style="color: var(--text-color);">
                <i class="pi pi-map-marker text-gray-400 mr-2"></i>
                {{ t('IP Base') }}
              </label>
              <InputText 
                id="ipRange" 
                v-model="ipRange" 
                class="w-full"
                :placeholder="t('Ej: 192.168.1.0')"
              />
            </div>
            
            <div class="space-y-2">
              <label for="rango" class="block text-sm font-medium" style="color: var(--text-color);">
                <i class="pi pi-list text-gray-400 mr-2"></i>
                {{ t('Rango de IPs') }}
              </label>
              <Textarea 
                id="rango" 
                v-model="rango" 
                class="w-full" 
                rows="4"
                :placeholder="t('Ingrese las IPs a probar, una por línea...')"
              />
            </div>
            
            <div class="flex justify-center">
              <Button 
                :label="t('Probar Rango')" 
                icon="pi pi-search" 
                :loading="blocked"
                @click="testIPRange" 
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Results Section -->
    <div v-if="resultIP || resultIPRange" class="mt-6 space-y-4">
      <!-- Single IP Result -->
      <Card v-if="resultIP">
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-check-circle text-green-500"></i>
            <span>{{ t('Resultado Test IP Individual') }}</span>
          </div>
        </template>
        <template #content>
          <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div v-html="resultIP"></div>
          </div>
        </template>
      </Card>

      <!-- IP Range Result -->
      <Card v-if="resultIPRange">
        <template #title>
          <div class="flex items-center space-x-2">
            <i class="pi pi-check-circle text-green-500"></i>
            <span>{{ t('Resultado Test Rango IP') }}</span>
          </div>
        </template>
        <template #content>
          <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div v-html="resultIPRange"></div>
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
            <h3 class="text-lg font-medium mb-2" style="color: var(--text-color);">{{ t('Listo para probar') }}</h3>
            <p style="color: var(--text-color-secondary);">{{ t('Ingrese una IP o rango de IPs para comenzar las pruebas') }}</p>
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
            <h3 class="text-lg font-medium mb-2" style="color: var(--text-color);">{{ t('Ejecutando pruebas...') }}</h3>
            <p style="color: var(--text-color-secondary);">{{ t('Por favor espere mientras se procesan las IPs') }}</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
