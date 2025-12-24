import type { ApiResponse } from '~/interfaces/ApiResponse';
import type { RepositoryParams, ExportChatsParams, FileOperationParams } from '~/interfaces/services/RepositoryServiceParams';
import { BaseService } from './BaseService';

export default class RepositoryService extends BaseService {
  async getList (data: RepositoryParams | null = null): Promise<ApiResponse<unknown[]>> {
    return await this.get<unknown[]>('repository/get', data);
  }

  async exportChats (data: ExportChatsParams): Promise<ApiResponse<{ success: boolean; url?: string }>> {
    return await this.post<{ success: boolean; url?: string }>('repository/export', data);
  }

  async deleteFile (data: FileOperationParams): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return await this.get<{ success: boolean; message?: string }>('repository/delete', data);
  }

  async regenerateFile (data: FileOperationParams): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return await this.get<{ success: boolean; message?: string }>('repository/regenerate', data);
  }

  async uploadFile (data: FileOperationParams): Promise<ApiResponse<{ success: boolean; url?: string; message?: string }>> {
    return await this.get<{ success: boolean; url?: string; message?: string }>('repository/upload', data);
  }

  async getFileUrl (data: FileOperationParams): Promise<ApiResponse<{ url: string }>> {
    return await this.get<{ url: string }>('repository/fileurl', data);
  }

  async updateTitle (data: FileOperationParams): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return await this.get<{ success: boolean; message?: string }>('repository/update', data);
  }
}
