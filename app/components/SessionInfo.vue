<script setup lang="ts">
interface SessionData {
  user?: string;
  min?: string;
  max?: string;
  ts?: number;
  pages?: number;
  ip?: string;
  geoip?: string;
  referer?: string;
  mode?: string;
  agent?: string;
  browser?: string;
  platform?: string;
  glc_country_name?: string;
  glc_city?: string;
}

interface Props {
  sessionData: SessionData;
}

const props = defineProps<Props>();
const { t } = useI18n();
</script>

<template>
  <div class="col-span-12 lg:col-span-6 xl:col-span-6">
    <div class="rounded-xl border overflow-hidden" style="border-color: var(--surface-border); background-color: var(--surface-card);">
      <!-- Header -->
      <div class="bg-blue-500  px-6 py-4">
        <div class="flex items-center justify-between">
          <h3 class="text-white font-semibold text-lg flex items-center gap-2">
            <i class="pi pi-user text-xl"></i>
            {{ t('Información de Sesión') }}
          </h3>
          <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-4">
        <!-- Usuario -->
        <div class="bg-gradient-to-r from-red-50 to-pink-50  rounded-lg p-4 border-l-4 border-red-500">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-100  rounded-full flex items-center justify-center">
                <i class="pi pi-user text-red-600 "></i>
              </div>
              <div>
                <p class="text-sm font-medium" style="color: var(--text-color-secondary);">{{ t('Usuario') }}</p>
                <p class="text-lg font-bold text-red-600 ">{{ sessionData?.user || 'N/A' }}</p>
              </div>
            </div>
            <NuxtLink v-if="sessionData?.user" :to="'/users/' + sessionData.user" 
                      class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2">
              <i class="pi pi-chart-bar"></i>
              <span class="text-sm">{{ t('Ver estadísticas') }}</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Tiempo de sesión -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50  rounded-lg p-4 border-l-4 border-blue-500">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-blue-100  rounded-full flex items-center justify-center">
                <i class="pi pi-clock text-blue-600  text-sm"></i>
              </div>
              <div>
                <p class="text-xs font-medium" style="color: var(--text-color-secondary);">{{ t('Inicio') }}</p>
                <p class="text-sm font-semibold" style="color: var(--text-color);">{{ sessionData?.min ? formatDateTime(Number(sessionData.min)) : 'N/A' }}</p>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-green-50 to-emerald-50  rounded-lg p-4 border-l-4 border-green-500">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-green-100  rounded-full flex items-center justify-center">
                <i class="pi pi-calendar text-green-600  text-sm"></i>
              </div>
              <div>
                <p class="text-xs font-medium" style="color: var(--text-color-secondary);">{{ t('Último') }}</p>
                <p class="text-sm font-semibold" style="color: var(--text-color);">{{ sessionData?.max ? formatDateTime(Number(sessionData.max)) : 'N/A' }}</p>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-purple-50 to-violet-50  rounded-lg p-4 border-l-4 border-purple-500">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-purple-100  rounded-full flex items-center justify-center">
                <i class="pi pi-stopwatch text-purple-600  text-sm"></i>
              </div>
              <div>
                <p class="text-xs font-medium" style="color: var(--text-color-secondary);">{{ t('Duración') }}</p>
                <p class="text-sm font-semibold" style="color: var(--text-color);">{{ sessionData?.ts ? formatSegundosAHora(sessionData.ts) : 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actividad -->
        <div class="bg-gradient-to-r from-orange-50 to-yellow-50  rounded-lg p-4 border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-orange-100  rounded-full flex items-center justify-center">
                <i class="pi pi-file text-orange-600 "></i>
              </div>
              <div>
                <p class="text-sm font-medium" style="color: var(--text-color-secondary);">{{ t('Páginas visitadas') }}</p>
                <p class="text-2xl font-bold text-orange-600 ">{{ sessionData?.pages || 0 }}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="w-16 h-16 bg-orange-100  rounded-full flex items-center justify-center">
                <span class="text-orange-600  font-bold text-lg">{{ sessionData?.pages || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Información de red -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gradient-to-br from-yellow-50 to-amber-50  rounded-lg p-4 border-l-4 border-yellow-500">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-yellow-100  rounded-full flex items-center justify-center">
                <i class="pi pi-globe text-yellow-600  text-sm"></i>
              </div>
              <div class="flex-1">
                <p class="text-xs font-medium" style="color: var(--text-color-secondary);">{{ t('Dirección IP') }}</p>
                <p class="text-sm font-mono font-semibold text-yellow-600  break-all">{{ sessionData?.ip || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-teal-50 to-cyan-50  rounded-lg p-4 border-l-4 border-teal-500">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-teal-100  rounded-full flex items-center justify-center">
                <i class="pi pi-map-marker text-teal-600  text-sm"></i>
              </div>
              <div class="flex-1">
                <p class="text-xs font-medium" style="color: var(--text-color-secondary);">{{ t('Ubicación') }}</p>
                <p class="text-sm font-semibold text-teal-600 ">
                  {{ sessionData?.glc_city || 'N/A' }}, {{ sessionData?.glc_country_name || 'N/A' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Información técnica -->
        <div class="space-y-3">
          <h4 class="text-sm font-semibold flex items-center gap-2" style="color: var(--text-color);">
            <i class="pi pi-cog"></i>
            {{ t('Información Técnica') }}
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="rounded-lg p-3" style="background-color: var(--surface-hover);">
              <p class="text-xs font-medium mb-1" style="color: var(--text-color-secondary);">{{ t('Navegador') }}</p>
              <p class="text-sm" style="color: var(--text-color);">{{ sessionData?.browser || 'N/A' }}</p>
            </div>
            
            <div class="rounded-lg p-3" style="background-color: var(--surface-hover);">
              <p class="text-xs font-medium mb-1" style="color: var(--text-color-secondary);">{{ t('Sistema Operativo') }}</p>
              <p class="text-sm" style="color: var(--text-color);">{{ sessionData?.platform || 'N/A' }}</p>
            </div>
            
            <div class="rounded-lg p-3" style="background-color: var(--surface-hover);">
              <p class="text-xs font-medium mb-1" style="color: var(--text-color-secondary);">{{ t('Modo de acceso') }}</p>
              <p class="text-sm" style="color: var(--text-color);">{{ sessionData?.mode ? formatLoginMode(sessionData.mode) : 'N/A' }}</p>
            </div>
            
            <div class="rounded-lg p-3" style="background-color: var(--surface-hover);">
              <p class="text-xs font-medium mb-1" style="color: var(--text-color-secondary);">{{ t('Referer') }}</p>
              <p class="text-sm truncate" style="color: var(--text-color);">{{ sessionData?.referer || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- User Agent (expandible) -->
        <div v-if="sessionData?.agent" class=" rounded-lg p-3">
          <details class="group">
            <summary class="cursor-pointer text-sm font-medium  flex items-center gap-2">
              <i class="pi pi-info-circle"></i>
              {{ t('User Agent') }}
              <i class="pi pi-chevron-down group-open:rotate-180 transition-transform duration-200"></i>
            </summary>
            <div class="mt-2 p-3  rounded border text-xs font-mono  break-all">
              {{ sessionData.agent }}
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>
