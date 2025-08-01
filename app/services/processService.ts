import { useApiClient } from '~/stores/api';

export default class ProcessService {
  api: any;

  constructor () {
    this.api = useApiClient();
  }

  async getProcessList () {
    return await this.api.get('processlist');
  }

  async launchProcess (action) {
    return await this.api.get('process', { action });
  }
};
