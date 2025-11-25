<script lang="ts" setup>

import type { Ref } from 'vue';
import RAGResultView from './RAGResultView.vue';

const { t } = useI18n();

const dialogRef = inject<Ref<{ data: { chat: string } }>>('dialogRef');

const chat = ref<any>(dialogRef!.value.data.chat);

// Transformar los datos del chat al formato que espera RAGResultView
const transformedResult = computed(() => {
  const response = chat.value?.response || {};
  
  // Transformar times de array de objetos a objeto plano
  const times: any = {};
  if (response.times && Array.isArray(response.times)) {
    response.times.forEach((item: any) => {
      times[item.field] = item.value;
    });
  } else if (response.times && typeof response.times === 'object') {
    Object.assign(times, response.times);
  }
  
  // Agregar tiempo total si existe en el chat
  if (chat.value?.time !== undefined) {
    times.total = chat.value.time;
  }
  
  // Transformar usage de array de objetos a objeto plano
  const usage: any = {};
  if (response.usage && Array.isArray(response.usage)) {
    response.usage.forEach((item: any) => {
      usage[item.field] = item.value;
    });
  } else if (response.usage && typeof response.usage === 'object') {
    Object.assign(usage, response.usage);
  }
  
  // Si no hay usage pero hay tokens en el chat, usarlos
  if (!usage.prompt_tokens && chat.value?.prompt_tokens !== undefined) {
    usage.prompt_tokens = chat.value.prompt_tokens;
  }
  if (!usage.completion_tokens && chat.value?.completion_tokens !== undefined) {
    usage.completion_tokens = chat.value.completion_tokens;
  }
  if (!usage.total_tokens && (usage.prompt_tokens || usage.completion_tokens)) {
    usage.total_tokens = (usage.prompt_tokens || 0) + (usage.completion_tokens || 0);
  }
  
  // Transformar entidades si es necesario
  let entidades = response.entidades || [];
  if (Array.isArray(entidades) && entidades.length > 0) {
    // Si son strings, convertirlos a objetos
    if (typeof entidades[0] === 'string') {
      entidades = entidades.map((ent: string) => {
        // Intentar parsear si tiene formato "Nombre: X, Tipo: Y"
        const match = ent.match(/Nombre:\s*(.+?)(?:,\s*Tipo:\s*(.+))?/);
        if (match && match[1]) {
          return { nombre: match[1].trim(), tipo: match[2]?.trim() || '' };
        }
        return { nombre: ent, tipo: '' };
      });
    }
  }
  
  // Construir el objeto result en el formato esperado por RAGResultView
  return {
    query: chat.value?.query || '',
    content: response.content || '',
    response: response.content || '',
    sabias: response.sabias || '',
    titular: response.titular || '',
    preguntas_sugeridas: response.preguntas_sugeridas || [],
    resumen_turno_actual: response.resumen_turno_actual || '',
    memory: response.memory || '',
    ultimo_turno_verbatim: response.ultimo_turno_verbatim || '',
    pregunta_reescrita_autonoma: response.pregunta_reescrita_autonoma || '',
    tipo_flujo: response.tipo_flujo || '',
    last_id_query: chat.value?.last_id_query || null,
    tono_audiencia: response.tono_audiencia || null,
    clasificacion: response.clasificacion,
    razonamiento_breve: response.razonamiento_breve,
    es_pregunta: response.es_pregunta,
    porcentaje_asignacion: response.porcentaje_asignacion,
    clasificacion_top3: response.clasificacion_top3,
    agent: response.agent,
    model: response.model || chat.value?.response?.model,
    idioma: response.idioma,
    temperature: response.temperature,
    semantic: response.semantic,
    bm25: response.bm25,
    context: response.context,
    clean_query: response.clean_query,
    topN: response.topN,
    num_queries: response.num_queries,
    use_docs: response.use_docs,
    min_count: response.min_count,
    filter: response.filter,
    embedding: response.embedding,
    index: response.index,
    entidades: entidades,
    queries: response.queries || [],
    sources: response.sources || [],
    related: response.related || [],
    docs: response.docs || [],
    translations: response.translations || {},
    times: times,
    usage: usage,
    documents_used: response.documents_used,
    collection: chat.value?.collection,
    user: chat.value?.user,
    date: chat.value?.date,
    code: chat.value?.code,
    short_url: chat.value?.short_url,
    counter: chat.value?.counter,
    like: chat.value?.like
  };
});

// Configuración para pasar a RAGResultView (puede estar vacía o contener valores por defecto)
const config = computed(() => {
  const response = chat.value?.response || {};
  return {
    agent: response.agent,
    model: response.model || chat.value?.response?.model,
    semantic: response.semantic,
    bm25: response.bm25,
    context: response.context,
    clean_query: response.clean_query,
    topN: response.topN,
    num_queries: response.num_queries,
    use_docs: response.use_docs,
    min_count: response.min_count,
    collection: chat.value?.collection,
    temperature: response.temperature
  };
});

</script>

<template>
  <RAGResultView :result="transformedResult" :config="config" :show-evaluation="false" :show-json="false" />
</template>

