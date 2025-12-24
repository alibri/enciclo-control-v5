import type { ApiResponse } from '~/interfaces/ApiResponse';
import type { GetLeadsParams, SendMessageParams } from '~/interfaces/services/CrmServiceParams';
import { BaseService } from './BaseService';

export default class CrmService extends BaseService {
  async getLeads (data: GetLeadsParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.get<unknown[]>('crm/leads', data);
  }

  async sendMessage (id: string | number, messageId: string | number, status: string | number): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const params: SendMessageParams = { id, messageId, status };
    return await this.get<{ success: boolean; message?: string }>('crm/leads/message', params);
  }
}
