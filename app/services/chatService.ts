import { useApiClient } from '~/stores/api';

export default class ChatService {
  api: any;

  constructor () {
    this.api = useApiClient();
  }

  async query (query: any|null = null) {
    return await this.api.get('chat/query', { query });
  }

  async getChat (id: any|null = null) {
    return await this.api.get('get_chat', { id });
  }
};
