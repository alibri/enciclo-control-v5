import { useApiClient } from '~/stores/api';
import type { ApiClient, ApiResponse } from '~/interfaces/ApiResponse';
import type { GetConfigurationParams, SaveConfigurationParams } from '~/interfaces/services/MetaServiceParams';
import type { CollectionInterface } from '~/interfaces/Collection';

export default class MetaService {
  api: ApiClient;

  constructor () {
    this.api = useApiClient();
  }

  async getCollections (): Promise<ApiResponse<CollectionInterface[]>> {
    return await this.api.get<CollectionInterface[]>('meta/collections');
  }

  async getConfiguration (name: string): Promise<ApiResponse<unknown>> {
    const params: GetConfigurationParams = { name };
    return await this.api.get<unknown>('meta/get', params);
  }

  async saveConfiguration (name: string, config: unknown): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const params: SaveConfigurationParams = { name, config };
    return await this.api.get<{ success: boolean; message?: string }>('meta/set', params);
  }
}
