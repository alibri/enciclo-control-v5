import { useApiClient } from '~/stores/api';

export default class CrmService {
  api: any;

  constructor () {
    this.api = useApiClient();
  }

  async getLeads (data: any|null = null) {
    return await this.api.get('crm/leads', data);
  }

  async sendMessage (id, messageId, status) {
    console.log('sendMessage', id, messageId, status);
    return await this.api.get('crm/leads/message', { id, messageId, status });
  }
};
