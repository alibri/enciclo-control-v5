import type { ApiResponse } from '~/interfaces/ApiResponse';
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
import { BaseService } from './BaseService';

export default class PageService extends BaseService {

  async getPageInfo (collection: string, title: string): Promise<ApiResponse<{ page: PageInfo; entidades: Entidad[] }>> {
    const params: GetPageInfoParams = { title, collection };
    return await this.get<{ page: PageInfo; entidades: Entidad[] }>('page', params);
  }

  async getPageWiki (collection: string, title: string): Promise<ApiResponse<{ wiki: string }>> {
    const params: GetPageWikiParams = { title, collection };
    return await this.get<{ wiki: string }>('wiki', params);
  }

  async searchPages (keyword: string, collections: string, type: string): Promise<ApiResponse<unknown[]>> {
    const params: SearchPagesParams = { keyword, collections, type };
    return await this.get<unknown[]>('search', params);
  }

  async getCollections (): Promise<ApiResponse<CollectionInterface[]>> {
    return await this.get<CollectionInterface[]>('collections');
  }

  async getDashboard (collection: string): Promise<ApiResponse<unknown>> {
    return await this.get<unknown>('dashboard', { collection });
  }

  async searchByTitle (collection: string, query: string): Promise<ApiResponse<unknown[]>> {
    const params: SearchByTitleParams = { collection, term: query };
    return await this.get<unknown[]>('searchtitle', params);
  }

  async saveDashboard (collection: string, data: unknown): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const params: SaveDashboardParams = { collection, data };
    return await this.get<{ success: boolean; message?: string }>('savedashboard', params);
  }

  async publishDashboard (collection: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return await this.get<{ success: boolean; message?: string }>('publishdashboard', { collection });
  }

  async getPageImages (collection: string, title: string): Promise<ApiResponse<unknown[]>> {
    const params: GetPageImagesParams = { title, collection };
    return await this.get<unknown[]>('pageimages', params);
  }

  async saveWiki (collection: string, title: string, content: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const params: SaveWikiParams = { collection, title, content };
    return await this.get<{ success: boolean; message?: string }>('savewiki', params);
  }

  async getQueries (): Promise<ApiResponse<unknown[]>> {
    return await this.get<unknown[]>('getqueries');
  }

  async execQuery (query: string, collections: string): Promise<ApiResponse<unknown>> {
    const params: ExecQueryParams = { query, collections };
    return await this.get<unknown>('execquery', params);
  }

  async exportWiki (data: unknown[]): Promise<ApiResponse<{ success: boolean; url?: string }>> {
    const params: ExportWikiParams = { data };
    return await this.get<{ success: boolean; url?: string }>('exportwiki', params);
  }
}
