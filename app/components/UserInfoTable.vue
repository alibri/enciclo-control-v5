<script lang="ts" setup>
const { t } = useI18n();

defineProps({
  user: {
    type: Object,
    default: null
  }
});

</script>

<template>
  <div class="col-12 lg:col-6 xl:col-6">
    <div class="surface-section">
      <ul class="list-none p-0 m-0">
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 w-6 md:w-2 font-medium font-bold">
            {{ t('Usuario') }}
          </div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1 text-red-500">
            {{ user?.user }}
          </div>
        </li>
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 w-6 md:w-2 font-medium font-bold">
            {{ t('Nombre') }}
          </div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1 font-bold text-green-600">
            {{ user?.name }}
          </div>
        </li>
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 w-6 md:w-2 font-medium font-bold">
            {{ t('Grupo') }}
          </div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            <NuxtLink v-if="user?.grupo" :to="'/users/g__'+user?.grupo">
              <span class="font-bold border-none border-bottom-1 border-dotted">{{ user?.grupo }}</span> <i class="pi pi-chart-bar text-500" />
            </NuxtLink>
          </div>
        </li>
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 w-6 md:w-2 font-medium font-bold">
            {{ t('Activo') }}
          </div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            <i v-if="user?.isenabled" class="pi pi-check text-purple-600 font-bold" />
          </div>
        </li>
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 w-6 md:w-2 font-medium font-bold">
            {{ t('Admin') }}
          </div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            <i v-if="user?.isadmin" class="pi pi-check text-green-600 font-bold" />
          </div>
        </li>
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 w-6 md:w-2 font-medium font-bold">
            {{ t('Editor') }}
          </div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            <i v-if="user?.iseditor" class="pi pi-check text-pink-600 font-bold" />
          </div>
        </li>
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 w-6 md:w-2 font-medium font-bold">
            {{ t('Tester') }}
          </div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            <i v-if="user?.istester" class="pi pi-check text-pink-600 font-bold" />
          </div>
        </li>
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 w-6 md:w-2 font-medium font-bold">
            {{ t('Colecciones') }}
          </div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            <Tag v-for="item in user?.collections" :key="item" :value="item" rounded class="mr-2" />
          </div>
        </li>
      </ul>
    </div>
  </div>

  <div class="col-12 lg:col-6 xl:col-6">
    <div class="surface-section">
      <ul class="list-none p-0 m-0">
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 w-6 md:w-2 font-medium font-bold">
            {{ t('Licencias') }}
          </div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            {{ user?.licenses }}
          </div>
        </li>
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 w-6 md:w-2 font-medium font-bold">
            {{ t('Desde') }}
          </div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            {{ convertDateFormat(user?.begin) }}
          </div>
        </li>
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 w-6 md:w-2 font-medium font-bold">
            {{ t('Hasta') }}
          </div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            {{ convertDateFormat(user?.end) }}
          </div>
        </li>
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 w-6 md:w-2 font-medium font-bold">
            {{ t('IP') }}
          </div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            {{ user?.iprange }}
          </div>
        </li>
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 w-6 md:w-2 font-medium font-bold">
            {{ t('GeoIP') }}
          </div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            {{ user?.geoip }}
          </div>
        </li>
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 w-6 md:w-2 font-medium font-bold">
            {{ t('Referer') }}
          </div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            {{ user?.referer }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
