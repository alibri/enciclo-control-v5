import { useApiClient } from '~/stores/api';
import type { ApiClient, ApiResponse } from '~/interfaces/ApiResponse';
import type { ChatQueryParams, GetChatParams } from '~/interfaces/services/ChatServiceParams';

export default class ChatService {
  api: ApiClient;

  constructor () {
    this.api = useApiClient();
  }

  async query (query: string | null = null): Promise<ApiResponse<unknown>> {
    const params: ChatQueryParams = { query: query || '' };
    return await this.api.get<unknown>('chat/query', params);
  }

  async getChat (id: string | number | null = null): Promise<ApiResponse<unknown>> {
    const params: GetChatParams = { id: id || '' };
    return await this.api.get<unknown>('get_chat', params);
  }
}
