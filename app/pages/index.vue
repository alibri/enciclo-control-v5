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
const loadData = async () => {
  const response2 = await statsService.getUserStats({
    from: Math.round(dates.value[0].getTime() / 1000),
    to: Math.round(dates.value[1].getTime() / 1000)
  });
  if (checkLogged(response2)) {
    stats.value = response2?.data?.value;
  }
};
const interval: Number = 10000; // runtimeConfig.public?.INTERVAL_REFRESH_ACTIVES as Number;
const interval2: Number = 30000; // runtimeConfig.public?.INTERVAL_REFRESH_ACTIVES as Number;
let timer: any = null;
let timer2: any = null;

onMounted(() => {
  loadData();
  loadActiveSessions();
  timer = setInterval(() => {
    loadActiveSessions();
  }, interval as number);

  timer2 = setInterval(() => {
    loadData();
  }, interval2 as number);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <span>
    <div class="grid">
      <div class="col-12 lg:col-6 xl:col-6">
        <div class="card mb-0">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">{{ t('Sesiones Activas') }}</span>
              <div class="text-900 font-medium text-xl">
                {{ sessions.length }}
              </div>
            </div>
            <div
              class="flex align-items-center justify-content-center bg-cyan-100 border-round"
              style="width: 2.5rem; height: 2.5rem"
            >
              <i class="pi pi-star text-cyan-500 text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 lg:col-6 xl:col-6">
        <div class="card">
          <h5>{{ t('Sesiones Activas') }}</h5>
          <SimpleSessionsDataTable :value="sessions" :rows="5" :show-user="true" :show-end="true"/>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="grid p-1">
        <div class="col-12 lg:col-12 xl:col-12 noprint">
          <div class="card flex justify-content-center">
            <div class="flex-auto-">
              <InputGroup>
                <Calendar
                  v-model="dates"
                  selection-mode="range"
                  :manual-input="true"
                  :placeholder="t('Periodo')"
                />
                <Button icon="pi pi-refresh" severity="success" @click="loadData()" />
              </InputGroup>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="col-12">
        <UserStatsComplete :value="stats" :show-user="true" />
      </div>
    </div>
  </span>
</template>
