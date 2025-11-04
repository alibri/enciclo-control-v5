<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import UserService from '~/services/userService';
const { showMessage, removeGroup } = useMessages();

import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import UserDialog from '~/components/UserDialog.vue';
import UserStatsDialog from '~/components/UserStatsDialog.vue';
import UserDashboardDialog from '~/components/UserDashboardDialog.vue';

const { filters } = usePrimeDataTable();
const { t } = useI18n();
const { getParamsData, lazyParams, exportDataGeneric, resetLazyParams } = useUtilsData();
const userService = new UserService();

filters.value = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  user: { value: null, matchMode: FilterMatchMode.CONTAINS }
};

const loading = ref(true);

const users = ref([]);
const dt = ref();
const totalRecords = ref(0);
const searchTerm = ref('');

const loadData = async () => {
  loading.value = true;

  const data = getParamsData(lazyParams.value);

  if (searchTerm.value) {
    (data as any).keyword = searchTerm.value;
  }

  const response = await userService.getUsers(data);
  if (checkLogged(response)) {
    users.value = response?.data?.value?.users || [];
    totalRecords.value = response?.data?.value?.total || 0;
  }
  loading.value = false;
};

onMounted(() => {
  resetLazyParams(dt.value.rows, filters.value);
  loadData();
  loadColections();
});

// New User
const displayNewUser = ref(false);

const emptyUser = {
  id: 0,
  name: '',
  user: '',
  licenses: 1,
  iprange: '',
  referer: '',
  geoip: '',
  collections: [],
  passwd: '',
  period: [],
  begin: '',
  end: '',
  stats_min: '',
  isadmin: false,
  iseditor: false,
  istester: false,
  isenabled: true,
  dashboard_access: false,
  manual_stats: false,
  email: '',
  grupo: '',
  meta: ''
};

const newUser = ref(emptyUser);

const collections = ref([]);

const loadColections = async () => {
  const response = await userService.getCollections();
  if (checkLogged(response)) {
    collections.value = response?.data?.value?.collections;
  }
};

const usuarioText = ref('');

const openNewUser = () => {
  newUser.value = emptyUser;
  usuarioText.value = t('Nuevo Usuario');
  displayNewUser.value = true;
};


const editUser = (user: any) => {
  user.isadmin = parseInt(user.isadmin) === 1;
  user.isenabled = parseInt(user.isenabled) === 1;
  user.iseditor = parseInt(user.iseditor) === 1;
  user.istester = parseInt(user.istester) === 1;
  user.dashboard_access = parseInt(user.dashboard_access) === 1;
  user.manual_stats = parseInt(user.manual_stats) === 1;
  let parts = user.begin?.split('/');
  if (parts) {
    const begin = (new Date(parts[2], parts[1], parts[0]));// .toISOString();
    parts = user.end.split('/');
    const end = (new Date(parts[2], parts[1], parts[0]));// .toISOString();
    user.period = [begin, end];
  }
  // Limpiar el array de colecciones eliminando valores nulos o vacíos
  if (user.collections) {
    user.collections = user.collections.filter((item: string) => item !== null && item !== '').map((item: string) => item.trim());
  }
  newUser.value = { ...user };
  usuarioText.value = t('Editando') + `: ${user.name}`;
  displayNewUser.value = true;
};

const confirm = useConfirm();

const deleteUser = (user: any) => {
  const msg = t('¿Quieres eliminar el usuario [{user}] {name}?').replace('{user}', user.id).replace('{name}', user.name);
  confirm.require({
    message: msg,
    header: t('Confirmar eliminación'),
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger',
    acceptLabel: t('Sí'),
    accept: async () => {
      const response = await userService.delete(user.id);
      if (checkLogged(response)) {
        if (response?.data?.value?.success !== true) {
          showMessage('error', t('Error'), response?.data?.value?.message);
        } else {
          showMessage('info', t('Usuarios'), t('Usuario {id} Eliminado').replace('{id}', user.id));
          loadData();
        }
      }
    }
  });
};

const onUserSaved = () => {
  loadData();
};

// Diálogo para resultado de importación
const displayImportResult = ref(false);
const importResultMessage = ref('');
const importProgress = ref(0);

