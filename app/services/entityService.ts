import { useApiClient } from '~/stores/api';

export default class EntityService {
  api: any;

  constructor () {
    this.api = useApiClient();
  }

  async getEntities (data: any|null = null) {
    return await this.api.get('entities/list', data);
  }

  async getPagesFromEntities (data: any|null = null) {
    return await this.api.get('entities/pages', data);
  }

  async getEntitiesFromText (data: any|null = null) {
    return await this.api.get('entities/find', data);
  }
};
