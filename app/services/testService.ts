import type { ApiResponse } from '~/interfaces/ApiResponse';
import type { TestParams, EvaluateRAGParams, ExportChatParams, RAGListResponse, RAGTestResponse } from '~/interfaces/services/TestServiceParams';
import { BaseService } from './BaseService';

export default class TestService extends BaseService {
  async testIP (data: TestParams): Promise<ApiResponse<{ message?: string }>> {
    return await this.get<{ message?: string }>('testip', data);
  }

  async testReferer (data: TestParams): Promise<ApiResponse<{ message?: string }>> {
    return await this.get<{ message?: string }>('testreferer', data);
  }

  async testRAG (data: TestParams): Promise<ApiResponse<{ success: boolean; result?: unknown; message?: string }>> {
    return await this.get<{ success: boolean; result?: unknown; message?: string }>('testrag', data);
  }

  async evaluateRAG (data: EvaluateRAGParams): Promise<ApiResponse<{ id: number; message?: string }>> {
    return await this.get<{ id: number; message?: string }>('evaluaterag', data);
  }

  async evaluateRAGAB (data: TestParams): Promise<ApiResponse<unknown>> {
    return await this.get<unknown>('ragtestab', data);
  }

  async exportChat (data: ExportChatParams): Promise<ApiResponse<Blob>> {
    return await this.get<Blob>('exportchat', data);
  }

  async listRAG (data: TestParams): Promise<ApiResponse<RAGListResponse>> {
    return await this.get<RAGListResponse>('listrag', data);
  }

  async getRAG (id: number): Promise<ApiResponse<RAGTestResponse>> {
    return await this.get<RAGTestResponse>('getrag', { id });
  }
}
