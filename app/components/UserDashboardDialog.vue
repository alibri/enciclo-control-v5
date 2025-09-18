<script setup lang="ts">
import StatsService from '~/services/statsService';

const { t } = useI18n();

interface Props {
  visible: boolean;
  user: any;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const closeDialog = () => {
  emit('update:visible', false);
};

const statsService = new StatsService();

const loading = ref(true);

const collections = ref<any[]>([]);
const collectionSelected = ref<any | null>(null);
const userPageStats = ref(null);

const loadData = async () => {
    loading.value = true;

    /*const data = getParamsData(lazyParams.value);

    const response = await statsService.getCollections(data);
    if (checkLogged(response)) {
        collections.value = response?.data?.value?.collections;
        const firstCollectionKey = Object.keys(collections.value)[0];
        collectionSelected.value = firstCollectionKey ? (collections.value as any)[firstCollectionKey] || null : null;
        loadUserPageStats();
    }*/


    collections.value = props.user.collections || [];
    collectionSelected.value = collections.value[0] || null;
    loadUserPageStats();

    loading.value = false;
};

const onTabChange = (event: any) => {
    collectionSelected.value = event || null;
    loadUserPageStats();
};

const loadUserPageStats = async () => {
    if (!collectionSelected.value) return;

    loading.value = true;
    const response = await statsService.getUserPageStats(props.user.id, collectionSelected.value);
    if (checkLogged(response)) {
        userPageStats.value = response?.data?.value.stats[collectionSelected.value];
    }
    loading.value = false;
};

watch(() => props.visible, (nuevo, anterior) => {
  // Aquí puedes poner la lógica que necesites cuando cambie props.user
  // Por ejemplo, recargar estadísticas del usuario
  loadData();
});
</script>

<template>
  <Dialog 
    :visible="visible" 
    :header="t('Dashboard del Usuario')" 
    :modal="true" 
    :style="{ width: '70rem' }" 
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div v-if="user" class="flex flex-col gap-4">
      <div class="flex items-center gap-3  bg-gray-50 rounded-lg p-4">
        <i class="pi pi-user text-2xl text-blue-500"></i>
        <div class="p-4 shadow-sm">
          <h3 class="text-2xl font-extrabold text-blue-700 mb-2 flex items-center gap-2">
            <i class="pi pi-id-card text-blue-400"></i>
            {{ user.name }}
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="flex items-center gap-2">
              <i class="pi pi-user text-gray-500"></i>
              <span class="font-semibold text-gray-700">{{ t('Usuario') }}:</span>
              <span class="text-gray-800">{{ user.user }}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-users text-gray-500"></i>
              <span class="font-semibold text-gray-700">{{ t('Grupo') }}:</span>
              <span class="text-gray-800">{{ user.grupo }}</span>
            </div>
            <div class="flex items-center gap-2 col-span-1 sm:col-span-2">
              <i class="pi pi-book text-gray-500"></i>
              <span class="font-semibold text-gray-700">{{ t('Colecciones') }}:</span>
              <span class="text-gray-800">
                <span v-if="user.collections && user.collections.length">
                  <span v-for="(col, idx) in user.collections" :key="col" class="inline-block bg-blue-100 text-blue-800 rounded px-2 py-0.5 mr-1 text-xs font-medium">
                    {{ col }}
                  </span>
                </span>
                <span v-else class="text-gray-400">{{ t('Ninguna') }}</span>
              </span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-calendar text-gray-500"></i>
              <span class="font-semibold text-gray-700">{{ t('Inicio estadísticas') }}:</span>
              <span class="text-gray-800">{{ user.stats_min || t('No especificado') }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <Divider />
      
      <div class="card">
        <h2>{{ t('Páginas/Accesos') }}</h2>
        <div class="grid grid-cols-12 p-1">
            <div class="col-span-12">
                <Tabs :value="collectionSelected" @update:value="onTabChange">
                    <TabList>
                        <Tab v-for="tab in collections" :key="tab" :value="tab">
                            <span v-if="collectionSelected === tab">
                                <i class="pi pi-book"></i>
                            </span>
                            {{ tab }}
                        </Tab>
                    </TabList>
                </Tabs>
            </div>
            <div class="col-span-12">
                <UserCollectionStats :collection="collectionSelected" :userPageStats="userPageStats"
                    :loading="loading" :user="user.user" />
            </div>
        </div>
    </div>

    </div>
    
    <template #footer>
      <Button :label="t('Cerrar')" icon="pi pi-times" @click="closeDialog" class="p-button-text" />
    </template>
  </Dialog>
</template>

<style scoped>
/* Estilos específicos del componente si son necesarios */
</style>
