import { useApiClient } from '~/stores/api';
import type { ApiClient, ApiResponse } from '~/interfaces/ApiResponse';
import type { LaunchProcessParams } from '~/interfaces/services/ProcessServiceParams';

export default class ProcessService {
  api: ApiClient;

  constructor () {
    this.api = useApiClient();
  }

  async getProcessList (): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('processlist');
  }

  async launchProcess (action: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const params: LaunchProcessParams = { action };
    return await this.api.get<{ success: boolean; message?: string }>('process', params);
  }
}
