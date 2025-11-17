<script setup lang='ts'>
import StatsService from '~/services/statsService';

const { t } = useI18n();

const sessions = ref([]);
const stats = ref([]);
const dates = ref();
const desde = new Date();
desde.setDate(desde.getDate() - 7);
dates.value = [desde, new Date()];

const statsService = new StatsService();

const loadActiveSessions = async () => {
  const response = await statsService.getActiveSessions();
  if (checkLogged(response)) {
    sessions.value = response.data?.value?.list;
  }
};

const blocked = ref(false);
const loadData = async () => {
  blocked.value = true;
  const response2 = await statsService.getUserStats({
    from: Math.round(dates.value[0].getTime() / 1000),
    to: Math.round(dates.value[1].getTime() / 1000)
  });
  if (checkLogged(response2)) {
    stats.value = response2?.data?.value;
  }
  blocked.value = false;
};
const interval: Number = 10000; // runtimeConfig.public?.INTERVAL_REFRESH_ACTIVES as Number;
let timer: any = null;

onMounted(() => {
  loadData();
  loadActiveSessions();
  timer = setInterval(() => {
    loadActiveSessions();
  }, interval as number);

});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <div class="card">
    <div class="grid grid-cols-12 gap-8">
      <div class="col-span-12 lg:col-span-6 xl:col-span-6">
        <div class="border rounded-lg p-6 mb-0" style="border-color: var(--surface-border); background-color: var(--surface-card);">
          <div class="flex justify-between mb-3">
            <div>
              <span class="block font-medium mb-3" style="color: var(--text-color-secondary);">{{ t('Sesiones Activas') }}</span>
              <div class="font-medium text-xl" style="color: var(--text-color);">
                {{ sessions.length }}
              </div>
            </div>
            <div class="flex items-center justify-center rounded-full"
              style="width: 2.5rem; height: 2.5rem; background-color: var(--highlight-bg);">
              <i class="pi pi-star text-xl" style="color: var(--primary-color);" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6 xl:col-span-6">
        <div class="border rounded-lg p-6" style="border-color: var(--surface-border); background-color: var(--surface-card);">
          <h5 style="color: var(--text-color);">{{ t('Sesiones Activas') }}</h5>
          <SimpleSessionsDataTable :value="sessions" :rows="5" :show-user="true" :show-end="true" />
        </div>
      </div>
    </div>
  </div>

  <BlockUI :blocked="blocked">
    <div class="card">
      <div class="grid grid-cols-12 gap-4 p-4">
        <div class="col-span-12 flex justify-center items-center print:hidden">
          <div class="w-full max-w-md">
            <InputGroup>
              <DatePicker v-model="dates" selection-mode="range" :manual-input="true" update-model-type="date" :placeholder="t('Periodo')" />
              <Button icon="pi pi-refresh" severity="success" @click="loadData()" />
            </InputGroup>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-8 mt-1">
        <UserStatsComplete :value="stats" :show-user="true" />
      </div>
    </div>
  </BlockUI>
</template>
