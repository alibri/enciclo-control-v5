import { useApiClient } from '~/stores/api';
import type { ApiClient, ApiResponse } from '~/interfaces/ApiResponse';
import type { TestParams, EvaluateRAGParams, ExportChatParams } from '~/interfaces/services/TestServiceParams';

export default class TestService {
  api: ApiClient;

  constructor () {
    this.api = useApiClient();
  }

  async testIP (data: TestParams): Promise<ApiResponse<unknown>> {
    return await this.api.get<unknown>('testip', data);
  }

  async testReferer (data: TestParams): Promise<ApiResponse<unknown>> {
    return await this.api.get<unknown>('testreferer', data);
  }

  async testRAG (data: TestParams): Promise<ApiResponse<unknown>> {
    return await this.api.get<unknown>('testrag', data);
  }

  async evaluateRAG (data: EvaluateRAGParams): Promise<ApiResponse<{ id: number; message?: string }>> {
    return await this.api.get<{ id: number; message?: string }>('evaluaterag', data);
  }

  async evaluateRAGAB (data: TestParams): Promise<ApiResponse<unknown>> {
    return await this.api.get<unknown>('ragtestab', data);
  }

  async exportChat (data: ExportChatParams): Promise<ApiResponse<Blob>> {
    return await this.api.get<Blob>('exportchat', data);
  }

  async listRAG (data: TestParams): Promise<ApiResponse<unknown[]>> {
    return await this.api.get<unknown[]>('listrag', data);
  }

  async getRAG (id: number): Promise<ApiResponse<unknown>> {
    return await this.api.get<unknown>('getrag', { id });
  }
}
