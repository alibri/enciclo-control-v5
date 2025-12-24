import { useApiClient } from '~/stores/api';
import type { ApiClient, ApiResponse } from '~/interfaces/ApiResponse';
import type { PageInfo } from '~/interfaces/PageInfo';
import type { Entidad } from '~/interfaces/Entidad';
import type { CollectionInterface } from '~/interfaces/Collection';
import type {
  GetPageInfoParams,
  GetPageWikiParams,
  SearchPagesParams,
  SearchByTitleParams,
  SaveDashboardParams,
  GetPageImagesParams,
  SaveWikiParams,
  ExecQueryParams,
  ExportWikiParams
} from '~/interfaces/services/PageServiceParams';

export default class PageService {
  api: ApiClient;

  constructor () {
    this.api = useApiClient();
  }

  async getPageInfo (collection: string, title: string): Promise<ApiResponse<{ page: PageInfo; entidades: Entidad[] }>> {
    const params: GetPageInfoParams = { title, collection };
    return await this.api.get<{ page: PageInfo; entidades: Entidad[] }>('page', params);
  }

  async getPageWiki (collection: string, title: string): Promise<ApiResponse<{ wiki: string }>> {
    const params: GetPageWikiParams = { title, collection };
    return await this.api.get<{ wiki: string }>('wiki', params);
  }

  async searchPages (keyword: string, collections: string, type: string): Promise<ApiResponse<unknown[]>> {
    const params: SearchPagesParams = { keyword, collections, type };
    return await this.api.get<unknown[]>('search', params);
  }

  async getCollections (): Promise<ApiResponse<CollectionInterface[]>> {
    return await this.api.get<CollectionInterface[]>('collections');
  }

  async getDashboard (collection: string): Promise<ApiResponse<unknown>> {
    return await this.api.get<unknown>('dashboard', { collection });
  }

  async searchByTitle (collection: string, query: string): Promise<ApiResponse<unknown[]>> {
    const params: SearchByTitleParams = { collection, term: query };
    return await this.api.get<unknown[]>('searchtitle', params);
  }

  async saveDashboard (collection: string, data: unknown): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const params: SaveDashboardParams = { collection, data };
    return await this.api.get<{ success: boolean; message?: string }>('savedashboard', params);
  }

  async publishDashboard (collection: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return await this.api.get<{ success: boolean; message?: string }>('publishdashboard', { collection });
  }

  async getPageImages (collection: string, title: string): Promise<ApiResponse<unknown[]>> {
    const params: GetPageImagesParams = { title, collection };
    return await this.api.get<unknown[]>('pageimages', params);
  }

  async saveWiki (collection: string, title: string, content: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const params: SaveWikiParams = { collection, title, content };
    return await this.api.get<{ success: boolean; message?: string }>('savewiki', params);
  }

  async getQueries (): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('getqueries');
  }

  async execQuery (query: string, collections: string): Promise<ApiResponse<unknown>> {
    const params: ExecQueryParams = { query, collections };
    return await this.api.get<unknown>('execquery', params);
  }

  async exportWiki (data: unknown[]): Promise<ApiResponse<{ success: boolean; url?: string }>> {
    const params: ExportWikiParams = { data };
    return await this.api.get<{ success: boolean; url?: string }>('exportwiki', params);
  }
}
