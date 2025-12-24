import { useApiClient } from '~/stores/api';
import type { ApiClient, ApiResponse } from '~/interfaces/ApiResponse';
import type { GetLeadsParams, SendMessageParams } from '~/interfaces/services/CrmServiceParams';

export default class CrmService {
  api: ApiClient;

  constructor () {
    this.api = useApiClient();
  }

  async getLeads (data: GetLeadsParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('crm/leads', data);
  }

  async sendMessage (id: string | number, messageId: string | number, status: string | number): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const params: SendMessageParams = { id, messageId, status };
    return await this.api.get<{ success: boolean; message?: string }>('crm/leads/message', params);
  }
}
