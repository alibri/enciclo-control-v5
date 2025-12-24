import type { ApiResponse } from '~/interfaces/ApiResponse';
import type { UploadMediaParams } from '~/interfaces/services/MediaServiceParams';
import { BaseService } from './BaseService';

export default class MediaService extends BaseService {
  async uploadMedia (image: string): Promise<ApiResponse<{ url: string; success: boolean }>> {
    const params: UploadMediaParams = { image };
    return await this.get<{ url: string; success: boolean }>('setmedia', params);
  }

  async getImages (): Promise<ApiResponse<unknown[]>> {
    return await this.get<unknown[]>('getlistmedia');
  }

  async getRepository (): Promise<ApiResponse<unknown[]>> {
    return await this.get<unknown[]>('getlistrepositories');
  }
}
