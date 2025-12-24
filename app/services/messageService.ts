import type { ApiResponse } from '~/interfaces/ApiResponse';
import type { GetMessagesParams, UpdateMessageParams } from '~/interfaces/services/MessageServiceParams';
import { BaseService } from './BaseService';

export default class MessageService extends BaseService {
  async getMessages (id: string | number | null = null): Promise<ApiResponse<unknown[]>> {
    const params: GetMessagesParams = { id };
    return await this.get<unknown[]>('crm/messages', params);
  }

  async updMessage (id: string | number, data: unknown): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const params: UpdateMessageParams = { id, data };
    return await this.get<{ success: boolean; message?: string }>('crm/messages/upd', params);
  }
}
