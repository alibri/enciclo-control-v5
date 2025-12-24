<script lang="ts" setup>
const { t } = useI18n();

defineProps({
  user: {
    type: Object,
    default: null
  }
});
const displayDashboard = ref(false);
const dashboardUser = ref<any>(null);

const verDashboard = (user: any) => {
  dashboardUser.value = user;
  displayDashboard.value = true;
};

const displayStats = ref(false);
const selectedUser = ref<any>(null);

const gestionEstadisticas = (user: any) => {
  selectedUser.value = user;
  displayStats.value = true;
};

</script>

<template>
  <UserDashboardDialog v-model:visible="displayDashboard" :user="dashboardUser" />
  <UserStatsDialog v-model:visible="displayStats" :user="selectedUser" />
  
  <!-- Header con información principal del usuario -->
  <div class="mb-6">
    <div class="border rounded-xl p-6 shadow-sm surface-card border-surface">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 rounded-full flex items-center justify-center" style="background-color: var(--primary-color);">
            <i class="pi pi-user text-white text-2xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-1 text-primary">{{ user?.name }}</h2>
            <p class="text-lg font-medium" style="color: var(--primary-color);">{{ user?.user }}</p>
            <div class="flex items-center space-x-2 mt-2">
              <Badge v-if="user?.isenabled" value="Activo" severity="success" class="text-xs" />
              <Badge v-if="user?.isadmin" value="Admin" severity="danger" class="text-xs" />
              <Badge v-if="user?.iseditor" value="Editor" severity="warning" class="text-xs" />
              <Badge v-if="user?.istester" value="Tester" severity="info" class="text-xs" />
            </div>
          </div>
        </div>
        <div class="flex space-x-3">
          <Button
            @click="verDashboard(user)"
            :label="t('Dashboard')"
            icon="pi pi-chart-line"
            severity="info"
            size="small"
            outlined
          />
          <Button
            @click="gestionEstadisticas(user)"
            :label="t('Estadísticas')"
            icon="pi pi-chart-bar"
            severity="warning"
            size="small"
            outlined
          />
        </div>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Información del Usuario -->
    <div class="border rounded-xl shadow-sm overflow-hidden border-surface surface-card">
      <div class="px-6 py-4 border-b border-surface surface-hover">
          <h3 class="text-lg font-semibold flex items-center text-primary">
          <i class="pi pi-user mr-2" style="color: var(--primary-color);"></i>
          {{ t('Información del Usuario') }}
        </h3>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <!-- Grupo -->
          <div class="flex items-center justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-users mr-3"></i>
              <span class="font-medium text-secondary">{{ t('Grupo') }}</span>
            </div>
            <div class="text-right">
              <NuxtLink v-if="user?.grupo" :to="'/users/g__' + user?.grupo" 
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors" style="background-color: var(--highlight-bg); color: var(--primary-color);">
                <i class="pi pi-external-link mr-1 text-xs"></i>
                {{ user?.grupo }}
              </NuxtLink>
              <span v-else class="text-sm" style="color: var(--text-color-secondary);">{{ t('Sin grupo') }}</span>
            </div>
          </div>

          <!-- Colecciones -->
          <div class="flex items-start justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-folder mr-3 mt-1"></i>
              <span class="font-medium text-secondary">{{ t('Colecciones') }}</span>
            </div>
            <div class="text-right flex flex-wrap gap-2 max-w-xs">
              <Tag v-for="item in user?.collections" :key="item" 
                :value="item" 
                severity="secondary" 
                rounded 
                class="text-xs" />
              <span v-if="!user?.collections || user?.collections.length === 0" 
                class="text-sm" style="color: var(--text-color-secondary);">{{ t('Sin colecciones') }}</span>
            </div>
          </div>

          <!-- Estado de la cuenta -->
          <div class="flex items-center justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-shield mr-3"></i>
              <span class="font-medium text-secondary">{{ t('Estado de la cuenta') }}</span>
            </div>
            <div class="text-right">
              <div class="flex items-center space-x-2">
                <i v-if="user?.isenabled" class="pi pi-check-circle text-green-500 text-lg"></i>
                <i v-else class="pi pi-times-circle text-red-500 text-lg"></i>
                <span :class="user?.isenabled ? 'text-green-500' : 'text-red-500'" class="font-medium">
                  {{ user?.isenabled ? t('Activa') : t('Inactiva') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Información de Licencias y Acceso -->
    <div class="border rounded-xl shadow-sm overflow-hidden border-surface surface-card">
      <div class="px-6 py-4 border-b border-surface surface-hover">
          <h3 class="text-lg font-semibold flex items-center text-primary">
          <i class="pi pi-key mr-2" style="color: var(--primary-color);"></i>
          {{ t('Licencias y Acceso') }}
        </h3>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <!-- Licencias -->
          <div class="flex items-center justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-ticket mr-3"></i>
              <span class="font-medium text-secondary">{{ t('Licencias') }}</span>
            </div>
            <div class="text-right">
              <Badge :value="user?.licenses || '0'" severity="success" class="text-sm font-bold" />
            </div>
          </div>

          <!-- Período de validez -->
          <div class="flex items-center justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-calendar mr-3"></i>
              <span class="font-medium text-secondary">{{ t('Período de validez') }}</span>
            </div>
            <div class="text-right">
              <div class="text-sm">
                <div class="font-medium" style="color: var(--primary-color);">{{ convertDateFormat(user?.begin) }}</div>
                <div class="text-xs" style="color: var(--text-color-secondary);">{{ t('desde') }}</div>
              </div>
            </div>
          </div>

          <!-- Fecha de expiración -->
          <div class="flex items-center justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-clock mr-3"></i>
              <span class="font-medium text-secondary">{{ t('Expira') }}</span>
            </div>
            <div class="text-right">
              <div class="text-sm">
                <div class="font-medium" style="color: var(--text-color);">{{ convertDateFormat(user?.end) }}</div>
                <div class="text-xs" style="color: var(--text-color-secondary);">{{ t('hasta') }}</div>
              </div>
            </div>
          </div>

          <!-- Rango de IP -->
          <div class="flex items-center justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-globe mr-3"></i>
              <span class="font-medium text-secondary">{{ t('Rango de IP') }}</span>
            </div>
            <div class="text-right">
              <code class="px-2 py-1 rounded text-sm font-mono" style="background-color: var(--surface-hover); color: var(--primary-color);">
                {{ user?.iprange || t('Sin restricción') }}
              </code>
            </div>
          </div>

          <!-- Ubicación -->
          <div class="flex items-center justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-map-marker mr-3"></i>
              <span class="font-medium text-secondary">{{ t('Ubicación') }}</span>
            </div>
            <div class="text-right">
              <span class="font-medium" style="color: var(--text-color);">{{ user?.geoip || t('No disponible') }}</span>
            </div>
          </div>

          <!-- Referer -->
          <div class="flex items-center justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-link mr-3"></i>
              <span class="font-medium text-secondary">{{ t('Referer') }}</span>
            </div>
            <div class="text-right">
              <span class="font-medium text-sm break-all max-w-xs block" style="color: var(--text-color-secondary);">
                {{ user?.referer || t('No disponible') }}
              </span>
            </div>
          </div>

          <!-- Estadísticas manuales -->
          <div class="flex items-center justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-chart-bar mr-3"></i>
              <span class="font-medium text-secondary">{{ t('Estadísticas manuales') }}</span>
            </div>
            <div class="text-right">
              <div class="flex items-center space-x-2">
                <i v-if="user?.manual_stats" class="pi pi-check-circle text-green-500 text-lg"></i>
                <i v-else class="pi pi-times-circle text-red-500 text-lg"></i>
                <span :class="user?.manual_stats ? 'text-green-500' : 'text-red-500'" class="font-medium">
                  {{ user?.manual_stats ? t('Activadas') : t('Desactivadas') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Inicio de estadísticas -->
          <div class="flex items-center justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-calendar-plus mr-3"></i>
              <span class="font-medium text-secondary">{{ t('Inicio estadísticas') }}</span>
            </div>
            <div class="text-right">
              <span class="font-medium" style="color: var(--primary-color);">
                {{ user?.stats_min ? formatDate(user?.stats_min) : t('No especificado') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Información de Roles -->
    <div class="border rounded-xl shadow-sm overflow-hidden border-surface surface-card">
      <div class="px-6 py-4 border-b border-surface surface-hover">
          <h3 class="text-lg font-semibold flex items-center text-primary">
          <i class="pi pi-shield mr-2" style="color: var(--primary-color);"></i>
          {{ t('Roles y Permisos') }}
        </h3>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <!-- Administrador -->
          <div class="flex items-center justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-shield mr-3"></i>
              <span class="font-medium text-secondary">{{ t('Administrador') }}</span>
            </div>
            <div class="text-right">
              <div class="flex items-center space-x-2">
                <i v-if="user?.isadmin" class="pi pi-check-circle text-green-500 text-lg"></i>
                <i v-else class="pi pi-times-circle text-red-500 text-lg"></i>
                <span :class="user?.isadmin ? 'text-green-500' : 'text-red-500'" class="font-medium">
                  {{ user?.isadmin ? t('Sí') : t('No') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Editor -->
          <div class="flex items-center justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-pencil mr-3"></i>
              <span class="font-medium text-secondary">{{ t('Editor') }}</span>
            </div>
            <div class="text-right">
              <div class="flex items-center space-x-2">
                <i v-if="user?.iseditor" class="pi pi-check-circle text-green-500 text-lg"></i>
                <i v-else class="pi pi-times-circle text-red-500 text-lg"></i>
                <span :class="user?.iseditor ? 'text-green-500' : 'text-red-500'" class="font-medium">
                  {{ user?.iseditor ? t('Sí') : t('No') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tester -->
          <div class="flex items-center justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-comment mr-3"></i>
              <span class="font-medium text-secondary">{{ t('Tester') }}</span>
            </div>
            <div class="text-right">
              <div class="flex items-center space-x-2">
                <i v-if="user?.istester" class="pi pi-check-circle text-green-500 text-lg"></i>
                <i v-else class="pi pi-times-circle text-red-500 text-lg"></i>
                <span :class="user?.istester ? 'text-green-500' : 'text-red-500'" class="font-medium">
                  {{ user?.istester ? t('Sí') : t('No') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Acceso al Dashboard -->
          <div class="flex items-center justify-between py-3 border-b last:border-b-0" style="border-color: var(--surface-border);">
            <div class="flex items-center">
              <i class="pi pi-chart-line mr-3"></i>
              <span class="font-medium text-secondary">{{ t('Acceso al Dashboard') }}</span>
            </div>
            <div class="text-right">
              <div class="flex items-center space-x-2">
                <i v-if="user?.dashboard_access" class="pi pi-check-circle text-green-500 text-lg"></i>
                <i v-else class="pi pi-times-circle text-red-500 text-lg"></i>
                <span :class="user?.dashboard_access ? 'text-green-500' : 'text-red-500'" class="font-medium">
                  {{ user?.dashboard_access ? t('Sí') : t('No') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
