import { useApiClient } from '~/stores/api';

export default class MessageService {
  api: any;

  constructor () {
    this.api = useApiClient();
  }

  async getMessages (id = null) {
    return await this.api.get('crm/messages', { id });
  }

  async updMessage (id, data) {
    return await this.api.get('crm/messages/upd', { id, data });
  }
};
