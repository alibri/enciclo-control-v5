import { useApiClient } from '~/stores/api';

export default class TestService {
  api: any;

  constructor () {
    this.api = useApiClient();
  }

  async testIP (data: any) {
    return await this.api.get('testip', data);
  }

  async testReferer (data: any) {
    return await this.api.get('testreferer', data);
  }

  async testRAG (data: any) {
    return await this.api.get('testrag', data);
  }

  async evaluateRAG (data: any) {
    return await this.api.get('evaluaterag', data);
  }

  async evaluateRAGAB (data: any) {
    return await this.api.get('ragtestab', data);
  }

  async exportChat (data: any) {
    return await this.api.get('exportchat', data);
  }

  async listRAG (data: any) {
    return await this.api.get('listrag', data);
  }

  async getRAG (id: number) {
    return await this.api.get('getrag', { id });
  }

};
