import { useApiClient } from '~/stores/api';
import type { ApiClient, ApiResponse } from '~/interfaces/ApiResponse';
import type { UserInterface } from '~/interfaces/User';
import type {
  GetUsersParams,
  CreateUserData,
  GetFakeStatsParams,
  CreateFakeStatsData,
  ImportFakeStatsParams,
  DesactivarGrupoParams
} from '~/interfaces/services/UserServiceParams';
import type { Collection } from '~/interfaces/Collection';

export default class UserService {
  api: ApiClient;
  apiLongTask: ApiClient;

  constructor () {
    this.api = useApiClient();
    this.apiLongTask = useApiClient(true);
  }

  async getUsers (data: GetUsersParams): Promise<ApiResponse<UserInterface[]>> {
    return await this.api.get<UserInterface[]>('user', data);
  }

  async getCollections (): Promise<ApiResponse<Collection[]>> {
    return await this.api.get<Collection[]>('collections');
  }

  async delete (id: number): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return await this.api.get<{ success: boolean; message?: string }>('deleteuser', { id });
  }

  async add (id: number | null, data: CreateUserData): Promise<ApiResponse<UserInterface>> {
    return await this.api.get<UserInterface>('user', { id, data });
  }

  async createFromExcel(file: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return await this.api.get<{ success: boolean; message?: string }>('importexcel', { file });
  }

  async createFromProcess(processId: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return await this.api.get<{ success: boolean; message?: string }>('importexcel', { process: processId });
  }

  async resetPassword(id: number): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return await this.api.get<{ success: boolean; message?: string }>('resetpasswordvarios', { id });
  }

  async sendAccessData(id: number): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return await this.api.get<{ success: boolean; message?: string }>('sendinfologin', { id });
  }

  async getFakeStats(user: string): Promise<ApiResponse<{ list: unknown[] }>> {
    const params: GetFakeStatsParams = { user };
    return await this.api.get<{ list: unknown[] }>('fake_stats', params);
  }

  async createFakeStats(data: CreateFakeStatsData): Promise<ApiResponse<{ id: number; message?: string; success?: boolean }>> {
    return await this.api.get<{ id: number; message?: string; success?: boolean }>('create_fake_stats', data);
  }

  async deleteFakeStats(id: number): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return await this.api.get<{ success: boolean; message?: string }>('delete_fake_stats', { id });
  }

  async importFakeStats(user: string, file: File): Promise<ApiResponse<{ success: boolean; message?: string; imported?: number; errors?: string[]; duplicates?: string[] }>> {
    // Leer el contenido del archivo
    const fileContent = await file.arrayBuffer();
    
    // Convertir ArrayBuffer a base64
    // Funciona tanto para archivos binarios (XLSX) como texto (CSV)
    const uint8Array = new Uint8Array(fileContent);
    const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
    const base64Content = btoa(binaryString);
    
    const params: ImportFakeStatsParams = { file: base64Content, user, name: file.name };
    return await this.api.get<{ success: boolean; message?: string; imported?: number; errors?: string[]; duplicates?: string[] }>('import_fake_news', params);
  }

  async desactivarGrupo(grupo: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const params: DesactivarGrupoParams = { grupo };
    return await this.api.get<{ success: boolean; message?: string }>('desactivargrupo', params);
  }
}
