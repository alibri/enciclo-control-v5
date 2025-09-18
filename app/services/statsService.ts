import { useApiClient } from '~/stores/api';

export default class StatsService {
  api: any;

  constructor () {
    this.api = useApiClient();
  }

  async getActiveSessions (data: any|null = null) {
    return await this.api.get('sessions', data);
  }

  async getLastSessions (data: any|null = null) {
    return await this.api.get('lastsessions', data);
  }

  async exportSessions (data: any|null = null) {
    return await this.api.get('sessions_export', data);
  }

  async exportPages (data: any|null = null) {
    return await this.api.get('pages_export', data);
  }

  async exportQueries (data: any|null = null) {
    return await this.api.get('queries_export', data);
  }

  async exportPrints (data: any|null = null) {
    return await this.api.get('print_export', data);
  }

  async exportChats (data: any|null = null) {
    return await this.api.get('chats_export', data);
  }

  async getLastPages () {
    return await this.api.get('pages');
  }

  async getChats (data: any|null = null) {
    return await this.api.get('chats', data);
  }

  async getPages (data: any|null = null) {
    return await this.api.get('pages', data);
  }

  async getQueries (data: any|null = null) {
    return await this.api.get('queries', data);
  }

  async getPrints (data: any|null = null) {
    return await this.api.get('prints', data);
  }

  async getUserStats (data: any|null = null) {
    return await this.api.get('userstats', data);
  }

  async getPageStats (data: any|null = null) {
    return await this.api.get('pagestats', data);
  }

  async getSessionStats (id: string|null = null) {
    return await this.api.get('sessionstats', { id });
  }

  async getUserPageStats (user: number, collection: string) {
    return await this.api.get('userpagestats', { user, collection });
  }  
};
