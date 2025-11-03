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
    const fileContent = await file.arrayBuffer();
    console.log('fileContent', fileContent);
    
    // Convertir ArrayBuffer a base64
    // Funciona tanto para archivos binarios (XLSX) como texto (CSV)
    const uint8Array = new Uint8Array(fileContent);
    const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
    const base64Content = btoa(binaryString);
    
    return await this.api.get('import_fake_news', { file: base64Content, user, name: file.name });
  }

  async desactivarGrupo(grupo: string) {
    return await this.api.get('desactivargrupo', { grupo });
  }
};
