import { useApiClient } from '~/stores/api';

export default class TestService {
  api: any;

  constructor () {
    this.api = useApiClient();
  }

  async testIP (data: any) {
    return await this.api.get('testip', data);
  }

  async testReferer (data: any) {
    return await this.api.get('testreferer', data);
  }

};
