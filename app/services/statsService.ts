import { useApiClient } from '~/stores/api';
import type { ApiClient, ApiResponse } from '~/interfaces/ApiResponse';
import type { StatsParams, PageStatsParams, SessionStatsParams, UserPageStatsParams } from '~/interfaces/services/StatsServiceParams';
import type { Stats } from '~/interfaces/Stats';
import type { UserPageStats } from '~/interfaces/UserPageStats';

export default class StatsService {
  api: ApiClient;

  constructor () {
    this.api = useApiClient();
  }

  async getActiveSessions (data: StatsParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('sessions', data);
  }

  async getLastSessions (data: StatsParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('lastsessions', data);
  }

  async exportSessions (data: StatsParams | null = null): Promise<ApiResponse<{ success: boolean; url?: string }>> {
    return await this.api.get<{ success: boolean; url?: string }>('sessions_export', data);
  }

  async exportPages (data: StatsParams | null = null): Promise<ApiResponse<{ success: boolean; url?: string }>> {
    return await this.api.get<{ success: boolean; url?: string }>('pages_export', data);
  }

  async exportQueries (data: StatsParams | null = null): Promise<ApiResponse<{ success: boolean; url?: string }>> {
    return await this.api.get<{ success: boolean; url?: string }>('queries_export', data);
  }

  async exportPrints (data: StatsParams | null = null): Promise<ApiResponse<{ success: boolean; url?: string }>> {
    return await this.api.get<{ success: boolean; url?: string }>('print_export', data);
  }

  async exportChats (data: StatsParams | null = null): Promise<ApiResponse<{ success: boolean; url?: string }>> {
    return await this.api.get<{ success: boolean; url?: string }>('chats_export', data);
  }

  async getLastPages (): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('pages');
  }

  async getChats (data: StatsParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('chats', data);
  }

  async getPages (data: StatsParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('pages', data);
  }

  async getQueries (data: StatsParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('queries', data);
  }

  async getPrints (data: StatsParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('prints', data);
  }

  async getUserStats (data: StatsParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('userstats', data);
  }

  async getPageStats (data: PageStatsParams): Promise<ApiResponse<Stats>> {
    return await this.api.get<Stats>('pagestats', data);
  }

  async getSessionStats (id: string | null = null): Promise<ApiResponse<unknown>> {
    const params: SessionStatsParams = { id };
    return await this.api.get<unknown>('sessionstats', params);
  }

  async getUserPageStats (user: number, collection: string): Promise<ApiResponse<{ stats: UserPageStats }>> {
    const params: UserPageStatsParams = { user, collection };
    return await this.api.get<{ stats: UserPageStats }>('userpagestats', params);
  }
}
