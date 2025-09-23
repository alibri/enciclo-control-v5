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

</script>

<template>
  <UserDashboardDialog v-model:visible="displayDashboard" :user="dashboardUser" />
  <div class="grid grid-cols-12 gap-8">
    <div class="col-span-12 lg:col-span-6 xl:col-span-6">
      <div class="border border-gray-200 rounded-lg p-6">
        <ul class="list-none p-0 m-0">
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-50 md:w-50 font-medium font-bold">
              {{ t('Usuario') }}
            </div>
            <div class="text-gray-900 w-full md:w-64 md:order-0 order-1 text-red-500">
              {{ user?.user }} <a @click="verDashboard(user)" class="text-blue-500 cursor-pointer"><i class="pi pi-chart-line"></i></a>
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-50 md:w-50 font-medium font-bold">
              {{ t('Nombre') }}
            </div>
            <div class="text-gray-900 w-full md:w-64 md:order-0 order-1 font-bold text-green-600">
              {{ user?.name }}
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-50 md:w-50 font-medium font-bold">
              {{ t('Grupo') }}
            </div>
            <div class="text-gray-900 w-full md:w-64 md:order-0 order-1">
              <NuxtLink v-if="user?.grupo" :to="'/users/g__' + user?.grupo">
                <span class="font-bold border-none border-b border-dotted">{{ user?.grupo }}</span> <i
                  class="pi pi-chart-bar text-gray-500" />
              </NuxtLink>
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-50 md:w-50 font-medium font-bold">
              {{ t('Activo') }}
            </div>
            <div class="text-gray-900 w-full md:w-64 md:order-0 order-1">
              <i v-if="user?.isenabled" class="pi pi-check text-purple-600 font-bold" />
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-50 md:w-50 font-medium font-bold">
              {{ t('Admin') }}
            </div>
            <div class="text-gray-900 w-full md:w-64 md:order-0 order-1">
              <i v-if="user?.isadmin" class="pi pi-check text-green-600 font-bold" />
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-50 md:w-50 font-medium font-bold">
              {{ t('Editor') }}
            </div>
            <div class="text-gray-900 w-full md:w-64 md:order-0 order-1">
              <i v-if="user?.iseditor" class="pi pi-check text-pink-600 font-bold" />
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-50 md:w-50 font-medium font-bold">
              {{ t('Tester') }}
            </div>
            <div class="text-gray-900 w-full md:w-64 md:order-0 order-1">
              <i v-if="user?.istester" class="pi pi-check text-pink-600 font-bold" />
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-50 md:w-50 font-medium font-bold">
              {{ t('Colecciones') }}
            </div>
            <div class="text-gray-900 w-full md:w-150 md:order-0 order-1">
              <Tag v-for="item in user?.collections" :key="item" :value="item" rounded class="mr-2" />
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-6">
      <div class="border border-gray-200 rounded-lg p-6">
        <ul class="list-none p-0 m-0">
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-50 md:w-50 font-medium font-bold">
              {{ t('Licencias') }}
            </div>
            <div class="text-gray-900 w-full md:w-64 md:order-0 order-1 font-bold text-green-600">
              {{ user?.licenses }}
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-50 md:w-50 font-medium font-bold">
              {{ t('Desde') }}
            </div>
            <div class="text-gray-900 w-full md:w-64 md:order-0 order-1 text-blue-500">
              {{ convertDateFormat(user?.begin) }}
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-50 md:w-50 font-medium font-bold">
              {{ t('Hasta') }}
            </div>
            <div class="text-gray-900 w-full md:w-64 md:order-0 order-1 text-blue-500">
              {{ convertDateFormat(user?.end) }}
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-50 md:w-50 font-medium font-bold">
              {{ t('IP') }}
            </div>
            <div class="text-blue-600 w-full md:w-64 md:order-0 order-1">
              {{ user?.iprange }}
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-50 md:w-50 font-medium font-bold">
              {{ t('GeoIP') }}
            </div>
            <div class="text-yellow-400 w-full md:w-64 md:order-0 order-1">
              {{ user?.geoip }}
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-50 md:w-50 font-medium font-bold">
              {{ t('Referer') }}
            </div>
            <div class="text-green-600 w-full md:w-64 md:order-0 order-1">
              {{ user?.referer }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