const importFromExcel = async (event: any) => {
  const file = event.files[0];
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async () => {
    const base64 = reader.result?.toString();
    importProgress.value = 0;
    showMessage('info', t('Usuarios'), t('Procesando archivo...'), -1, 'c');
    
    // Simular progreso durante la importación
    const progressInterval = setInterval(() => {
      if (importProgress.value < 90) {
        importProgress.value += 10;
      }
    }, 200);
    
    const response = await userService.createFromExcel(base64 || '');
    clearInterval(progressInterval);
    importProgress.value = 100;
    removeGroup('c');
    if (checkLogged(response)) {
      if (response?.data?.value?.success) {
        let paso = 0;
        importResultMessage.value = '<div class="mb-4">' + t('Usuarios leídos correctamente: {total}').replace('{total}', formatIntNumber(response?.data?.value?.total)) + '</div>';
        importProgress.value = 0;
        displayImportResult.value = true;
        const totalAProcesar = response?.data?.value?.total || 0;
        let procesados = 0;
        while (true) {
          paso++;
          const responseProcess = await userService.createFromProcess(response?.data?.value?.process_id);
          if (checkLogged(responseProcess)) {
            if (responseProcess?.data?.value?.success) {
              procesados += responseProcess?.data?.value?.imported || 0;
              importProgress.value = Math.round((procesados / totalAProcesar) * 100);

              if (responseProcess?.data?.value?.errors?.length > 0 || responseProcess?.data?.value?.new?.length > 0 || responseProcess?.data?.value?.updated?.length > 0) {
                let mensaje = '';
                mensaje += `<div class="mb-4"><strong>${paso}. ${t('Usuarios importados')}:</strong> ${formatIntNumber(responseProcess?.data?.value?.imported)}</div>`;
              
                if (responseProcess?.data?.value?.errors && responseProcess?.data?.value?.errors.length > 0) {
                  mensaje += `<h3 class="text-red-600 font-semibold mt-4 mb-2">${t('Errores')}</h3><ul class="list-disc list-inside mb-4">`;
                  responseProcess?.data?.value?.errors.forEach((error: string) => {
                    mensaje += `<li class="text-sm text-red-600">${error}</li>`;
                  });
                  mensaje += `</ul>`;
                }
                
                if (responseProcess?.data?.value?.new && responseProcess?.data?.value?.new.length > 0) {
                  mensaje += `<h3 class="text-green-600 font-semibold mt-4 mb-2">${t('Usuarios nuevos')}</h3><ul class="list-disc list-inside mb-4">`;
                  responseProcess?.data?.value?.new.forEach((newUser: string) => {
                    mensaje += `<li class="text-sm text-green-600">${newUser}</li>`;
                  });
                  mensaje += `</ul>`;
                }
                
                if (responseProcess?.data?.value?.updated && responseProcess?.data?.value?.updated.length > 0) {
                  mensaje += `<h3 class="text-blue-600 font-semibold mt-4 mb-2">${t('Usuarios actualizados')}</h3><ul class="list-disc list-inside mb-4">`;
                  responseProcess?.data?.value?.updated.forEach((updatedUser: string) => {
                    mensaje += `<li class="text-sm text-blue-600">${updatedUser}</li>`;
                  });
                  mensaje += `</ul>`;
                }
                console.log('importResultMessage.value', importResultMessage.value);
                console.log('mensaje', mensaje);
                importResultMessage.value = importResultMessage.value + '<div class="mb-4">' + mensaje + '</div>';
              }

              if (responseProcess?.data?.value?.pending === 0) {
                break;
              }

            } else {
              showMessage('error', t('Error'), responseProcess?.data?.value?.message, -1);
              break;
            }
          }
        }
        importProgress.value = 100;
        importResultMessage.value = `<br/><h3>${t('Importación completada')}</h3><br/>${t('Usuarios importados')}: ${formatIntNumber(totalAProcesar)}` + importResultMessage.value;
        loadData();
      } else {
        showMessage('error', t('Error'), response?.data?.value?.message, -1);
      }
    }
  };
}

// Diálogo para desactivar grupo
const displayDesactivarGrupo = ref(false);
const grupoInput = ref('');

