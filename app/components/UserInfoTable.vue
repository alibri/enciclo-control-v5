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
  <div class="grid grid-cols-12 gap-8">
    <div class="col-span-12 lg:col-span-6 xl:col-span-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <ul class="list-none p-0 m-0">
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-6 md:w-2 font-medium font-bold">
              {{ t('Usuario') }}
            </div>
            <div class="text-gray-900 w-full md:w-8 md:order-0 order-1 text-red-500">
              {{ user?.user }}
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-6 md:w-2 font-medium font-bold">
              {{ t('Nombre') }}
            </div>
            <div class="text-gray-900 w-full md:w-8 md:order-0 order-1 font-bold text-green-600">
              {{ user?.name }}
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-6 md:w-2 font-medium font-bold">
              {{ t('Grupo') }}
            </div>
            <div class="text-gray-900 w-full md:w-8 md:order-0 order-1">
              <NuxtLink v-if="user?.grupo" :to="'/users/g__' + user?.grupo">
                <span class="font-bold border-none border-b border-dotted">{{ user?.grupo }}</span> <i
                  class="pi pi-chart-bar text-gray-500" />
              </NuxtLink>
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-6 md:w-2 font-medium font-bold">
              {{ t('Activo') }}
            </div>
            <div class="text-gray-900 w-full md:w-8 md:order-0 order-1">
              <i v-if="user?.isenabled" class="pi pi-check text-purple-600 font-bold" />
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-6 md:w-2 font-medium font-bold">
              {{ t('Admin') }}
            </div>
            <div class="text-gray-900 w-full md:w-8 md:order-0 order-1">
              <i v-if="user?.isadmin" class="pi pi-check text-green-600 font-bold" />
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-6 md:w-2 font-medium font-bold">
              {{ t('Editor') }}
            </div>
            <div class="text-gray-900 w-full md:w-8 md:order-0 order-1">
              <i v-if="user?.iseditor" class="pi pi-check text-pink-600 font-bold" />
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-6 md:w-2 font-medium font-bold">
              {{ t('Tester') }}
            </div>
            <div class="text-gray-900 w-full md:w-8 md:order-0 order-1">
              <i v-if="user?.istester" class="pi pi-check text-pink-600 font-bold" />
            </div>
          </li>
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 w-6 md:w-2 font-medium font-bold">
              {{ t('Colecciones') }}
            </div>
            <div class="text-gray-900 w-full md:w-8 md:order-0 order-1">
              <Tag v-for="item in user?.collections" :key="item" :value="item" rounded class="mr-2" />
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="col-span-12 lg:col-span-6 xl:col-span-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <DataTable :value="[
          {
            label: t('Licencias'),
            value: user?.licenses
          },
          {
            label: t('Desde'),
            value: convertDateFormat(user?.begin)
          },
          {
            label: t('Hasta'), 
            value: convertDateFormat(user?.end)
          },
          {
            label: t('IP'),
            value: user?.iprange
          },
          {
            label: t('GeoIP'),
            value: user?.geoip
          },
          {
            label: t('Referer'),
            value: user?.referer
          }
        ]" showGridlines stripedRows>
          <Column field="label" :header="t('Campo')" bodyClass="text-gray-500 font-medium font-bold" />
          <Column field="value" :header="t('Valor')" bodyClass="text-gray-900" />
        </DataTable>
      </div>
    </div>
  </div>
</template>
