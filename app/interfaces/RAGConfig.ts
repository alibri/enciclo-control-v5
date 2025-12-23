export interface RAGConfig {
  agent: string;
  model: string;
  collection: string;
  classification: string;
  semantic: boolean;
  bm25: boolean;
  context: boolean;
  clean_query: boolean;
  topN: number;
  num_queries: number;
  use_docs: number;
  min_count: number;
  temperature: number;
  tono_audiencia: string;
}