const abrirDialogDesactivarGrupo = () => {
  grupoInput.value = '';
  displayDesactivarGrupo.value = true;
};

const desactivarGrupo = async () => {
  if (!grupoInput.value || grupoInput.value.trim() === '') {
    showMessage('warn', t('Advertencia'), t('Por favor, ingresa un grupo'), -1, 'c');
    return;
  }
  
  displayDesactivarGrupo.value = false;
  
  const response = await userService.desactivarGrupo(grupoInput.value.trim());
  if (checkLogged(response)) {
    if (response?.data?.value?.success !== true) {
      showMessage('error', t('Error'), response?.data?.value?.message, -1, 'c');
    } else {
      showMessage('info', t('Usuarios'), response?.data?.value?.message, -1, 'c');
      loadData();
    }
  }
}

const verDashboard = (user: any) => {
  dashboardUser.value = user;
  displayDashboard.value = true;
};

const resetPassword = async (user: any) => {
  const msg = t('¿Quieres resetear la contraseña del usuario [{user}] {name}?').replace('%user%', user.user).replace('%name%', user.name);
  confirm.require({
    message: msg,
    header: t('Confirmar reseteo de contraseña'),
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger',
    acceptLabel: t('Sí'),
    accept: async () => {
      const response = await userService.resetPassword(user.id);
      if (checkLogged(response)) {
        if (response?.data?.value?.success !== true) {
          showMessage('error', t('Error'), response?.data?.value?.message, -1, 'c');
        } else {
          // Extraer el mensaje de la respuesta según el nuevo formato
          let mensaje = '';
          if (response?.data?.value?.result) {
            // Tomar el primer objeto del result y su mensaje
            const resultObj = Object.values(response.data.value.result)[0] as any;
            mensaje = resultObj?.message || '';
          } else {
            mensaje = response?.data?.value?.message || '';
          }
          showMessage('info', t('Usuarios'), mensaje, -1, 'c');
        }
      }
    }
  });

}

/*
const sendAccessData = async (user: any) => {
  console.log('sendAccessData', user);
  const response = await userService.sendAccessData(user.id);
  if (checkLogged(response)) {
    if (response?.data?.value?.success !== true) {
      showMessage('error', t('Error'), response?.data?.value?.message, -1);
    } else {
      showMessage('info', t('Usuarios'), t('Datos de acceso enviados correctamente'));
    }
  }
}
*/
const menu = ref();
const menuData = ref();
const items = ref([
  {
    label: t('Editar'),
    icon: 'pi pi-pencil',
    command: () => {
      editUser(menuData.value);
    },
    class: 'text-green-500'
  },
  {
    label: t('Eliminar'),
    icon: 'pi pi-trash',
    command: () => {
      deleteUser(menuData.value);
    },
    class: 'text-red-500'
  },
  {
    separator: true
  },
  {
    label: t('Gestió de estadísticas'),
    icon: 'pi pi-chart-bar',
    command: () => {
      gestionEstadisticas(menuData.value);
    },
    class: 'text-blue-500'
  },
  {
    label: t('Ver Dashboard'),
    icon: 'pi pi-chart-line',
    command: () => {
      verDashboard(menuData.value);
    },
    class: 'text-blue-500'
  },
  {
    separator: true
  },
  {
    label: t('Resetear contraseña'),
    icon: 'pi pi-key',
    command: () => {
      resetPassword(menuData.value);
    },
    class: 'text-yellow-500'
  }
]);

