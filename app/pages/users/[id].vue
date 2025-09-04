<script setup lang="ts">
import StatsService from '~/services/statsService';

const statsService = new StatsService();

const route = useRoute();
const { t } = useI18n();
const stats = ref([]);
const user = ref(route.params.id);
const dates = ref();
const desde = new Date();
desde.setMonth(desde.getMonth() - 1);
// desde.setFullYear(desde.getFullYear() - 10);
dates.value = [desde, new Date()];
const isGroup = ref(String(route.params.id || '').startsWith('g__'));
const description = ref(String(route.params.id || '').replace('g__', ''));

const loadData = async () => {
  const response = await statsService.getUserStats({
    id: user.value,
    from: Math.round(dates.value[0].getTime() / 1000),
    to: Math.round(dates.value[1].getTime() / 1000)
  });
  if (checkLogged(response)) {
    stats.value = response?.data?.value;
    if ((stats.value as any)?.user?.collections) {
      (stats.value as any).user.collections = (stats.value as any).user.collections.split(',');
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
      <div v-if="isGroup" class="col-span-11">
        <h2>{{ t('Estadísticas grupo') }} <span class="text-blue-500">{{ description }}</span></h2>
        <div class="grid p-1 noprint">
          <div class="col-span-12 lg:col-span-12 xl:col-span-12">
            <div class="surface-section">
              <UsersStatsTable :value="(stats as any)?.users" />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="col-span-11">
        <h2>{{ t('Estadísticas usuario') }} <span class="text-blue-500">{{ description }}</span></h2>
        <div class="grid p-1 noprint">
          <UserInfoTable :user="(stats as any)?.user" />
        </div>
      </div>
    </div>
    <div class="card">
      <div class="grid grid-cols-12 gap-4 p-4">
        <div class="col-span-12 flex justify-center items-center print:hidden">
          <div class="w-full max-w-md">
            <InputGroup>
              <DatePicker v-model="dates" selection-mode="range" :manual-input="true" :placeholder="t('Periodo')" />
              <Button icon="pi pi-refresh" severity="success" @click="loadData()" />
            </InputGroup>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="grid grid-cols-12 gap-8 mt-1">
        <UserStatsComplete :value="stats" :show-user="isGroup" />
      </div>
    </div>
  </span>
</template>
