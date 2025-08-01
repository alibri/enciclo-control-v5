import { useApiClient } from '~/stores/api';

export default class PageService {
  api: any;

  constructor () {
    this.api = useApiClient();
  }

  async getPageInfo (collection: string, title: string) {
    return await this.api.get('page', { title, collection });
  }

  async getPageWiki (collection: string, title: string) {
    return await this.api.get('wiki', { title, collection });
  }

  async searchPages (keyword: string, collections: string, type: string) {
    return await this.api.get('search', { keyword, collections, type });
  }

  async getCollections () {
    return await this.api.get('collections');
  }

  async getDashboard (collection: string) {
    return await this.api.get('dashboard', { collection });
  }

  async searchByTitle (collection: string, query: string) {
    return await this.api.get('searchtitle', { collection, term: query });
  }

  async saveDashboard (collection: string, data: any) {
    return await this.api.get('savedashboard', { collection, data });
  }

  async publishDashboard (collection: string) {
    return await this.api.get('publishdashboard', { collection });
  }

  async getPageImages (collection: string, title: string) {
    return await this.api.get('pageimages', { title, collection });
  }

  async saveWiki (collection: string, title: string, content: string) {
    return await this.api.get('savewiki', { collection, title, content });
  }

  async getQueries () {
    return await this.api.get('getqueries');
  }

  async execQuery (query: string, collections: string) {
    return await this.api.get('execquery', { query, collections });
  }

  async exportWiki (data: any[]) {
    return await this.api.get('exportwiki', { data });
  }
};
