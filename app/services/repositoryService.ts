import { useApiClient } from '~/stores/api';

export default class RepositoryService {
  api: any;

  constructor () {
    this.api = useApiClient();
  }

  async getList (data: any|null = null) {
    return await this.api.get('repository/get',  data );
  }

  async exportChats (data: any) {
    return await this.api.post('repository/export', data);
  }

  async deleteFile (data: any) {
    return await this.api.get('repository/delete',  data );
  }

  async regenerateFile (data: any) {
    return await this.api.get('repository/regenerate',  data );
  }

  async uploadFile (data: any) {
    return await this.api.get('repository/upload',  data );
  }

  async getFileUrl (data: any) {
    return await this.api.get('repository/fileurl',  data );
  }

  async updateTitle (data: any) {
    return await this.api.get('repository/update', data);
  }
};
