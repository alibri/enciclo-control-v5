import type { ApiResponse } from '~/interfaces/ApiResponse';
import type { EntityParams } from '~/interfaces/services/EntityServiceParams';
import { BaseService } from './BaseService';

export default class EntityService extends BaseService {
  async getEntities (data: EntityParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.get<unknown[]>('entities/list', data);
  }

  async getPagesFromEntities (data: EntityParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.get<unknown[]>('entities/pages', data);
  }

  async getEntitiesFromText (data: EntityParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.get<unknown[]>('entities/find', data);
  }
}
