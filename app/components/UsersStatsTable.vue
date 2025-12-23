<script lang="ts" setup>
import type { PropType } from 'vue';
import type { UserStats } from '~/interfaces/UserStats';

const { t } = useI18n();

defineProps({
  value: {
    type: Array as PropType<UserStats[]>,
    default: () => []
  }
});

</script>

<template>
  <div class="shadow-md p-6" style="background-color: var(--surface-card);">
    <ul class="list-none p-0 m-0">
      <li class="flex items-center py-3 px-2 border-t flex-wrap" style="border-color: var(--surface-border);">
        <div class="flex-grow font-medium font-bold" style="color: var(--text-color-secondary);">
          {{ t('Usuario') }}
        </div>
        <div class="w-50 md:order-0 order-1 font-medium font-bold text-center" style="color: var(--text-color-secondary);">
          {{ t('Logins') }}
        </div>
        <div class="w-50 md:order-0 order-1 font-medium font-bold text-center" style="color: var(--text-color-secondary);">
          {{ t('Páginas') }}
        </div>
        <div class="w-50 md:order-0 order-1 font-medium font-bold text-center" style="color: var(--text-color-secondary);">
          {{ t('Pergúntame') }}
        </div>
        <div class="w-50 md:order-0 order-1 font-medium font-bold text-center" style="color: var(--text-color-secondary);">
          {{ t('Tiempo Total') }}
        </div>
        <div class="w-50 md:order-0 order-1 font-medium font-bold text-center" style="color: var(--text-color-secondary);">
          {{ t('Min. Inicio') }}
        </div>
        <div class="w-full md:w-32 md:order-0 order-1 font-medium font-bold text-center" style="color: var(--text-color-secondary);">
          {{ t('Max. Final') }}
        </div>
      </li>
      
      <span v-if="value && value.length > 0">
        <template v-for="item in value" :key="item">
          <li class="flex items-center py-3 px-2 border-t flex-wrap" style="border-color: var(--surface-border);">
            <div class="flex-grow font-medium font-bold" style="color: var(--text-color-secondary);">
              <NuxtLink :to="'/users/'+item.user" class="border-none border-b border-dotted" style="color: var(--primary-color); border-color: var(--surface-border);">
                {{ item.user }}
              </NuxtLink>
            </div>
            <div class="w-50 md:order-0 order-1 text-center" style="color: var(--text-color);">
              {{ item.logins }}
            </div>
            <div class="w-50 md:order-0 order-1 text-center" style="color: var(--primary-color);">
              {{ item.pages }}
            </div>
            <div class="w-50 md:order-0 order-1 text-center" style="color: var(--text-color);">
              {{ item.chats }}
            </div>
            <div class="w-50 md:order-0 order-1 text-center" style="color: var(--primary-color);">
              {{ formatSegundosAHora(item.ts) }}
            </div>
            <div class="w-50 md:order-0 order-1 text-center" style="color: var(--text-color-secondary);">
              {{ formatDateTime(Number(item.min)) }}
            </div>
            <div class="w-full md:w-32 md:order-0 order-1 text-center" style="color: var(--text-color-secondary);">
              {{ formatDateTime(Number(item.max)) }}
            </div>
          </li>
        </template>
      </span>
    </ul>
  </div>
</template>
