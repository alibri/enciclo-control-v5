import type { ApiRequestParams } from '~/interfaces/ApiResponse';

/**
 * Parámetros para obtener información de una página
 */
export interface GetPageInfoParams extends ApiRequestParams {
  title: string;
  collection: string;
}

/**
 * Parámetros para obtener wiki de una página
 */
export interface GetPageWikiParams extends ApiRequestParams {
  title: string;
  collection: string;
}

/**
 * Parámetros para buscar páginas
 */
export interface SearchPagesParams extends ApiRequestParams {
  keyword: string;
  collections: string;
  type: string;
}

/**
 * Parámetros para buscar por título
 */
export interface SearchByTitleParams extends ApiRequestParams {
  collection: string;
  term: string;
}

/**
 * Parámetros para guardar dashboard
 */
export interface SaveDashboardParams extends ApiRequestParams {
  collection: string;
  data: unknown;
}

/**
 * Parámetros para obtener imágenes de página
 */
export interface GetPageImagesParams extends ApiRequestParams {
  title: string;
  collection: string;
}

/**
 * Parámetros para guardar wiki
 */
export interface SaveWikiParams extends ApiRequestParams {
  collection: string;
  title: string;
  content: string;
}

/**
 * Parámetros para ejecutar query
 */
export interface ExecQueryParams extends ApiRequestParams {
  query: string;
  collections: string;
}

/**
 * Parámetros para exportar wiki
 */
export interface ExportWikiParams extends ApiRequestParams {
  data: unknown[];
}

