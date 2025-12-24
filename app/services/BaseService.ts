import { useApiClient } from '~/stores/api';
import type { ApiClient, ApiResponse } from '~/interfaces/ApiResponse';

/**
 * Clase base para todos los servicios
 * Proporciona funcionalidad común para llamadas a la API
 */
export abstract class BaseService {
  protected api: ApiClient;
  protected apiLongTask?: ApiClient;

  /**
   * Constructor base para servicios
   * @param useLongTask - Si es true, inicializa también apiLongTask para tareas largas
   */
  constructor(useLongTask: boolean = false) {
    this.api = useApiClient();
    if (useLongTask) {
      this.apiLongTask = useApiClient(true);
    }
  }

  /**
   * Método helper para llamadas GET a la API
   * @param method - Nombre del método/endpoint
   * @param data - Datos a enviar (opcional)
   * @returns Promise con la respuesta de la API
   */
  protected async get<T>(method: string, data?: any): Promise<ApiResponse<T>> {
    return await this.api.get<T>(method, data);
  }

  /**
   * Método helper para llamadas POST a la API
   * @param method - Nombre del método/endpoint
   * @param data - Datos a enviar (opcional)
   * @returns Promise con la respuesta de la API
   */
  protected async post<T>(method: string, data?: any): Promise<ApiResponse<T>> {
    return await this.api.post<T>(method, data);
  }

  /**
   * Método helper para llamadas GET con apiLongTask (para tareas largas)
   * @param method - Nombre del método/endpoint
   * @param data - Datos a enviar (opcional)
   * @returns Promise con la respuesta de la API
   * @throws Error si apiLongTask no está disponible
   */
  protected async getLongTask<T>(method: string, data?: any): Promise<ApiResponse<T>> {
    if (!this.apiLongTask) {
      throw new Error('apiLongTask no está disponible. Use useLongTask: true en el constructor.');
    }
    return await this.apiLongTask.get<T>(method, data);
  }
}

