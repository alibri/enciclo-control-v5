<script lang="ts" setup>

import type { Ref } from 'vue';
import ChatLink from './ChatLink.vue';
import 'flag-icons/css/flag-icons.min.css';

const { showMessage } = useMessages();
const { t } = useI18n();

const dialogRef = inject<Ref<{ data: { chat: string } }>>('dialogRef');

const chat = ref<any>(dialogRef!.value.data.chat);
chat.value.response.langs = getChatLanguages(chat.value.response);
console.log('ChatViewer', chat.value.response.langs);

const getLanguageFlag = (lang: string) => {
  const flagMap: { [key: string]: { type: 'fi' | 'img', value: string } } = {
    'es': { type: 'fi', value: 'es' },
    'en': { type: 'fi', value: 'gb' },
    'fr': { type: 'fi', value: 'fr' },
    'pt': { type: 'fi', value: 'pt' },
    'cat': { type: 'img', value: '/flags/catalonia.svg' },
    'eu': { type: 'img', value: '/flags/basque.svg' },
    'gl': { type: 'img', value: '/flags/galicia.svg' }
  };
  return flagMap[lang] || { type: 'fi', value: 'es' };
};

</script>

<template>
  <div class="mb-2">
    <span class="bg-green-300 text-white border p-1 m-1 text-xs" severity="success">{{ formatDateTime(chat?.date) }}</span>
    <span class="bg-yellow-300 text-white border p-1 m-1 text-xs" severity="warning">{{ chat?.collection }}</span>
    <span class="bg-blue-300 text-white border p-1 m-1 text-xs" severity="info">{{ chat?.user }}</span>
    <span class="bg-red-300 text-white border p-1 m-1 text-xs" severity="danger">{{ formatFloat(chat?.time, 6) }}s </span>
    <span class="bg-green-400 text-white border p-1 m-1 text-xs" severity="contrast">{{ formatIntNumber(chat?.prompt_tokens + chat?.completion_tokens) }} tokens</span>
    <span class="bg-green-500 text-white border p-1 m-1 text-xs" severity="success">{{ chat?.response?.model }}</span>
    <span v-show="chat?.response?.idioma" class="bg-blue-500 text-white border p-1 m-1 text-xs" severity="success">{{ chat?.response?.idioma }}</span>
  </div>
  <div class="m-1">
    <Chip class="py-0 pl-0 pr-3">
      <span class="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center">{{ chat?.counter }}</span>
      <ChatLink :code="chat?.code" :link="chat?.short_url" />
    </Chip>
  </div>

  <div class="mb-2 bg-gray-100 p-3">
    <div v-html="formatLike(chat?.like)" />
    <TabView>
      <TabPanel :header="t('Principal')" value="principal">
        <p class="m-0" v-html="formatStringPre(chat?.response?.content)" />
      </TabPanel>
      <TabPanel v-for="(translation, index) in chat?.response?.langs" :key="index" :value="translation">
        <template #header>
          <div class="flex items-center gap-2">
            <template v-if="getLanguageFlag(translation).type === 'fi'">
              <span :class="'fi fi-' + getLanguageFlag(translation).value" class="w-4 h-4"></span>
            </template>
            <template v-else>
              <img :src="getLanguageFlag(translation).value" :alt="translation" class="w-4 h-4 object-contain" />
            </template>
          </div>
        </template>
        <p class="m-0" v-html="formatStringPre(chat?.response?.translations.find((t: any) => t.key === translation)?.value)" />
      </TabPanel>
    </TabView>
  </div>
  <template v-if="chat?.response?.sabias">
    <div class="bg-gray-100 p-3">
      <h4>{{ t('Sabías que') }}</h4>
      <TabView>
      <TabPanel :header="t('Principal')" value="sabias-principal">
        <strong>{{ chat?.response.titular }}</strong>
        <p class="mb-3">
          {{ chat?.response?.sabias }}
        </p>
      </TabPanel>
      <TabPanel v-for="(translation, index) in chat?.response?.translations?.find((t: any) => t.key === 'titular').value" :key="index" :value="'sabias-' + index">
        <template #header>
          <div class="flex items-center gap-2">
            <template v-if="getLanguageFlag(String(index)).type === 'fi'">
              <span :class="'fi fi-' + getLanguageFlag(String(index)).value" class="w-4 h-4"></span>
            </template>
            <template v-else>
              <img :src="getLanguageFlag(String(index)).value" :alt="String(index)" class="w-4 h-4 object-contain" />
            </template>
          </div>
        </template>
        <strong>{{ translation }}</strong>
        <p class="mb-3">{{ chat?.response?.translations.find((t: any) => t.key === 'sabias').value[index] }}</p>
      </TabPanel>
    </TabView>
    </div> 

  </template>
  <hr>
  <div class="grid">
    <div class="col">
      <h4>{{ t('Preguntas') }}</h4>
      <ul>
        <div v-for="(question, index) in chat?.response?.queries" :key="index">
          <li class="mb-1">
            <Tag severity="info" :value="'💡 ' + question" />
          </li>
        </div>
      </ul>
    </div>
    <div class="col">
      <h4>{{ t('Entidades') }}</h4>
      <ul>
        <div v-for="(question, index) in chat?.response.entidades" :key="index">
          <li class="mb-1">
            <Tag severity="success" :value="'🔍 ' + question" />
          </li>
        </div>
      </ul>
    </div>
  </div>
  <hr>
  <div class="grid">
    <div class="col">
      <h4>{{ t('Fuentes') }}</h4>
      <Tag v-if="chat?.response.documents_used" severity="warning" :value="chat?.response.documents_used" class="ml-1" />

      <ul>
        <div v-for="(source, index) in chat?.response.sources" :key="index">
          <li class="mb-3">
            <a :href="source.source" target="_blank">[{{ source.collection }}] - {{ source.title }}</a>
            <p class="text-sm text-gray-500">
              {{ source.content }}
            </p>
          </li>
        </div>
      </ul>
    </div>
    <div class="col">
      <h4>{{ t('Relacionados') }}</h4>
      <ul>
        <div v-for="(source, index) in chat?.response.related" :key="index">
          <li class="mb-3">
            <a :href="getPageLink(source.collection, source.title)" target="_blank">[{{ source.collection }}] - {{
              source.title }}</a>
          </li>
        </div>
      </ul>
    </div>
  </div>
  <hr>
  <div class="grid">
    <div class="col">
      <h4>{{ t('Tiempos') }}</h4>
      <DataTable :value="chat?.response.times" striped-rows size="small">
        <Column field="field">
          <template #body="slotProps">
            <span class="font-bold text-sm">{{ slotProps.data.field }}</span>
          </template>
        </Column>
        <Column field="value" class="text-right">
          <template #body="slotProps">
            <span class="text-gray-500 text-sm" style="font-family: system-ui;">{{ formatFloat(slotProps.data.value, 6)
            }}s</span>
          </template>
        </Column>
      </DataTable>
    </div>
    <div class="col">
      <h4>{{ t('Uso') }}</h4>
      <DataTable :value="chat?.response.usage" striped-rows size="small">
        <Column field="field">
          <template #body="slotProps">
            <span class="font-bold text-sm">{{ slotProps.data.field }}</span>
          </template>
        </Column>
        <Column field="value" class="text-right">
          <template #body="slotProps">
            <span class="text-gray-500 text-sm" style="font-family: system-ui;">{{ formatIntNumber(slotProps.data.value)
            }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
.p-inputtextarea {
  font-family: monospace;
  font-size: 12px;
}
</style>
