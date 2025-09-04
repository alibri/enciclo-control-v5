<script setup lang='ts'>
// import { FilterMatchMode, FilterOperator } from 'primevue';
import { onMounted } from 'vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import RepositoryService from '@/services/repositoryService';
import { formatSize } from '@/utils/format';

const { filters } = usePrimeDataTable();
const { t } = useI18n();
const { getParamsData, lazyParams, exportDataGeneric, resetLazyParams } = useUtilsData();
const { showMessage } = useMessages();

const repositoryService = new RepositoryService();

filters.value = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  user: { value: null, matchMode: FilterMatchMode.CONTAINS } /* ,
  code: { value: null, matchMode: FilterMatchMode.CONTAINS },
  inventoryStatus: { value: null, matchMode: FilterMatchMode.STARTS_WITH } */
};

const loading = ref(false);
const stats = ref();
const dt = ref();
const totalRecords = ref(0);
const searchTerm = ref('');

const loadData = async () => {
  console.log('loadData');
  loading.value = true;

  const data = getParamsData(lazyParams.value) as any;

  if (searchTerm.value) {
    data.keyword = searchTerm.value;
  }

  try {
    const response = await repositoryService.getList(data);
    if (response.error?.value?.statusCode === 403) {
      const { logUserOut } = useAuthStore();
      logUserOut();
      navigateTo('/auth/login');
      return;
    }
    if (response.data.value?.success === false) {
      showMessage('error', t('Error'), response.data.value?.message);
      return;
    }
    if (checkLogged(response)) {
      stats.value = response?.data?.value?.list?.map((item: any) => {
        item.metadata = JSON.parse(item.metadata);
        return item;
      });
      totalRecords.value = response?.data?.value?.total;
    }
  } catch (e: any) {
    showMessage('error', t('Error'), e.message);
  } finally {
    loading.value = false;
  }
};

const exportFunction = async (data: any) => {
  return await repositoryService.exportChats(data);
};

const exportData = async () => {
  await exportDataGeneric(t('Exportando datos chat'), exportFunction);
};

const onPage = (event: any) => {
  lazyParams.value = event;
  loadData();
};

const onSort = (event: any) => {
  lazyParams.value = event;
  loadData();
};

const onFilter = (event: any) => {
  lazyParams.value.filters = filters.value;
  loadData();
};

onMounted(() => {
  resetLazyParams(dt?.value?.rows, filters.value);
  loadData();
});

const deleteFile = async (data: any) => {
  const response = await repositoryService.deleteFile(data);
  if (response.data.value.success) {
    showMessage('success', t('Eliminado'), t('El fichero ha sido eliminado correctamente'));
  } else {
    showMessage('error', t('Error'), response.data.value.message);
  }
  loadData();
};

const regenerateFile = async (data: any) => {
  const response = await repositoryService.regenerateFile(data);
  if (response.data.value.success) {
    showMessage('success', t('Actualizado'), t('El fichero ha sido actualizado correctamente'));
  } else {
    showMessage('error', t('Error'), response.data.value.message);
  }
  loadData();
};

const menu = ref();
const menuData = ref();
const items = ref([
    {
        label: t('Opciones'),
        items: [
            /*{
                label: t('Editar'),
                icon: 'pi pi-pencil',
                command: () => {
                  console.log('editUser', menuData.value);
                  editUser(menuData.value);
                },
                class: 'text-green-500'
            },*/
            {
                label: t('Eliminar'),
                icon: 'pi pi-trash',
                command: () => {
                  deleteFile(menuData.value);
                },
                class: 'text-red-500'
            }, {
                label: t('Volver a generar'),
                icon: 'pi pi-refresh',
                command: () => {
                  regenerateFile(menuData.value);
                },
                class: 'text-blue-500'
            }/*,
            {
              label: t('Enviar datos de acceso'),
              icon: 'pi pi-envelope',
              command: () => {
                console.log('sendAccessData', menuData.value);
                sendAccessData(menuData.value);
              },
              class: 'text-yellow-500'
            }*/
        ]
    }
]);

const toggle = (event: Event, data: any) => {
    menu.value.toggle(event);
    // Almacenar los datos del usuario para usarlos en los comandos
    items.value[0]?.items?.forEach((item: any) => {
        menuData.value = data;
        // item.command = () => item.command(menuData.value);
    });
};


const totalSize = ref(0);
const totalSizePercent = ref(0);
const files = ref([]);

const onRemoveTemplatingFile = (file: any, removeFileCallback: any, index: number) => {
    removeFileCallback(index);
    totalSize.value -= file.size; // Use file.size directly (in bytes)
    // Recalculate percentage
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    totalSizePercent.value = Math.min((totalSize.value / maxSize) * 100, 100);
};

const onSelectedFiles = (event: any) => {
    files.value = event.files;
    totalSize.value = 0; // Reset total size
    files.value.forEach((file: any) => {
        totalSize.value += file.size; // Use file.size directly (in bytes)
    });
    // Recalculate percentage
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    totalSizePercent.value = Math.min((totalSize.value / maxSize) * 100, 100);
};

const uploadEvent = (callback: any) => {
    // Calculate percentage based on a reasonable max size (e.g., 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    totalSizePercent.value = Math.min((totalSize.value / maxSize) * 100, 100);
    callback();
};

const uploading = ref(false);
const onTemplatedUpload = async (event: any) => {
  uploading.value = true;
  try {
    let uploadedSize = 0;
    let totalUploaded = 0;
    for (let i = 0; i < event.files.length; i++) {
      totalUploaded += event.files[i].size;
    }
    totalSize.value = totalUploaded;
    totalSizePercent.value = 0;

    for (let i = 0; i < event.files.length; i++) {
      const file = event.files[i];
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = async () => {
          const fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            content: reader.result?.toString().split(',')[1] ?? '' // Get base64 without data:image prefix
          };

          uploadedSize += file.size;
          const response = await repositoryService.uploadFile({ file: fileData });
          if (checkLogged(response)) {
            showMessage('success', t('Success'), `${file.name} - ${t('Fichero subido correctamente')}`);
            loadData();
          }
          totalSizePercent.value = (uploadedSize / totalUploaded) * 100;
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
  } catch (e: any) {
    showMessage('error', t('Error'), e.message);
  } finally {
    loading.value = false;
    uploading.value = false;
  }
};
</script>

<template>
  <div class="card">
    <h2>{{ t('Repositorio de Documentos') }}</h2> 
    <div class="grid grid-cols-12 gap-4 p-1">
      <div class="col-span-12">
        <Message severity="info" class="flex justify-center">POR COMPLETAR</Message>
      </div>
    </div>
  </div>
</template>
