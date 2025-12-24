/**
 * Evento de selección de archivos
 */
export interface FileUploadEvent {
  files: File[];
}

/**
 * Callback para remover un archivo
 */
export type RemoveFileCallback = (index: number) => void;

