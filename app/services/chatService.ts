import type { ApiResponse } from '~/interfaces/ApiResponse';
import type { ChatQueryParams, GetChatParams } from '~/interfaces/services/ChatServiceParams';
import { BaseService } from './BaseService';

export default class ChatService extends BaseService {
  async query (query: string | null = null): Promise<ApiResponse<unknown>> {
    const params: ChatQueryParams = { query: query || '' };
    return await this.get<unknown>('chat/query', params);
  }

  async getChat (id: string | number | null = null): Promise<ApiResponse<unknown>> {
    const params: GetChatParams = { id: id || '' };
    return await this.get<unknown>('get_chat', params);
  }
}