const toggle = (event: Event, data: any) => {
  menu.value.toggle(event);
  menuData.value = data;
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

const exportData = () => {
  exportDataGeneric(dt.value, 'usuarios' as any);
};

// Gestión de estadísticas
const displayStats = ref(false);
const selectedUser = ref<any>(null);

// Gestión de dashboard
const displayDashboard = ref(false);
const dashboardUser = ref<any>(null);

const gestionEstadisticas = (user: any) => {
  selectedUser.value = user;
  displayStats.value = true;
};

const onRowDoubleClick = (event: any) => {
  // Al hacer doble clic en la fila, abrir el diálogo de edición de usuario
  editUser(event.data);

};

const onRowClick = (event: any) => {
  // Evitar que se abra el diálogo cuando se hace clic en el botón de opciones
  if (event.originalEvent.target.closest('.p-button') ||
    event.originalEvent.target.closest('.p-menu') ||
    event.originalEvent.target.closest('a')) {
    return;
  }

  // Abrir el diálogo de estadísticas con el usuario de la fila clickeada
  gestionEstadisticas(event.data);
};


</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
    <!-- Header mejorado -->
    <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
        <i class="pi pi-users mr-2 text-blue-500"></i>
        {{ t('Usuarios') }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400 text-sm">{{ t('Gestión y seguimiento de usuarios') }}</p>
    </div>
    <div class="flex gap-2">
        <Button
          icon="pi pi-refresh"
          :label="t('Refrescar')"
          class="p-button-outlined p-button-secondary"
          @click="loadData()"
        />
        <Button 
          icon="pi pi-file-excel" 
          :label="t('Exportar')"
          class="p-button-success" 
          @click="exportData()" 
        />
      </div>
    </div>
    <div class="grid grid-cols-12 gap-4 p-1">
      <div class="col-span-12">
        <Toolbar>
          <template #start>
            <Button :label="t('Nuevo')" icon="pi pi-plus" class="ml-2" @click="openNewUser()" />
            <i class="fas fa-grip-lines-vertical mx-2 text-gray-300" />
          </template>
          <template #end>
            <Button icon="pi pi-trash" :label="t('Desactivar grupo')" class="p-button-danger mr-2" @click="abrirDialogDesactivarGrupo()" />
            
            <FileUpload mode="basic" accept=".xlsx,.xls" :maxFileSize="10000000" :chooseLabel="t('Crear desde EXCEL')" icon="pi pi-file-excel"
              class="p-button-success" :customUpload="true" @upload="importFromExcel" @select="importFromExcel"
              :auto="true">
              <template #chooseicon>
                <i class="fas fa-file-excel"></i>
              </template>
            </FileUpload>
          </template>
        </Toolbar>
      </div>
      <div class="col-span-12">
        <div class="table-container">
          <DataTable ref="dt" v-model:filters="filters" :value="users" :paginator="true" :rows="25" :lazy="true"
            :total-records="totalRecords"
            paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            paginator-position="both" :rows-per-page-options="[25, 50, 100]" responsive-layout="scroll" data-key="id"
            striped-rows sort-mode="multiple" show-gridlines filter-display="menu" :loading="loading"
            :global-filter-fields="['name', 'user', 'collections', 'iprange', 'grupo']"
            :current-page-report-template="t('show-per-page')" @page="onPage($event)" @sort="onSort($event)"
            @filter="onFilter($event)" @row-click="onRowClick" @row-dblclick="onRowDoubleClick" class="users-table">
            <template #header>
              <div class="flex flex-wrap justify-between items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-2">
                  <i class="pi pi-table text-blue-500"></i>
                  <span class="font-semibold text-gray-700 dark:text-gray-300">{{ t('Lista de Usuarios') }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatIntNumber(totalRecords) }} {{ t('registros') }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center mt-2">
                <div class="flex items-center gap-2">
                  <Button type="button" icon="pi pi-filter-slash" class="p-button-outlined"
                    @click="searchTerm = ''; loadData()" />
                  <IconField iconPosition="left">
                    <InputIcon class="pi pi-search"> </InputIcon>
                    <InputText v-model="searchTerm" :placeholder="t('Búsqueda')" @keydown.enter="onFilter" />
                  </IconField>
                </div>
              </div>
            </template>
            <template #empty>
              <div class="text-center text-gray-500 dark:text-gray-400 py-8">{{ t('No se han encontrado datos.') }}</div>
            </template>
            <template #loading>
              <div class="text-center text-gray-600 dark:text-gray-400 py-8">{{ t('Cargando datos..') }} <i class="pi pi-spin pi-spinner"
                  style="font-size: 2rem" /></div>
            </template>
            <Column header="#" :style="{ width: '60px' }" class="text-center">
              <template #body="slotProps">
                <Button type="button" icon="pi pi-ellipsis-v" @click="(e: Event) => toggle(e, slotProps.data)"
                  aria-haspopup="true" aria-controls="overlay_menu" class="p-button-sm p-button-text" />
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true">
                  <template #item="{ item, props }">
                    <a v-ripple class="flex items-center" v-bind="props.action">
                      <span :class="item.icon + ' ' + item.class" />
                      <span>{{ item.label }}</span>
                    </a>
                  </template>
                </Menu>
              </template>
            </Column>
            <Column field="id" :header="t('ID')" :sortable="true" :style="{ width: '80px' }" class="text-center">
              <template #body="slotProps">
                <span class="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{{ slotProps.data.id }}</span>
              </template>
            </Column>
            <Column field="name" :header="t('Nombre')" :sortable="true" class="font-semibold">
              <template #filter="{ filterModel, filterCallback }">
                <InputText v-model="filterModel.value" v-tooltip.top.focus="t('Pulsa ENTER para aplicar')" type="text"
                  class="p-column-filter" :placeholder="t('busqueda-nombre')" @keydown.enter="filterCallback()" />
              </template>
              <template #body="slotProps">
                <div class="flex items-center gap-2">
                  <i class="pi pi-user text-blue-500"></i>
                  <span class="font-medium">{{ slotProps.data.name }}</span>
                </div>
              </template>
            </Column>
            <Column field="user" :header="t('Usuario')" :sortable="true" class="font-semibold">
              <template #filter="{ filterModel, filterCallback }">
                <InputText v-model="filterModel.value" v-tooltip.top.focus="t('Pulsa ENTER para aplicar')" type="text"
                  class="p-column-filter" :placeholder="t('busqueda-nombre')" @keydown.enter="filterCallback()" />
              </template>
              <template #body="slotProps">
                <NuxtLink :to="'/users/' + slotProps.data.user"
                  class="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
                  <i class="pi pi-chart-bar text-red-500" />
                  <span class="font-medium">{{ slotProps.data.user }}</span>
                </NuxtLink>
              </template>
            </Column>
            <Column field="grupo" :header="t('Grupo')" :sortable="true" :style="{ width: '120px' }">
              <template #body="slotProps">
                <NuxtLink :to="'/users/g__' + slotProps.data.grupo" class="inline-block">
                  <span v-if="slotProps.data.grupo"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                    <i class="pi pi-users mr-1"></i>
                    {{ slotProps.data.grupo }}
                  </span>
                  <span v-else class="text-gray-400 text-sm">-</span>
                </NuxtLink>
              </template>
            </Column>
            <Column field="collections" :header="t('Colecciones')" :sortable="true" :style="{ width: '200px' }">
              <template #body="slotProps">
                <div v-if="slotProps.data.collections && slotProps.data.collections.length > 0"
                  class="flex flex-wrap gap-1">
                  <Tag v-for="item in slotProps.data.collections.slice(0, 2)" :key="item" :value="item" severity="info"
                    class="text-xs" />
                  <Tag v-if="slotProps.data.collections.length > 2" :value="`+${slotProps.data.collections.length - 2}`"
                    severity="secondary" class="text-xs" />
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <InputText v-model="filterModel.value" v-tooltip.top.focus="t('Pulsa ENTER para aplicar')" type="text"
                  class="p-column-filter" :placeholder="t('Búsqueda por colección')"
                  @keydown.enter="filterCallback()" />
              </template>
            </Column>
            <Column field="begin" :header="t('Inicio')" :sortable="true" :style="{ width: '100px' }"
              class="text-center">
              <template #body="slotProps">
                <span class="text-xs text-gray-600">{{ slotProps.data.begin || '-' }}</span>
              </template>
            </Column>
            <Column field="end" :header="t('Final')" :sortable="true" :style="{ width: '100px' }" class="text-center">
              <template #body="slotProps">
                <span class="text-xs text-gray-600">{{ slotProps.data.end || '-' }}</span>
              </template>
            </Column>
            <Column field="dashboard_access" :header="t('Dash.')" :sortable="true" :style="{ width: '100px' }"
              class="text-center">
              <template #body="slotProps">
                <span :class="slotProps.data.dashboard_access
                  ? 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'
                  : 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500'">
                  <i :class="slotProps.data.dashboard_access ? 'pi pi-chart-line mr-1' : 'pi pi-times mr-1'"></i>
                  {{ slotProps.data.dashboard_access ? t('Dashboard') : '-' }}
                </span>
              </template>
            </Column>
            <Column field="stats_min" :header="t('I.Est.')" :sortable="true" :style="{ width: '120px' }"
              class="text-center">
              <template #body="slotProps">
                <span class="text-xs text-gray-600">{{ slotProps.data.stats_min ? formatDate(slotProps.data.stats_min) :
                  '-' }}</span>
              </template>
            </Column>
            <Column field="email" :header="t('Email')" :sortable="true" :style="{ width: '200px' }">
              <template #body="slotProps">
                <div v-if="slotProps.data.email" class="flex items-center gap-2">
                  <i class="pi pi-envelope text-gray-400 text-sm"></i>
                  <span class="text-sm text-gray-600 truncate">{{ slotProps.data.email }}</span>
                </div>
                <span v-else class="text-gray-400 text-sm">-</span>
              </template>
            </Column>
            <Column field="isenabled" :header="t('Estado')" :sortable="true" :style="{ width: '100px' }"
              class="text-center">
              <template #body="slotProps">
                <span :class="slotProps.data.isenabled
                  ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                  : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'">
                  <i :class="slotProps.data.isenabled ? 'pi pi-check mr-1' : 'pi pi-times mr-1'"></i>
                  {{ slotProps.data.isenabled ? t('Activo') : t('Inactivo') }}
                </span>
              </template>
            </Column>
            <Column field="roles" :header="t('Roles')" :sortable="false" :style="{ width: '150px' }">
              <template #body="slotProps">
                <div class="flex flex-wrap gap-1">
                  <span v-if="slotProps.data.isadmin"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    <i class="pi pi-shield mr-1"></i>{{ t('Admin') }}
                  </span>
                  <span v-if="slotProps.data.iseditor"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <i class="pi pi-pencil mr-1"></i>{{ t('Editor') }}
                  </span>
                  <span v-if="slotProps.data.istester"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                    <i class="pi pi-comment mr-1"></i>{{ t('Tester') }}
                  </span>
                  <span v-if="slotProps.data.dashboard_access"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    <i class="pi pi-chart-line mr-1"></i>{{ t('Dashboard') }}
                  </span>
                  <span v-if="slotProps.data.manual_stats"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    <i class="pi pi-chart-bar mr-1"></i>{{ t('Stats') }}
                  </span>
                </div>
              </template>
            </Column>
            <Column field="iprange" :header="t('IP')" :sortable="true" :style="{ width: '120px' }">
              <template #filter="{ filterModel, filterCallback }">
                <InputText v-model="filterModel.value" v-tooltip.top.focus="t('Pulsa ENTER para aplicar')" type="text"
                  class="p-column-filter" :placeholder="t('Búsqueda por IP')" @keydown.enter="filterCallback()" />
              </template>
              <template #body="slotProps">
                <span v-if="slotProps.data.iprange" class="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {{ slotProps.data.iprange }}
                </span>
                <span v-else class="text-gray-400 text-sm">-</span>
              </template>
            </Column>
            <Column field="geoip" :header="t('Ubicación')" :sortable="true" :style="{ width: '100px' }">
              <template #body="slotProps">
                <span v-if="slotProps.data.geoip" class="text-xs text-blue-600">
                  <i class="pi pi-map-marker mr-1"></i>{{ slotProps.data.geoip }}
                </span>
                <span v-else class="text-gray-400 text-sm">-</span>
              </template>
            </Column>
            <Column field="created_at" :header="t('Creado')" :sortable="true" :style="{ width: '140px' }">
              <template #body="slotProps">
                <div class="text-xs text-gray-600">
                  <div class="font-medium">{{ new Date(slotProps.data.created_at).toLocaleDateString('es-ES') }}</div>
                  <div class="text-gray-400">{{ new Date(slotProps.data.created_at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) }}</div>
                </div>
              </template>
            </Column>
            <Column field="updated_at" :header="t('Act.')" :sortable="true" :style="{ width: '140px' }">
              <template #body="slotProps">
                <div class="text-xs text-gray-600">
                  <div class="font-medium">{{ new Date(slotProps.data.updated_at).toLocaleDateString('es-ES') }}</div>
                  <div class="text-gray-400">{{ new Date(slotProps.data.updated_at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) }}</div>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <UserDialog v-model:visible="displayNewUser" :user="newUser" :collections="collections" :title="usuarioText"
        @user-saved="onUserSaved" />
      <UserStatsDialog v-model:visible="displayStats" :user="selectedUser" />
      <UserDashboardDialog v-model:visible="displayDashboard" :user="dashboardUser" />
      
      <!-- Diálogo para desactivar grupo -->
      <Dialog v-model:visible="displayDesactivarGrupo" modal :header="t('Desactivar grupo')" :style="{ width: '30rem' }">
        <div class="flex flex-col gap-4 p-4">
          <div class="flex flex-col gap-2">
            <label for="grupo" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t('Grupo') }}
            </label>
            <InputText
              id="grupo"
              v-model="grupoInput"
              :placeholder="t('Ingresa el nombre del grupo')"
              class="w-full"
              @keydown.enter="desactivarGrupo"
            />
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              :label="t('Cancelar')"
              severity="secondary"
              @click="displayDesactivarGrupo = false"
            />
            <Button
              type="button"
              :label="t('Desactivar')"
              severity="danger"
              @click="desactivarGrupo"
            />
          </div>
        </div>
      </Dialog>
      
      <!-- Diálogo para resultado de importación -->
      <Dialog v-model:visible="displayImportResult" modal :header="t('Resultado de la importación')" :style="{ width: '50rem', maxWidth: '90vw' }">
        <div class="p-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('Progreso de la importación') }}
            </label>
            <ProgressBar :value="importProgress" :showValue="true" />
          </div>
          <div v-html="importResultMessage" class="prose prose-sm max-w-none"></div>
        </div>
        <template #footer>
          <Button :label="t('Cerrar')" icon="pi pi-times" @click="displayImportResult = false; importProgress = 0" severity="secondary" />
        </template>
      </Dialog>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor de la tabla con scroll horizontal */
