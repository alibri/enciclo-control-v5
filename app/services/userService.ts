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

  async getFakeStats(user: string) {
    return await this.api.get('fake_stats', { user });
  }

  async createFakeStats(data: any) {
    return await this.api.get('create_fake_stats', { data });
  }

  async deleteFakeStats(id: number) {
    return await this.api.get('delete_fake_stats', { id });
  }

  async importFakeStats(user: string, file: File) {
    // Leer el contenido del archivo
    let fileContent = await file.text();
    // Codificamos el contenido del archivo a base64 antes de enviarlo
    fileContent = btoa(fileContent);
    
    return await this.api.get('import_fake_news', { file: fileContent, user, name: file.name });
  }
};
