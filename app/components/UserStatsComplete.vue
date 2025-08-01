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
  };;
  return options;
});

</script>

<template>

    <div class="col-span-12 lg:col-span-6 xl:col-span-6">
      <div class="bg-white rounded-lg shadow-md p-6 mb-2">
        <div class="flex justify-between mb-3">
          <div>
            <span class="block text-gray-500 font-medium mb-3">{{ t('Total Logins') }}</span>
            <div class="text-gray-900 font-medium text-xl">
              {{ loginlength }}
            </div>
          </div>
          <div class="flex items-center justify-center bg-blue-100 rounded-full print:hidden"
            style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-sign-in text-blue-500 text-xl" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <Chart type="line" :data="chartLogins" :options="chartOptions" class="h-30rem" />
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-6">
      <div class="bg-white rounded-lg shadow-md p-6 mb-2">
        <div class="flex justify-between mb-3">
          <div>
            <span class="block text-gray-500 font-medium mb-3">{{ t('Páginas Vistas') }}</span>
            <div class="text-gray-900 font-medium text-xl">
              {{ pageslength }}
            </div>
          </div>
          <div class="flex items-center justify-center bg-green-100 rounded-full print:hidden"
            style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-copy text-green-500 text-xl" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <Chart type="line" :data="chartPages" :options="chartOptions" class="h-30rem" />
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-6">
      <div class="bg-white rounded-lg shadow-md p-6 mb-2">
        <div class="flex justify-between mb-3">
          <div>
            <span class="block text-gray-500 font-medium mb-3">{{ t('Tiempo Total') }}</span>
            <div class="text-gray-900 font-medium text-xl">
              {{ total_time }}
            </div>
          </div>
          <div class="flex items-center justify-center bg-red-100 rounded-full print:hidden"
            style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-clock text-red-500 text-xl" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <Chart type="line" :data="chartTime" :options="chartOptions" class="h-30rem" />
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-6">
      <div class="bg-white rounded-lg shadow-md p-6 mb-2">
        <div class="flex justify-between mb-3">
          <div>
            <span class="block text-gray-500 font-medium mb-3">{{ t('Total Pregúntame') }}</span>
            <div class="text-gray-900 font-medium text-xl">
              {{ chatslength }}
            </div>
          </div>
          <div class="flex items-center justify-center bg-yellow-100 rounded-full print:hidden"
            style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-comment text-yellow-500 text-xl" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <Chart type="line" :data="chartChats" :options="chartOptions" class="h-30rem" />
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-6 print:hidden">
      <div class="bg-white rounded-lg shadow-md p-6 print:hidden">
        <h4>{{ t('Sesiones') }}</h4>
        <SimpleSessionsDataTable :value="value.logins" :rows="10" :paginator="true" :show-end="true"
          :show-user="showUser" />
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-6 print:hidden">
      <div class="bg-white rounded-lg shadow-md p-6 print:hidden">
        <h4>{{ t('Páginas') }}</h4>
        <SimplePagesDataTable :value="value.pages" :rows="10" :paginator="true" :show-user="showUser" />
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-6 print:hidden">
      <div class="bg-white rounded-lg shadow-md p-6 mb-2">
        <div class="flex justify-between mb-3">
          <div>
            <span class="block text-gray-500 font-medium mb-3">{{ t('Total Consultas') }}</span>
            <div class="text-gray-900 font-medium text-xl">
              {{ querieslength }}
            </div>
          </div>
          <div class="flex items-center justify-center bg-cyan-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-question-circle text-cyan-500 text-xl" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <SimpleQueriesDataTable :value="props.value.queries" :rows="10" :paginator="true" :show-user="showUser" />
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-6 print:hidden">
      <div class="bg-white rounded-lg shadow-md p-6 mb-2">
        <div class="flex justify-between mb-3">
          <div>
            <span class="block text-gray-500 font-medium mb-3">{{ t('Total Pregúntame') }}</span>
            <div class="text-gray-900 font-medium text-xl">
              {{ chatslength }}
            </div>
          </div>
          <div class="flex items-center justify-center bg-yellow-100 rounded-full"
            style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-print text-yellow-500 text-xl" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <SimpleChatsDataTable :value="props.value.chats" :rows="10" :paginator="true" :show-user="showUser" />
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-6 print:hidden">
      <div class="bg-white rounded-lg shadow-md p-6 mb-2">
        <div class="flex justify-between mb-3">
          <div>
            <span class="block text-gray-500 font-medium mb-3">{{ t('Total Impresiones') }}</span>
            <div class="text-gray-900 font-medium text-xl">
              {{ printslength }}
            </div>
          </div>
          <div class="flex items-center justify-center bg-green-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-print text-green-500 text-xl" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <SimplePrintsDataTable :value="props.value.prints" :rows="10" :paginator="true" :show-user="showUser" />
      </div>
    </div>

</template>
