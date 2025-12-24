<script setup lang="ts">
import StatsService from '~/services/statsService';
import PageService from '~/services/pageService';
import type { Stats } from '~/interfaces/Stats';
import type { PageInfo } from '~/interfaces/PageInfo';
import type { Entidad } from '~/interfaces/Entidad';

const statsService = new StatsService();
const pageService = new PageService();

const dialog = useDialog();
const { t } = useI18n();

const stats = ref<Stats | null>(null);

const props = defineProps({
  page: {
    type: String,
    default: null
  },
  collection: {
    type: String,
    default: null
  }
});

const info = ref<PageInfo | null>(null);
const dates = ref();
const entidades = ref<Entidad[]>([]);

const desde = new Date();
desde.setMonth(desde.getMonth() - 1);
dates.value = [desde, new Date()];

const pageslength = computed(() => stats?.value?.pages?.length);
const previewslength = computed(() => stats?.value?.previews?.length);
const printslength = computed(() => stats?.value?.prints?.length);

const loadData = async () => {
  const response = await pageService.getPageInfo(props.collection, props.page);
  if (checkLogged(response)) {
    info.value = response?.data?.value?.page;
    entidades.value = response?.data?.value?.entidades;
  }
  const response2 = await statsService.getPageStats({
    title: props.page,
    collection: props.collection,
    from: Math.round(dates.value[0].getTime() / 1000),
    to: Math.round(dates.value[1].getTime() / 1000)
  });
  if (checkLogged(response2)) {
    stats.value = response2?.data?.value;
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <span>
    <div class=" shadow-md p-6">
      <h2><span class="text-blue-500">{{ info?.title }}</span></h2>
      <h4>{{ collection }} -> {{ page }}</h4>
      <div class="grid p-1">
        <div class="col-span-1">
          <div class="flex justify-center items-center">
            <img :src="info?.img" :alt="t('[SIN IMAGEN]')" class="responsive-image">
          </div>
        </div>
        <div class="col-span-11">
          <p>
            <Accordion>
              <AccordionTab :header="t('Descripción')">
                <p>{{ info?.description }}</p>
              </AccordionTab>
              <AccordionTab :header="t('Entidades')">
                <p class="m-0">
                  <template v-for="item in entidades" :key="item.alias">
                    <Button
                      size="small"
                      class="m-1"
                      type="button"
                      :label="item.entity + ' (' + item.type + ')'"
                      severity="secondary"
                      :badge="item.weight.toString()"
                      badge-severity="info"
                    />
                  </template>
                </p>
              </AccordionTab>
            </Accordion>
          </p>
          <p>
            <Button class="mr-2" :label="t('Ver')" icon="pi pi-external-link" severity="success" @click="info && openPage(info.url)" />
            <Button
              v-if="info"
              class="mr-2"
              :label="t('Editar')"
              icon="pi pi-file-edit"
              severity="danger"
              @click="openPage(getEditorLink(collection, info.title))"
            />
            <Button icon="pi pi-pencil" severity="primary" @click="info && editOnFly(dialog, { collection, title: info.title })" />
          </p>
        </div>
      </div>
    </div>
    <div class=" shadow-md p-6 flex justify-center">
      <div class="flex-1">
        <InputGroup>
          <Calendar v-model="dates" selection-mode="range" :manual-input="true" :placeholder="t('Periodo')" />
          <Button icon="pi pi-refresh" severity="success" @click="loadData()" />
        </InputGroup>
      </div>
    </div>
    <div class="grid p-1">
      <div class="col-span-12 lg:col-span-6 xl:col-span-4">
        <div class=" shadow-md p-6 mb-2">
          <div class="flex justify-between mb-3">
            <div>
              <span class="block text-gray-500 font-medium mb-3">{{ t('Completa') }}</span>
              <div class="text-gray-900 font-medium text-xl">
                {{ pageslength }}
              </div>
            </div>
            <div class="flex items-center justify-center bg-orange-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-copy text-orange-500 text-xl" />
            </div>
          </div>
        </div>
        <div class=" shadow-md p-6">
          <SimplePagesDataTable :value="stats?.pages || []" :rows="10" :paginator="true" :show-user="true" :show-title="false" />
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6 xl:col-span-4">
        <div class=" shadow-md p-6 mb-2">
          <div class="flex justify-between mb-3">
            <div>
              <span class="block text-gray-500 font-medium mb-3">{{ t('Vista Previa') }}</span>
              <div class="text-gray-900 font-medium text-xl">
                {{ previewslength }}
              </div>
            </div>
            <div class="flex items-center justify-center bg-blue-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-eye text-cyan-500 text-xl" />
            </div>
          </div>
        </div>
        <div class=" shadow-md p-6">
          <SimplePagesDataTable :value="stats?.previews || []" :rows="10" :paginator="true" :show-user="true" :show-title="false" />
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6 xl:col-span-4">
        <div class=" shadow-md p-6 mb-2">
          <div class="flex justify-between mb-3">
            <div>
              <span class="block text-gray-500 font-medium mb-3">{{ t('Impresiones') }}</span>
              <div class="text-gray-900 font-medium text-xl">
                {{ printslength }}
              </div>
            </div>
            <div class="flex items-center justify-center bg-green-100 rounded-full" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-print text-green-500 text-xl" />
            </div>
          </div>
        </div>
        <div class=" shadow-md p-6">
          <SimplePrintsDataTable :value="stats?.prints || []" :rows="10" :paginator="true" :show-user="true" :show-title="false" />
        </div>
      </div>
    </div>
  </span>
</template>

<style scoped>
/* Estilos CSS para hacer que la imagen sea responsive con PrimeFlex */
.responsive-image {
  max-width: 100%;
  height: auto;
}
</style>
