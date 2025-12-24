import { useApiClient } from '~/stores/api';
import type { ApiClient, ApiResponse } from '~/interfaces/ApiResponse';
import type { GetMessagesParams, UpdateMessageParams } from '~/interfaces/services/MessageServiceParams';

export default class MessageService {
  api: ApiClient;

  constructor () {
    this.api = useApiClient();
  }

  async getMessages (id: string | number | null = null): Promise<ApiResponse<unknown[]>> {
    const params: GetMessagesParams = { id };
    return await this.api.get<unknown[]>('crm/messages', params);
  }

  async updMessage (id: string | number, data: unknown): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const params: UpdateMessageParams = { id, data };
    return await this.api.get<{ success: boolean; message?: string }>('crm/messages/upd', params);
  }
}
