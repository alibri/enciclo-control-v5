<script setup lang="ts">
import StatsService from '~/services/statsService';
import PageService from '~/services/pageService';

const statsService = new StatsService();
const pageService = new PageService();

const dialog = useDialog();
const { t } = useI18n();
interface Stats {
  pages: any[];
  previews: any[];
  prints: any[];
}

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

interface PageInfo {
  title: string;
  description: string;
  img: string;
  url: string;
}

const info = ref<PageInfo | null>(null);
const dates = ref();
interface Entidad {
  entity: string;
  alias: string;
  type: string;
  complete_name: string;
  weight: number;
}

const entidades = ref<Entidad[]>([]);

const desde = new Date();
desde.setMonth(desde.getMonth() - 1);
dates.value = [desde, new Date()];

const pageslength = computed(() => stats?.value?.pages?.length);
const previewslength = computed(() => stats?.value?.previews?.length);
const printslength = computed(() => stats?.value?.prints?.length);

const loadData = async () => {
  const response = await pageService.getPageInfo(props.collection, props.page);
  console.log(response.data);
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
    <div class="card">
      <h2><span class="text-blue-500">{{ info?.title }}</span></h2>
      <h4>{{ collection }} -> {{ page }}</h4>
      <div class="grid p-1">
        <div class="col-1">
          <div class="p-d-flex p-jc-center p-ai-center">
            <img :src="info?.img" :alt="t('[SIN IMAGEN]')" class="responsive-image">
          </div>
        </div>
        <div class="col-11">
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
            <Button icon="pi pi-pencil" severity="primary" @click="info && editOnFly(dialog, info)" />
          </p>
        </div>
      </div>
    </div>
    <div class="card flex justify-content-center">
      <div class="flex-auto-">
        <InputGroup>
          <Calendar v-model="dates" selection-mode="range" :manual-input="true" :placeholder="t('Periodo')" />
          <Button icon="pi pi-refresh" severity="success" @click="loadData()" />
        </InputGroup>
      </div>
    </div>
    <div class="grid p-1">
      <div class="col-12 lg:col-6 xl:col-4">
        <div class="card mb-2">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">{{ t('Completa') }}</span>
              <div class="text-900 font-medium text-xl">
                {{ pageslength }}
              </div>
            </div>
            <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-copy text-orange-500 text-xl" />
            </div>
          </div>
        </div>
        <div class="card">
          <SimplePagesDataTable :value="stats?.pages || []" :rows="10" :paginator="true" :show-user="true" :show-title="false" />
        </div>
      </div>

      <div class="col-12 lg:col-6 xl:col-4">
        <div class="card mb-2">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">{{ t('Vista Previa') }}</span>
              <div class="text-900 font-medium text-xl">
                {{ previewslength }}
              </div>
            </div>
            <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-eye text-cyan-500 text-xl" />
            </div>
          </div>
        </div>
        <div class="card">
          <SimplePagesDataTable :value="stats?.previews || []" :rows="10" :paginator="true" :show-user="true" :show-title="false" />
        </div>
      </div>

      <div class="col-12 lg:col-6 xl:col-4">
        <div class="card mb-2">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-3">{{ t('Impresiones') }}</span>
              <div class="text-900 font-medium text-xl">
                {{ printslength }}
              </div>
            </div>
            <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-print text-green-500 text-xl" />
            </div>
          </div>
        </div>
        <div class="card">
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
