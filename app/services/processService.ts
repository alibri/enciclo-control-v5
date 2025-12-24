import type { ApiResponse } from '~/interfaces/ApiResponse';
import type { LaunchProcessParams } from '~/interfaces/services/ProcessServiceParams';
import { BaseService } from './BaseService';

export default class ProcessService extends BaseService {
  async getProcessList (): Promise<ApiResponse<unknown[]>> {
    return await this.get<unknown[]>('processlist');
  }

  async launchProcess (action: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const params: LaunchProcessParams = { action };
    return await this.get<{ success: boolean; message?: string }>('process', params);
  }
}
