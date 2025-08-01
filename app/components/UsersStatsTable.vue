<script lang="ts" setup>
/// <reference types=".vue-global-types/vue_3.4_false.d.ts" />
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
  <div class="surface-section">
    <ul class="list-none p-0 m-0">
      <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
        <div class="text-400 flex-grow-1 font-medium font-bold">
          {{ t('Usuario') }}
        </div>
        <div class="text-400 w-1 md:flex-order-0 flex-order-1 font-medium font-bold text-center">
          {{ t('Logins') }}
        </div>
        <div class="text-400 w-1 md:flex-order-0 flex-order-1 font-medium font-bold text-center">
          {{ t('Páginas') }}
        </div>
        <div class="text-400 w-1 md:flex-order-0 flex-order-1 font-medium font-bold text-center">
          {{ t('Pergúntame') }}
        </div>
        <div class="text-400 w-1 md:flex-order-0 flex-order-1 font-medium font-bold text-center">
          {{ t('Tiempo Total') }}
        </div>
        <div class="text-400 w-1 md:flex-order-0 flex-order-1 font-medium font-bold text-center">
          {{ t('Min. Inicio') }}
        </div>
        <div class="text-400 w-full md:w-2 md:flex-order-0 flex-order-1 font-medium font-bold text-center">
          {{ t('Max. Final') }}
        </div>
      </li>
      <template v-for="item in value" :key="item">
        <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
          <div class="text-500 flex-grow-1 font-medium font-bold">
            <NuxtLink :to="'/users/'+item.user" class="text-red-500 border-none border-bottom-1 border-dotted">
              {{ item.user }}
            </NuxtLink>
          </div>
          <div class="text-900 w-1 md:flex-order-0 flex-order-1 text-300 text-center">
            {{ item.logins }}
          </div>
          <div class="text-900 w-1 md:flex-order-0 flex-order-1 text-blue-400 text-center">
            {{ item.pages }}
          </div>
          <div class="text-900 w-1 md:flex-order-0 flex-order-1 text-yellow-400 text-center">
            {{ item.chats }}
          </div>
          <div class="text-900 w-1 md:flex-order-0 flex-order-1 text-blue-500 text-center">
            {{ formatSegundosAHora(item.ts) }}
          </div>
          <div class="text-900 w-1 md:flex-order-0 flex-order-1 text-green-400 text-center">
            {{ formatDateTime(Number(item.min)) }}
          </div>
          <div class="text-900 w-full md:w-2 md:flex-order-0 flex-order-1 text-green-400 text-center">
            {{ formatDateTime(Number(item.max)) }}
          </div>
        </li>
      </template>
    </ul>
  </div>
</template>
