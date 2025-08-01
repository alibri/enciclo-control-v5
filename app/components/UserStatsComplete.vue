<script setup lang="ts">
import Chart from 'primevue/chart';

const props = defineProps({
  value: {
    type: Object,
    default: null
  },

  showUser: {
    type: Boolean,
    default: true
  }
});

const { t } = useI18n();

const loginlength = computed(() => props.value?.logins?.length);
const pageslength = computed(() => props.value?.pages?.length);
const querieslength = computed(() => props.value?.queries?.length);
const printslength = computed(() => props.value?.prints?.length);
const total_time = computed(() => formatSegundosAHora(props.value?.total_time));
const chatslength = computed(() => props.value?.chats?.length);

const documentStyle = getComputedStyle(document.documentElement);
const textColor = documentStyle.getPropertyValue('--text-color');
const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

const chartLogins = computed(() => {
  if (!props.value?.logins_days) {
    return {};
  }
  const data = {
    labels: Object.keys(props.value?.logins_days).map(item => convertDateFormat(item)),
    datasets: [
      {
        label: t('Logins'),
        data: Object.values(props.value?.logins_days),
        fill: false,
        borderColor: documentStyle.getPropertyValue('--blue-500'),
        tension: 0.4
      }
    ]
  };

  return data;
});

const chartTime = computed(() => {
  if (!props.value?.time_days) {
    return {};
  }
  const data = {
    labels: Object.keys(props.value?.time_days).map(item => convertDateFormat(item)),
    datasets: [
      {
        label: t('Tiempo (minutos)'),
        data: Object.values(props.value?.time_days).map((item) => (item as number) / 60),
        fill: false,
        borderColor: documentStyle.getPropertyValue('--red-500'),
        tension: 0.4
      }
    ]
  };

  return data;
});

const chartPages = computed(() => {
  if (!props.value?.pages_days) {
    return {};
  }
  const data = {
    labels: Object.keys(props.value?.pages_days).map(item => convertDateFormat(item)),
    datasets: [
      {
        label: t('Páginas vistas'),
        data: Object.values(props.value?.pages_days),
        fill: false,
        borderColor: documentStyle.getPropertyValue('--green-500'),
        tension: 0.4
      }
    ]
  };

  return data;
});

const chartChats = computed(() => {
  if (!props.value?.chats_days) {
    return {};
  }
  const data = {
    labels: Object.keys(props.value?.chats_days).map(item => convertDateFormat(item)),
    datasets: [
      {
        label: t('Consultas Pregúntame'),
        data: Object.values(props.value?.chats_days),
        fill: false,
        borderColor: documentStyle.getPropertyValue('--yellow-500'),
        tension: 0.4
      }
    ]
  };

  return data;
});

const chartOptions = computed(() => {
  const options = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
      legend: {
        labels: {
          color: textColor
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        }
      },
      y: {
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        }
      }
    }
  }; ;
  return options;
});

</script>

<template>
  <span>
    <div class="card">
      <div class="grid p-1">
        <div class="col-12 lg:col-6 xl:col-6">
          <div class="card mb-2">
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">{{ t('Total Logins') }}</span>
                <div class="text-900 font-medium text-xl">
                  {{ loginlength }}
                </div>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-blue-100 border-round noprint"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-sign-in text-blue-500 text-xl" />
              </div>
            </div>
          </div>
          <div class="card">
            <Chart type="line" :data="chartLogins" :options="chartOptions" class="h-30rem" />
          </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-6">
          <div class="card mb-2">
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">{{ t('Páginas Vistas') }}</span>
                <div class="text-900 font-medium text-xl">
                  {{ pageslength }}
                </div>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-green-100 border-round noprint"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-copy text-green-500 text-xl" />
              </div>
            </div>
          </div>
          <div class="card">
            <Chart type="line" :data="chartPages" :options="chartOptions" class="h-30rem" />
          </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-6">
          <div class="card mb-2">
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">{{ t('Tiempo Total') }}</span>
                <div class="text-900 font-medium text-xl">
                  {{ total_time }}
                </div>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-red-100 border-round noprint"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-clock text-red-500 text-xl" />
              </div>
            </div>
          </div>
          <div class="card">
            <Chart type="line" :data="chartTime" :options="chartOptions" class="h-30rem" />
          </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-6">
          <div class="card mb-2">
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">{{ t('Total Pregúntame') }}</span>
                <div class="text-900 font-medium text-xl">
                  {{ chatslength }}
                </div>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-yellow-100 border-round noprint"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-comment text-yellow-500 text-xl" />
              </div>
            </div>
          </div>
          <div class="card">
            <Chart type="line" :data="chartChats" :options="chartOptions" class="h-30rem" />
          </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-6 noprint">
          <div class="card noprint">
            <h4>{{ t('Sesiones') }}</h4>
            <SimpleSessionsDataTable
              :value="value.logins"
              :rows="10"
              :paginator="true"
              :show-end="true"
              :show-user="showUser"
            />
          </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-6 noprint">
          <div class="card noprint">
            <h4>{{ t('Páginas') }}</h4>
            <SimplePagesDataTable :value="value.pages" :rows="10" :paginator="true" :show-user="showUser" />
          </div>
        </div>

        <div class="col-12 lg:col-6 xl:col-6 noprint">
          <div class="card mb-2">
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">{{ t('Total Consultas') }}</span>
                <div class="text-900 font-medium text-xl">
                  {{ querieslength }}
                </div>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-cyan-100 border-round"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-question-circle text-cyan-500 text-xl" />
              </div>
            </div>
          </div>
          <div class="card">
            <SimpleQueriesDataTable :value="props.value.queries" :rows="10" :paginator="true" :show-user="showUser" />
          </div>
        </div>

        <div class="col-12 lg:col-6 xl:col-6 noprint">
          <div class="card mb-2">
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">{{ t('Total Pregúntame') }}</span>
                <div class="text-900 font-medium text-xl">
                  {{ chatslength }}
                </div>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-yellow-100 border-round"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-print text-yellow-500 text-xl" />
              </div>
            </div>
          </div>
          <div class="card">
            <SimpleChatsDataTable :value="props.value.chats" :rows="10" :paginator="true" :show-user="showUser" />
          </div>
        </div>

        <div class="col-12 lg:col-6 xl:col-6 noprint">
          <div class="card mb-2">
            <div class="flex justify-content-between mb-3">
              <div>
                <span class="block text-500 font-medium mb-3">{{ t('Total Impresiones') }}</span>
                <div class="text-900 font-medium text-xl">
                  {{ printslength }}
                </div>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-green-100 border-round"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-print text-green-500 text-xl" />
              </div>
            </div>
          </div>
          <div class="card">
            <SimplePrintsDataTable :value="props.value.prints" :rows="10" :paginator="true" :show-user="showUser" />
          </div>
        </div>
      </div>
    </div>
  </span>
</template>
