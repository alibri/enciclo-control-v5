import { useApiClient } from '~/stores/api';
import type { ApiClient, ApiResponse } from '~/interfaces/ApiResponse';
import type { EntityParams } from '~/interfaces/services/EntityServiceParams';

export default class EntityService {
  api: ApiClient;

  constructor () {
    this.api = useApiClient();
  }

  async getEntities (data: EntityParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('entities/list', data);
  }

  async getPagesFromEntities (data: EntityParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('entities/pages', data);
  }

  async getEntitiesFromText (data: EntityParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('entities/find', data);
  }
}