.table-container {
  position: relative;
  overflow-x: auto;
  overflow-y: visible;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Estilos mejorados para la tabla de usuarios */
.users-table {
  min-width: 100%;
  border-radius: 12px;
  overflow: visible;
}

/* Hacer que las filas del DataTable sean clickeables */
:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f8fafc !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.p-datatable-tbody > tr:last-child) {
  border-bottom: none;
}

/* Mejorar el header de la tabla */
:deep(.p-datatable-thead > tr > th) {
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  font-weight: 600;
  color: #475569;
  padding: 1rem 0.75rem;
}

/* Mejorar las celdas */
:deep(.p-datatable-tbody > tr > td) {
  padding: 0.875rem 0.75rem;
  vertical-align: middle;
}

/* Evitar que los botones y enlaces cambien el cursor */
:deep(.p-datatable-tbody > tr .p-button),
:deep(.p-datatable-tbody > tr a) {
  cursor: pointer;
}

/* Mejorar el paginador */
:deep(.p-paginator) {
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 1rem;
}

/* Mejorar los filtros */
:deep(.p-column-filter) {
  border-radius: 6px;
  border: 1px solid #d1d5db;
  padding: 0.5rem;
  font-size: 0.875rem;
}

:deep(.p-column-filter:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Mejorar los tags */
:deep(.p-tag) {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

/* Mejorar los botones de acción */
:deep(.p-button-sm) {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* Animaciones suaves */
:deep(.p-datatable-tbody > tr) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mejorar el estado de carga */
:deep(.p-datatable-loading-overlay) {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
}

/* Estilos para la barra de scroll horizontal */
.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Firefox scrollbar */
.table-container {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

/* Responsive mejoras */
@media (max-width: 768px) {
  :deep(.p-datatable-tbody > tr > td) {
    padding: 0.5rem 0.25rem;
  }

  :deep(.p-datatable-thead > tr > th) {
    padding: 0.75rem 0.25rem;
    font-size: 0.875rem;
  }

  .table-container {
    margin: 0 -1rem;
    border-radius: 0;
  }
}
</style>
