import type { ApiResponse } from '~/interfaces/ApiResponse';
import type { TestParams, EvaluateRAGParams, ExportChatParams } from '~/interfaces/services/TestServiceParams';
import { BaseService } from './BaseService';

export default class TestService extends BaseService {
  async testIP (data: TestParams): Promise<ApiResponse<unknown>> {
    return await this.get<unknown>('testip', data);
  }

  async testReferer (data: TestParams): Promise<ApiResponse<unknown>> {
    return await this.get<unknown>('testreferer', data);
  }

  async testRAG (data: TestParams): Promise<ApiResponse<unknown>> {
    return await this.get<unknown>('testrag', data);
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

  async listRAG (data: TestParams): Promise<ApiResponse<unknown[]>> {
    return await this.get<unknown[]>('listrag', data);
  }

  async getRAG (id: number): Promise<ApiResponse<unknown>> {
    return await this.get<unknown>('getrag', { id });
  }
}
