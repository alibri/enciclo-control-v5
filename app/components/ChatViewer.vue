<script lang="ts" setup>

import type { Ref } from 'vue';
import RAGResultView from './RAGResultView.vue';

const { t } = useI18n();

interface Props {
  chat?: any;
}

const props = defineProps<Props>();

// Compatibilidad con sistema de diálogo (inject) y props
const dialogRef = inject<Ref<{ data: { chat: string } }> | undefined>('dialogRef', undefined);

const chat = computed(() => {
  // Si se pasa como prop, usar prop; si no, usar el sistema de diálogo
  if (props.chat) {
    return props.chat;
  }
  return dialogRef?.value?.data?.chat || {};
});

// Transformar los datos del chat al formato que espera RAGResultView
const transformedResult = computed(() => {
  const chatData = chat.value;
  const response = chatData?.response || {};
  
  // Si response es un string JSON, parsearlo
  let parsedResponse = response;
  if (typeof response === 'string') {
    try {
      parsedResponse = JSON.parse(response);
    } catch (e) {
      parsedResponse = {};
    }
  } else {
    parsedResponse = response;
  }
  
  // Transformar times de array de objetos a objeto plano
  const times: any = {};
  if (parsedResponse?.times && Array.isArray(parsedResponse?.times)) {
    parsedResponse?.times.forEach((item: any) => {
      times[item.field] = item.value;
    });
  } else if (parsedResponse?.times && typeof parsedResponse?.times === 'object') {
    Object.assign(times, parsedResponse?.times);
  }
  
  // Agregar tiempo total si existe en el chat
  if (chatData?.time !== undefined) {
    times.total = chatData.time;
  }
  
  // Transformar usage de array de objetos a objeto plano
  const usage: any = {};
  if (parsedResponse?.usage && Array.isArray(parsedResponse?.usage)) {
    parsedResponse?.usage.forEach((item: any) => {
      usage[item.field] = item.value;
    });
  } else if (parsedResponse?.usage && typeof parsedResponse?.usage === 'object') {
    Object.assign(usage, parsedResponse?.usage);
  }
  
  // Si no hay usage pero hay tokens en el chat, usarlos
  if (!usage.prompt_tokens && chatData?.prompt_tokens !== undefined) {
    usage.prompt_tokens = chatData.prompt_tokens;
  }
  if (!usage.completion_tokens && chatData?.completion_tokens !== undefined) {
    usage.completion_tokens = chatData.completion_tokens;
  }
  if (!usage.total_tokens && (usage.prompt_tokens || usage.completion_tokens)) {
    usage.total_tokens = (usage.prompt_tokens || 0) + (usage.completion_tokens || 0);
  }
  
  // Transformar entidades si es necesario
  let entidades = parsedResponse?.entidades || [];
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
  
  // Función helper para convertir valores a string cuando sea necesario
  const toString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'object') {
      // Si es un objeto, intentar convertirlo a string de forma segura
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  // Procesar traducciones para asegurar que todos los valores sean strings
  let translations: any = parsedResponse?.translations || {};
  if (translations && typeof translations === 'object') {
    const processedTranslations: any = {};
    Object.keys(translations).forEach(key => {
      const value = translations[key];
      if (typeof value === 'object' && value !== null) {
        // Si es un objeto (como translations.sabias[lang]), procesar recursivamente
        const processedValue: any = {};
        Object.keys(value).forEach(subKey => {
          processedValue[subKey] = toString(value[subKey]);
        });
        processedTranslations[key] = processedValue;
      } else {
        processedTranslations[key] = toString(value);
      }
    });
    translations = processedTranslations;
  }

  // Construir el objeto result en el formato esperado por RAGResultView
  return {
    query: toString(chatData?.query),
    content: toString(parsedResponse?.content),
    response: toString(parsedResponse?.content),
    sabias: toString(parsedResponse?.sabias),
    titular: toString(parsedResponse?.titular),
    preguntas_sugeridas: Array.isArray(parsedResponse?.preguntas_sugeridas) ? parsedResponse.preguntas_sugeridas.map((p: any) => toString(p)) : [],
    resumen_turno_actual: toString(parsedResponse?.resumen_turno_actual),
    memory: Array.isArray(parsedResponse?.memory) ? parsedResponse.memory.map((m: any) => toString(m)) : (parsedResponse?.memory ? [toString(parsedResponse.memory)] : []),
    ultimo_turno_verbatim: parsedResponse?.ultimo_turno_verbatim || '',
    pregunta_reescrita_autonoma: toString(parsedResponse?.pregunta_reescrita_autonoma),
    tipo_flujo: toString(parsedResponse?.tipo_flujo),
    last_id_query: chatData?.last_id_query || null,
    tono_audiencia: parsedResponse?.tono_audiencia ? toString(parsedResponse.tono_audiencia) : null,
    clasificacion: parsedResponse?.clasificacion ? toString(parsedResponse.clasificacion) : undefined,
    razonamiento_breve: parsedResponse?.razonamiento_breve ? toString(parsedResponse.razonamiento_breve) : undefined,
    es_pregunta: parsedResponse?.es_pregunta,
    porcentaje_asignacion: parsedResponse?.porcentaje_asignacion,
    clasificacion_top3: parsedResponse?.clasificacion_top3,
    agent: parsedResponse?.agent ? toString(parsedResponse.agent) : undefined,
    model: parsedResponse?.model || chatData?.response?.model ? toString(parsedResponse?.model || chatData?.response?.model) : undefined,
    idioma: parsedResponse?.idioma ? toString(parsedResponse.idioma) : undefined,
    temperature: parsedResponse?.temperature,
    semantic: parsedResponse?.semantic,
    bm25: parsedResponse?.bm25,
    context: parsedResponse?.context,
    clean_query: parsedResponse?.clean_query,
    topN: parsedResponse?.topN,
    num_queries: parsedResponse?.num_queries,
    use_docs: parsedResponse?.use_docs,
    min_count: parsedResponse?.min_count,
    filter: parsedResponse?.filter ? toString(parsedResponse.filter) : undefined,
    embedding: parsedResponse?.embedding ? toString(parsedResponse.embedding) : undefined,
    index: parsedResponse?.index ? toString(parsedResponse.index) : undefined,
    entidades: entidades,
    queries: Array.isArray(parsedResponse?.queries) ? parsedResponse.queries.map((q: any) => toString(q)) : [],
    sources: parsedResponse?.sources || [],
    related: parsedResponse?.related || [],
    docs: parsedResponse?.docs || [],
    translations: translations,
    times: times,
    usage: usage,
    documents_used: parsedResponse?.documents_used,
    collection: chatData?.collection ? toString(chatData.collection) : undefined,
    user: chatData?.user ? toString(chatData.user) : undefined,
    date: chatData?.date,
    code: chatData?.code ? toString(chatData.code) : undefined,
    short_url: chatData?.short_url ? toString(chatData.short_url) : undefined,
    counter: chatData?.counter,
    like: chatData?.like
  };
});

// Configuración para pasar a RAGResultView (puede estar vacía o contener valores por defecto)
const config = computed(() => {
  const chatData = chat.value;
  let response = chatData?.response || {};
  
  // Si response es un string JSON, parsearlo
  if (typeof response === 'string') {
    try {
      response = JSON.parse(response);
    } catch (e) {
      response = {};
    }
  }
  
  return {
    agent: response.agent,
    model: response.model || chatData?.response?.model,
    semantic: response.semantic,
    bm25: response.bm25,
    context: response.context,
    clean_query: response.clean_query,
    topN: response.topN,
    num_queries: response.num_queries,
    use_docs: response.use_docs,
    min_count: response.min_count,
    collection: chatData?.collection,
    temperature: response.temperature
  };
});

</script>

<template>
  <RAGResultView :result="transformedResult" :config="config" :show-evaluation="false" :show-json="false" />
</template>

