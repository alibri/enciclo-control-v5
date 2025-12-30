<script setup lang="ts">
import StatsService from '~/services/statsService';

useAuthGuard();

const statsService = new StatsService();

const route = useRoute();
const { t } = useI18n();
const stats = ref<any>({});
const idParam = computed(() => {
  const param = route.params.id;
  if (Array.isArray(param)) {
    return param[0] ?? '';
  }
  return param ?? '';
});
const isGroup = computed(() => idParam.value.startsWith('g__'));
const id = computed(() => idParam.value);
const description = computed(() => idParam.value.replace('g__', ''));
const pageslength = computed(() => stats.value?.pages?.length ?? 0);
const querieslength = computed(() => stats.value?.queries?.length ?? 0);
const printslength = computed(() => stats?.value?.prints?.length);
// const users = computed(() => Object.keys(stats?.value?.users).split(','));

const loadData = async () => {
  const response = await statsService.getSessionStats(id.value);
  if (checkLogged(response)) {
    stats.value = response?.data?.value;
    if (stats.value?.user?.collections && stats.value?.user?.collections.length > 0) {
      stats.value.user.collections = stats.value.user.collections.split(',');
    }
  }
};

onMounted(() => {
  loadData();
});

</script>

<template>
  <span>
    <div class="card">
      <div class="grid p-1">
        <div class="col-span-12 lg:col-span-12 xl:col-span-12">
          <div class="rounded-lg border shadow-sm mb-4" style="background-color: var(--surface-card); border-color: var(--surface-border);">
            <div class="flex items-center justify-between p-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i v-if="isGroup" class="pi pi-users text-blue-600 text-xl"></i>
                  <i v-else class="pi pi-user text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h1 class="text-2xl font-bold mb-1" style="color: var(--text-color);">
                    <span v-if="isGroup">{{ t('Sesiones de Grupo') }}</span>
                    <span v-else>{{ t('Detalles de Sesión') }}</span>
                  </h1>
                  <div class="flex items-center gap-2">
                    <span class="text-sm" style="color: var(--text-color-secondary);">{{ t('ID') }}:</span>
                    <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-mono font-medium">
                      {{ description }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <p class="text-xs mb-1" style="color: var(--text-color-secondary);">{{ t('Última actualización') }}</p>
                  <p class="text-sm" style="color: var(--text-color-secondary);">{{ new Date().toLocaleTimeString() }}</p>
                </div>
                <Button 
                  icon="pi pi-refresh" 
                  severity="success" 
                  @click="loadData()"
                  class="!w-12 !h-12"
                  :pt="{
                    root: 'rounded-full shadow-md hover:shadow-lg transition-all duration-200'
                  }"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="col-span-12 lg:col-span-12 xl:col-span-12">
          <SessionInfo v-if="!isGroup" :session-data="stats?.session" />
        </div>
        <div class="col-span-12 lg:col-span-12 xl:col-span-12 mt-2">
          <UserInfoTable v-if="!isGroup" :user="stats?.user" />
        </div>
        <div v-if="isGroup" class="col-span-12 lg:col-span-12 xl:col-span-12">
          <UsersStatsTable :value="stats?.users" />
        </div>
      </div>
    </div>
    <div class="card">
      <div>
        <div class="grid p-1">
          <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card mb-2">
              <div class="flex justify-between mb-3">
                <div>
                  <span class="block text-gray-500 font-medium mb-3">{{ t('Páginas Vistas') }}</span>
                  <div class="font-medium text-xl" style="color: var(--text-color);">
                    {{ pageslength }}
                  </div>
                </div>
                <div class="flex items-center justify-center bg-orange-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
                  <i class="pi pi-copy text-orange-500 text-xl" />
                </div>
              </div>
            </div>
            <div class="card">
              <SimplePagesDataTable :value="stats.pages" :rows="10" :paginator="true" :show-user="isGroup" />
            </div>
          </div>

          <div class="col-span-12 lg:col-span-6 xl:col-span-4 mt-2">
            <div class="card mb-2">
              <div class="flex justify-between">
                <div>
                  <span class="block text-gray-500 font-medium mb-3">{{ t('Total Consultas') }}</span>
                  <div class="font-medium text-xl" style="color: var(--text-color);">
                    {{ querieslength }}
                  </div>
                </div>
                <div class="flex items-center justify-center bg-cyan-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
                  <i class="pi pi-question-circle text-cyan-500 text-xl" />
                </div>
              </div>
            </div>
            <div class="card">
              <SimpleQueriesDataTable :value="stats.queries" :rows="10" :paginator="true" :show-user="isGroup" />
            </div>
          </div>

          <div class="col-span-12 lg:col-span-6 xl:col-span-4 mt-2">
            <div class="card mb-2">
              <div class="flex justify-between">
                <div>
                  <span class="block text-gray-500 font-medium mb-3">{{ t('Total Impresiones') }}</span>
                  <div class="font-medium text-xl" style="color: var(--text-color);">
                    {{ printslength }}
                  </div>
                </div>
                <div class="flex items-center justify-center bg-green-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
                  <i class="pi pi-print text-green-500 text-xl" />
                </div>
              </div>
            </div>
            <div class="card">
              <SimplePrintsDataTable :value="stats.prints" :rows="10" :paginator="true" :show-user="isGroup" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </span>
</template>
