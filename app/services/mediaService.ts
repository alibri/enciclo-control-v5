import { useApiClient } from '~/stores/api';
import type { ApiClient, ApiResponse } from '~/interfaces/ApiResponse';
import type { UploadMediaParams } from '~/interfaces/services/MediaServiceParams';

export default class MediaService {
  api: ApiClient;

  constructor () {
    this.api = useApiClient();
  }

  async uploadMedia (image: string): Promise<ApiResponse<{ url: string; success: boolean }>> {
    const params: UploadMediaParams = { image };
    return await this.api.get<{ url: string; success: boolean }>('setmedia', params);
  }

  async getImages (): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('getlistmedia');
  }

  async getRepository (): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('getlistrepositories');
  }
}
