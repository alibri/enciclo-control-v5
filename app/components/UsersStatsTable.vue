<script lang="ts" setup>
import type { PropType } from 'vue';
const { t } = useI18n();

interface UserStats {
  user: string;
  logins: number;
  pages: number;
  chats: number;
  ts: number;
  min: string;
  max: string;
}

defineProps({
  value: {
    type: Array as PropType<UserStats[]>,
    default: () => []
  }
});

</script>

<template>
  <div class=" shadow-md p-6">
    <ul class="list-none p-0 m-0">
      <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
        <div class="text-gray-400 flex-grow font-medium font-bold">
          {{ t('Usuario') }}
        </div>
        <div class="text-gray-400 w-50 md:order-0 order-1 font-medium font-bold text-center">
          {{ t('Logins') }}
        </div>
        <div class="text-gray-400 w-50 md:order-0 order-1 font-medium font-bold text-center">
          {{ t('Páginas') }}
        </div>
        <div class="text-gray-400 w-50 md:order-0 order-1 font-medium font-bold text-center">
          {{ t('Pergúntame') }}
        </div>
        <div class="text-gray-400 w-50 md:order-0 order-1 font-medium font-bold text-center">
          {{ t('Tiempo Total') }}
        </div>
        <div class="text-gray-400 w-50 md:order-0 order-1 font-medium font-bold text-center">
          {{ t('Min. Inicio') }}
        </div>
        <div class="text-gray-400 w-full md:w-32 md:order-0 order-1 font-medium font-bold text-center">
          {{ t('Max. Final') }}
        </div>
      </li>
      
      <span v-if="value && value.length > 0">
        <template v-for="item in value" :key="item">
          <li class="flex items-center py-3 px-2 border-t border-gray-200 flex-wrap">
            <div class="text-gray-500 flex-grow font-medium font-bold">
              <NuxtLink :to="'/users/'+item.user" class="text-red-500 border-none border-b border-dotted">
                {{ item.user }}
              </NuxtLink>
            </div>
            <div class="text-gray-900 w-50 md:order-0 order-1 text-gray-300 text-center">
              {{ item.logins }}
            </div>
            <div class="text-gray-900 w-50 md:order-0 order-1 text-blue-400 text-center">
              {{ item.pages }}
            </div>
            <div class="text-gray-900 w-50 md:order-0 order-1 text-yellow-400 text-center">
              {{ item.chats }}
            </div>
            <div class="text-gray-900 w-50 md:order-0 order-1 text-blue-500 text-center">
              {{ formatSegundosAHora(item.ts) }}
            </div>
            <div class="text-gray-900 w-50 md:order-0 order-1 text-green-400 text-center">
              {{ formatDateTime(Number(item.min)) }}
            </div>
            <div class="text-gray-900 w-full md:w-32 md:order-0 order-1 text-green-400 text-center">
              {{ formatDateTime(Number(item.max)) }}
            </div>
          </li>
        </template>
      </span>
    </ul>
  </div>
</template>
