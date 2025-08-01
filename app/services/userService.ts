import { useApiClient } from '~/stores/api';

export default class UserService {
  api: any;

  constructor () {
    this.api = useApiClient();
  }

  async getUsers (data: any) {
    return await this.api.get('user', data);
  }

  async getCollections () {
    return await this.api.get('collections');
  }

  async delete (id: number) {
    return await this.api.get('deleteuser', { id });
  }

  async add (id: number|null, data: any) {
    return await this.api.get('user', { id, data });
  }

  async createFromExcel(file: string) {
    return await this.api.get('importexcel', { file: file });
  }

  async resetPassword(id: number) {
    return await this.api.get('resetpasswordvarios', { id });
  }

  async sendAccessData(id: number) {
    return await this.api.get('sendinfologin', { id });
  }
};
