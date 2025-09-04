<script setup lang="ts">
import StatsService from '~/services/statsService';

const statsService = new StatsService();

const route = useRoute();
const { t } = useI18n();
const stats = ref([]);
const isGroup = ref(route.params.id.startsWith('g__'));
const id = ref(route.params.id);
const description = ref(route.params.id.replace('g__', ''));
const pageslength = computed(() => stats?.value?.pages?.length);
const querieslength = computed(() => stats?.value?.queries?.length);
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
          <div class="flex align-items-center py-3 px-2 surface-border flex-wrap">
            <div v-if="isGroup" class="col-span-11">
              <h2>{{ t('Sesiones Grupo') }} <span class="text-blue-500">{{ description }}</span></h2>
            </div>
            <div v-else class="col-span-11">
              <h2>{{ t('Sesión') }} <span class="text-blue-500">{{ description }}</span></h2>
            </div>
            <div class="col-span-1 text-right">
              <Button icon="pi pi-refresh" severity="success" @click="loadData()" />
            </div>
          </div>
        </div>
        <div v-if="!isGroup" class="col-span-12 lg:col-span-6 xl:col-span-6">
          <div class="surface-section">
            <ul class="list-none p-0 m-0">
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Usuario') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1 text-red-500">
                  {{ stats?.session?.user }}
                  <NuxtLink :to="'/users/'+stats?.session?.user">
                    <i class="pi pi-chart-bar text-500" />
                  </NuxtLink>
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Inicio') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  {{ formatDateTime(stats?.session?.min) }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Último') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  {{ formatDateTime(stats?.session?.max) }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Tiempo') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  {{ formatSegundosAHora(stats?.session?.ts) }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Páginas') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  {{ stats?.session?.pages }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('IP') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1 text-yellow-500">
                  {{ stats?.session?.ip }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('GeoIP') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  {{ stats?.session?.geoip }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Referer') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  {{ stats?.session?.referer }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Mode') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  {{ formatLoginMode(stats?.session?.mode) }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Agent') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1 text-xs text-400">
                  {{ stats?.session?.agent }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Browser') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1 text-xs text-400">
                  {{ stats?.session?.browser }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('SO') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1 text-xs text-400">
                  {{ stats?.session?.platform }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('País') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1  text-green-500">
                  {{ stats?.session?.glc_country_name }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Región') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1 text-blue-300">
                  {{ stats?.session?.glc_city }}
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div v-if="!isGroup" class="col-span-12 lg:col-span-6 xl:col-span-6">
          <div class="surface-section">
            <ul class="list-none p-0 m-0">
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Usuario') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1 text-red-500">
                  {{ stats?.user?.user }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Nombre') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1 font-bold text-green-600">
                  {{ stats?.user?.name }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Grupo') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  <NuxtLink v-if="stats?.user?.grupo" :to="'/sessions/g__'+stats?.user?.grupo">
                    <span class="font-bold border-none border-bottom-1 border-dotted">{{ stats?.user?.grupo }}</span> <i class="pi pi-chart-bar text-500" />
                  </NuxtLink>
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Activo') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  <i v-if="stats?.user?.isenabled" class="pi pi-check text-purple-600 font-bold" />
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Admin') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  <i v-if="stats?.user?.isadmin" class="pi pi-check text-green-600 font-bold" />
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Editor') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  <i v-if="stats?.user?.iseditor" class="pi pi-check text-pink-600 font-bold" />
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Tester') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  <i v-if="stats?.user?.istester" class="pi pi-check text-pink-600 font-bold" />
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Licencias') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  {{ stats?.user?.licenses }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Colecciones') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  <Tag v-for="item in stats?.user?.collections" :key="item" :value="item" rounded class="mr-2" />
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Desde') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  {{ stats?.user?.begin }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Hasta') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  {{ stats?.user?.end }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('IP') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  {{ stats?.user?.iprange }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('GeoIP') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  {{ stats?.user?.geoip }}
                </div>
              </li>
              <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-24 md:w-16 font-medium font-bold">
                  {{ t('Referer') }}
                </div>
                <div class="text-900 w-full md:w-64 md:flex-order-0 flex-order-1">
                  {{ stats?.user?.referer }}
                </div>
              </li>
            </ul>
          </div>
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
              <div class="flex justify-content-between mb-3">
                <div>
                  <span class="block text-500 font-medium mb-3">{{ t('Páginas Vistas') }}</span>
                  <div class="text-900 font-medium text-xl">
                    {{ pageslength }}
                  </div>
                </div>
                <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                  <i class="pi pi-copy text-orange-500 text-xl" />
                </div>
              </div>
            </div>
            <div class="card">
              <SimplePagesDataTable :value="stats.pages" :rows="10" :paginator="true" :show-user="isGroup" />
            </div>
          </div>

          <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card mb-2">
              <div class="flex justify-content-between mb-3">
                <div>
                  <span class="block text-500 font-medium mb-3">{{ t('Total Consultas') }}</span>
                  <div class="text-900 font-medium text-xl">
                    {{ querieslength }}
                  </div>
                </div>
                <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                  <i class="pi pi-question-circle text-cyan-500 text-xl" />
                </div>
              </div>
            </div>
            <div class="card">
              <SimpleQueriesDataTable :value="stats.queries" :rows="10" :paginator="true" :show-user="isGroup" />
            </div>
          </div>

          <div class="col-span-12 lg:col-span-6 xl:col-span-4">
            <div class="card mb-2">
              <div class="flex justify-content-between mb-3">
                <div>
                  <span class="block text-500 font-medium mb-3">{{ t('Total Impresiones') }}</span>
                  <div class="text-900 font-medium text-xl">
                    {{ printslength }}
                  </div>
                </div>
                <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
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
