import type { ApiResponse } from '~/interfaces/ApiResponse';
import type { GetConfigurationParams, SaveConfigurationParams } from '~/interfaces/services/MetaServiceParams';
import type { CollectionInterface } from '~/interfaces/Collection';
import { BaseService } from './BaseService';

export default class MetaService extends BaseService {
  async getCollections (): Promise<ApiResponse<CollectionInterface[]>> {
    return await this.get<CollectionInterface[]>('meta/collections');
  }

  async getConfiguration (name: string): Promise<ApiResponse<unknown>> {
    const params: GetConfigurationParams = { name };
    return await this.get<unknown>('meta/get', params);
  }

  async saveConfiguration (name: string, config: unknown): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const params: SaveConfigurationParams = { name, config };
    return await this.get<{ success: boolean; message?: string }>('meta/set', params);
  }
}
