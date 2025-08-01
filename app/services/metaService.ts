import { useApiClient } from '~/stores/api';

export default class MetaService {
  api: any;

  constructor () {
    this.api = useApiClient();
  }

  async getCollections () {
    return await this.api.get('meta/collections');
  }

  async getConfiguration (name: string) {
    return await this.api.get('meta/get', { name });
  }

  async saveConfiguration (name: string, config: any) {
    return await this.api.get('meta/set', { name, config });
  }
};
