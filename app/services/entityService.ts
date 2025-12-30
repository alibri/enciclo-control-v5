import type { ApiResponse } from '~/interfaces/ApiResponse';
import type { EntityParams, EntityListResponse } from '~/interfaces/services/EntityServiceParams';
import { BaseService } from './BaseService';

export default class EntityService extends BaseService {
  async getEntities (data: EntityParams | null = null): Promise<ApiResponse<EntityListResponse>> {
    return await this.get<EntityListResponse>('entities/list', data);
  }

  async getPagesFromEntities (data: EntityParams | null = null): Promise<ApiResponse<EntityListResponse>> {
    return await this.get<EntityListResponse>('entities/pages', data);
  }

  async getEntitiesFromText (data: EntityParams | null = null): Promise<ApiResponse<EntityListResponse>> {
    return await this.get<EntityListResponse>('entities/find', data);
  }
}
