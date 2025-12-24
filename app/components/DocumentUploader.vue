<script setup lang='ts'>
import { formatSize, formatFileIcon } from '@/utils/format';
import RepositoryService from '@/services/repositoryService';
import type { FileUploadEvent, RemoveFileCallback } from '~/interfaces/FileUpload';
import { FILE_SIZES, FILE_ACCEPT_FORMATS } from '~/utils/constants';

interface Props {
  maxFileSize?: number;
  accept?: string;
  multiple?: boolean;
}

interface Emits {
  (e: 'upload-success'): void;
  (e: 'upload-error', error: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  maxFileSize: FILE_SIZES.MAX_DEFAULT,
  accept: FILE_ACCEPT_FORMATS.DOCUMENTS,
  multiple: true
});

const emit = defineEmits<Emits>();

const { t } = useI18n();
const { showMessage } = useMessages();

const repositoryService = new RepositoryService();

// Estado del componente
const totalSize = ref(0);
const totalSizePercent = ref(0);
const files = ref<File[]>([]);
const uploading = ref(false);

// Funciones internas
const onRemoveTemplatingFile = (file: File, removeFileCallback: RemoveFileCallback, index: number): void => {
  removeFileCallback(index);
  totalSize.value -= file.size;
  const maxSize = props.maxFileSize;
  totalSizePercent.value = Math.min((totalSize.value / maxSize) * 100, 100);
};

const onSelectedFiles = (event: FileUploadEvent): void => {
  files.value = event.files;
  totalSize.value = 0;
  files.value.forEach((file: File) => {
    totalSize.value += file.size;
  });
  const maxSize = props.maxFileSize;
  totalSizePercent.value = Math.min((totalSize.value / maxSize) * 100, 100);
};

const uploadEvent = (callback: () => void): void => {
  const maxSize = props.maxFileSize;
  totalSizePercent.value = Math.min((totalSize.value / maxSize) * 100, 100);
  callback();
};

const onTemplatedUpload = async (event: FileUploadEvent): Promise<void> => {
  uploading.value = true;
  try {
    let uploadedSize = 0;
    let totalUploaded = 0;
    if (files.value) {
      for (let i = 0; i < files.value.length; i++) {
        const file = files.value[i];
        if (file) {
          totalUploaded += file.size;
        }
      }
    }
    totalSize.value = totalUploaded;
    totalSizePercent.value = 0;

    if (files.value) {
      // Crear una copia del array para evitar problemas de índice
      const filesToUpload = [...files.value];
      
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        if (file) {
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onload = async () => {
              const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                content: reader.result?.toString().split(',')[1] ?? ''
              };

              uploadedSize += file.size;
              const response = await repositoryService.uploadFile({ file: fileData });
              if (checkLogged(response)) {
                showMessage('success', t('Success'), `${file.name} - ${t('Fichero subido correctamente')}`);
                emit('upload-success');
                // Eliminar el archivo del listado usando el índice
                if (files.value) {
                  files.value.splice(i, 1);
                  totalSize.value -= file.size;
                }
              } else {
                const errorMessage = response.error?.value?.message || t('Error interno del servidor');
                showMessage('error', t('Error'), errorMessage);
                emit('upload-error', errorMessage);
              }
              totalSizePercent.value = (uploadedSize / totalUploaded) * 100;
              resolve();
            };
            reader.readAsDataURL(file);
          });
        }
      }
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : t('Error desconocido');
    showMessage('error', t('Error'), errorMessage);
    emit('upload-error', errorMessage);
  } finally {
    uploading.value = false;
  }
};
</script>

<template>
  <div>
    <FileUpload 
        name="demo[]"
        :customUpload="true"
        @uploader="onTemplatedUpload($event)"
        :multiple="multiple"
        :maxFileSize="maxFileSize"
        @select="onSelectedFiles" 
        :accept="accept"
    >
        <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
            <div class="flex flex-wrap justify-between items-center flex-1 gap-2">
                <div class="flex gap-2">
                    <Button @click="chooseCallback()" icon="pi pi-file-pdf" rounded outlined></Button>
                    <Button @click="uploadEvent(uploadCallback)" icon="pi pi-cloud-upload" rounded outlined severity="success" :disabled="!files || files.length === 0"></Button>
                    <Button @click="clearCallback()" icon="pi pi-times" rounded outlined severity="danger" :disabled="!files || files.length === 0"></Button>
                </div>
                <div v-if="uploading" class="flex items-center gap-2">
                    <ProgressSpinner style="width: 16px; height: 16px" />
                    <ProgressBar v-show="uploading" :value="totalSizePercent" :showValue="false" :class="['md:w-80 h-4 w-full md:ml-auto', { 'exceeded-progress-bar': totalSizePercent > 100 }]"
                        ><span class="whitespace-nowrap">{{ formatSize(totalSize) }}</span></ProgressBar
                    >
                    <span class="text-sm" style="color: var(--text-color-secondary);">{{ t('Subiendo...') }}</span>
                </div>
            </div>
        </template>
        <template #content="{ files, removeFileCallback }">
          <BlockUI :blocked="uploading">
            <div v-if="files.length > 0">
                <h5 class="text-lg font-semibold mb-4" style="color: var(--text-color);">{{ t('Pendientes') }}</h5>
                <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                    <div v-for="(file, index) of files" :key="file.name + file.type + file.size" class="shadow-sm border m-0 px-6 py-4 flex flex-col items-center gap-3" style="border-color: var(--surface-border); background-color: var(--surface-card);">
                        <div v-tooltip.top="file.name">
                            <i :class="formatFileIcon(file.name.split('.').pop() || '')"></i> <span class="ml-2 text-xs" style="color: var(--text-color-secondary);">({{ file.name.split('.').pop() || 'sin extensión' }})</span>
                        </div>
                        <div class="text-sm" style="color: var(--text-color);">{{ formatSize(file.size) }}</div>
                        <Badge :value="t('Pendiente')" severity="warning" />
                        <Button icon="pi pi-times" @click="onRemoveTemplatingFile(file, removeFileCallback, index)" outlined rounded  severity="danger" />
                    </div>
                </div>
            </div>
          </BlockUI>
        </template>
        <template #empty>
          <BlockUI :blocked="uploading">
            <div class="flex items-center justify-center flex-col">
                <i class="pi pi-cloud-upload border-2 rounded-full p-5 text-8xl text-gray-400" style="border-color: var(--surface-border);" />
                <p class="mt-4 mb-0" style="color: var(--text-color-secondary);">{{ t('Arrastre y suelte los archivos aquí para cargarlos.') }}</p>
            </div>
          </BlockUI>
        </template>
    </FileUpload>
  </div>
</template>
