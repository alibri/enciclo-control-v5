<script setup lang="ts">
import { consola } from 'consola';
// import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import UserService from '~/services/userService';
const { showMessage, removeGroup } = useMessages();

import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

const { filters } = usePrimeDataTable();
const { t } = useI18n();
const { getParamsData, lazyParams, exportDataGeneric, resetLazyParams } = useUtilsData();
const userService = new UserService();

filters.value = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  user: { value: null, matchMode: FilterMatchMode.CONTAINS } /* ,
  code: { value: null, matchMode: FilterMatchMode.CONTAINS },
  inventoryStatus: { value: null, matchMode: FilterMatchMode.STARTS_WITH } */
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

  // console.log('llamada a getUsers', data);
  const response = await userService.getUsers(data);
  if (checkLogged(response)) {
    // console.log('response', response);
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
const toast = useToast();
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
  isadmin: false,
  iseditor: false,
  istester: false,
  isenabled: true,
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
    // totalRecords.value = response?.data?.value?.total;
  }
};

const showError = ref(false);
const errorMessage = ref('');
const usuarioText = ref('');

const openNewUser = () => {
  newUser.value = emptyUser;
  usuarioText.value = t('Nuevo Usuario');
  displayNewUser.value = true;
};

const closeNewUser = () => {
  displayNewUser.value = false;
};

const editUser = (user: any) => {
  user.isadmin = parseInt(user.isadmin) === 1;
  user.isenabled = parseInt(user.isenabled) === 1;
  user.iseditor = parseInt(user.iseditor) === 1;
  user.istester = parseInt(user.istester) === 1;
  let parts = user.begin?.split('/');
  if (parts) {
    const begin = (new Date(parts[2], parts[1], parts[0]));// .toISOString();
    parts = user.end.split('/');
    const end = (new Date(parts[2], parts[1], parts[0]));// .toISOString();
    user.period = [begin, end];
    consola.log(begin, end, user.period);
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

const addUser = async () => {
  consola.log('addNewUser', newUser);
  errorMessage.value = '';
  showError.value = false;

  const id: number | null = (newUser.value.id > 0) ? newUser.value.id : null;
  const userdata = JSON.parse(JSON.stringify(newUser.value)); // Object.values(newUser.value);
  consola.log('userdata', userdata);

  const response = await userService.add(id, userdata);
  if (checkLogged(response)) {
    if (response?.data?.value?.success !== true) {
      errorMessage.value = response?.data?.value?.message;
      showError.value = true;
      showMessage('error', t('Error'), response?.data?.value?.message);
    } else {
      if (newUser.value?.begin && newUser.value?.period?.[0]) {
        newUser.value.begin = newUser.value.period[0];
      }
      if (newUser.value?.end && newUser.value?.period?.[1]) {
        newUser.value.end = newUser.value.period[1];
      }
      consola.log('ADD USER', response);
      showMessage('info', t('Usuarios'), t('Usuario {id} {status}').replace('{id}', response?.data?.value?.id).replace('{status}', (id !== null ? 'Actualizado' : 'Creado')));
      closeNewUser();
      loadData();
    }
  }
};

const importFromExcel = async (event: any) => {
  const file = event.files[0];
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async () => {
    const base64 = reader.result?.toString();
    console.log('base64', base64);
    showMessage('info', t('Usuarios'), t('Procesando archivo...'), -1, 'bc');
    const response = await userService.createFromExcel(base64 || '');
    removeGroup('bc');
    if (checkLogged(response)) {
      if (response?.data?.value?.success) {
        showMessage('info', t('Usuarios'), t('Usuarios importados correctamente'));
        if (response?.data?.value?.errors?.length > 0) {
          let mensaje = `${t('Usuarios importados')}: ${response.data.value.imported}\n\n`;
          mensaje += `${t('Errores')}:\n`;
          response.data.value.errors.forEach((error: string) => {
            mensaje += `${error}\n`;
          });
          showMessage('info', t('Resultado de la importación'), mensaje, -1);
        }
        loadData();
      } else {
        showMessage('error', t('Error'), response?.data?.value?.message, -1);
      }
    }
  };
}

const resetPassword = async (user: any) => {
  console.log('resetPassword', user);
  const response = await userService.resetPassword(user.id);
  if (checkLogged(response)) {
    if (response?.data?.value?.success !== true) {
      showMessage('error', t('Error'), response?.data?.value?.message, -1);
    } else {
      showMessage('info', t('Usuarios'), t('Contraseña reseteada correctamente'));
    }
  }
}

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

const menu = ref();
const menuData = ref();
const items = ref([
    {
        label: t('Opciones'),
        items: [
            {
                label: t('Editar'),
                icon: 'pi pi-pencil',
                command: () => {
                  console.log('editUser', menuData.value);
                  editUser(menuData.value);
                },
                class: 'text-green-500'
            },
            {
                label: t('Eliminar'),
                icon: 'pi pi-trash',
                command: () => {
                  console.log('deleteUser', menuData.value);
                  deleteUser(menuData.value);
                },
                class: 'text-red-500'
            },
            {
                label: t('Resetear contraseña'),
                icon: 'pi pi-key',
                command: () => {
                  console.log('resetPassword', menuData.value);
                  resetPassword(menuData.value);
                },
                class: 'text-blue-500'
            },
            {
              label: t('Enviar datos de acceso'),
              icon: 'pi pi-envelope',
              command: () => {
                console.log('sendAccessData', menuData.value);
                sendAccessData(menuData.value);
              },
              class: 'text-yellow-500'
            }
        ]
    }
]);

const toggle = (event: Event, data: any) => {
    menu.value.toggle(event);
    // Almacenar los datos del usuario para usarlos en los comandos
    console.log('toggle', event, data);
    items.value[0]?.items?.forEach((item: any) => {
        menuData.value = data;
        // item.command = () => item.command(menuData.value);
    });
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

</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ t('Usuarios') }}</h2>
    <div class="grid grid-cols-12 gap-4 p-1">
      <div class="col-span-12">
        <Toolbar>
          <template #start>
            <Button :label="t('Nuevo')" icon="fas fa-file" class="ml-2" @click="openNewUser()" />
            <i class="fas fa-grip-lines-vertical mx-2 text-gray-300" />
          </template>
          <template #end>
            <FileUpload
              mode="basic"
              accept=".xlsx,.xls"
              :maxFileSize="10000000"
              :chooseLabel="t('Crear desde EXCEL')"
              class="p-button-secondary"
              :customUpload="true"
              @upload="importFromExcel"
              @select="importFromExcel"
              :auto="true"
            >
              <template #chooseicon>
                <i class="fas fa-file-excel"></i>
              </template>
            </FileUpload>
          </template>
        </Toolbar>
      </div>
      <div class="col-span-12">
        <DataTable
          ref="dt"
          v-model:filters="filters"
          :value="users"
          :paginator="true"
          :rows="25"
          :lazy="true"
          :total-records="totalRecords"
          paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          paginator-position="both"
          :rows-per-page-options="[25, 50, 100]"
          responsive-layout="scroll"
          data-key="id"
          striped-rows
          sort-mode="multiple"
          show-gridlines
          filter-display="menu"
          :loading="loading"
          :global-filter-fields="['name', 'user', 'collections', 'iprange', 'grupo']"
          :current-page-report-template="t('show-per-page')"
          @page="onPage($event)"
          @sort="onSort($event)"
          @filter="onFilter($event)"
          >
          <template #header>
            <div class="flex justify-between items-center">
              <div class="left-0">
                <Button
                  icon="pi pi-refresh"
                  :label="t('Refrescar')"
                  class="p-button-secondary"
                  @click="loadData()"
                />
                <Button icon="pi pi-file-excel" class="p-button-success ml-2" @click="exportData()" />
              </div>
              <div class="flex items-center gap-2">
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  class="p-button-outlined"
                  @click="searchTerm = ''; loadData()"
                />
                <IconField iconPosition="left">
                  <InputIcon class="pi pi-search"> </InputIcon>
                  <InputText v-model="searchTerm" :placeholder="t('Búsqueda')" @keydown.enter="onFilter" />
                </IconField>
              </div>
            </div>
          </template>
          <template #empty>
            <div class="text-center text-gray-500 py-8">{{ t('No se han encontrado datos.') }}</div>
          </template>
          <template #loading>
            <div class="text-center text-gray-600 py-8">{{ t('Cargando datos..') }} <i class="pi pi-spin pi-spinner" style="font-size: 2rem" /></div>
          </template>
          <Column header="#">
            <template #body="slotProps">              
                <Button type="button" icon="pi pi-ellipsis-v" @click="(e: Event) => toggle(e, slotProps.data)" aria-haspopup="true" aria-controls="overlay_menu" />
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
            </template>
          </Column>
          <Column field="id" :header="t('Id')" :sortable="true" class="text-xs" />
          <Column field="name" :header="t('Nombre')" :sortable="true" class="font-bold">
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-model="filterModel.value"
                v-tooltip.top.focus="t('Pulsa ENTER para aplicar')"
                type="text"
                class="p-column-filter"
                :placeholder="t('busqueda-nombre')"
                @keydown.enter="filterCallback()"
              />
            </template>
          </Column>
          <Column field="user" :header="t('Usuario')" :sortable="true" class="font-bold">
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-model="filterModel.value"
                v-tooltip.top.focus="t('Pulsa ENTER para aplicar')"
                type="text"
                class="p-column-filter"
                :placeholder="t('busqueda-nombre')"
                @keydown.enter="filterCallback()"
              />
            </template>
            <template #body="slotProps">
              <NuxtLink :to="'/users/'+slotProps.data.user">
                <i class="pi pi-chart-bar text-red-500" /> {{ slotProps.data.user }}
              </NuxtLink>
            </template>
          </Column>
          <Column field="grupo" :header="t('Grupo')" :sortable="true" class="font-bold">
            <template #body="slotProps">
              <NuxtLink :to="'/users/g__'+slotProps.data.grupo">
                <span class="font-bold border-b border-dotted border-gray-300">{{ slotProps.data.grupo }}</span>
              </NuxtLink>
            </template>
          </Column>
          <Column field="collections" :header="t('Colecciones')" :sortable="true">
            <template #body="slotProps">
              <span v-if="slotProps.data.collections">
                <span v-for="item in slotProps.data.collections" :key="item">
                  <Tag v-if="item" :value="item" rounded />
                </span>
              </span>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-model="filterModel.value"
                v-tooltip.top.focus="'Pulsa ENTER para aplicar'"
                type="text"
                class="p-column-filter"
                :placeholder="`Búsqueda por colección - `"
                @keydown.enter="filterCallback()"
              />
            </template>
          </Column>
          <Column field="begin" :header="t('Inicio')" :sortable="true" class="text-xs" />
          <Column field="end" :header="t('Final')" :sortable="true" class="text-xs" />
          <Column field="email" :header="t('Email')" :sortable="true" class="text-xs" />
          <Column field="isadmin" :header="t('Admin')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <i
                :class="'pi ' + (slotProps.data.isadmin ? 'pi pi-check bg-purple-500 text-white font-bold rounded-full m-2 p-2' : '')"
              />
            </template>
          </Column>
          <Column field="iseditor" :header="t('Editor')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <i
                :class="'pi ' + (slotProps.data.iseditor ? 'pi pi-check bg-green-500 text-white font-bold rounded-full m-2 p-2' : '')"
              />
            </template>
          </Column>
          <Column field="istester" :header="t('Tester')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <i
                :class="'pi ' + (slotProps.data.istester ? 'pi pi-check bg-orange-500 text-white font-bold rounded-full m-2 p-2' : '')"
              />
            </template>
          </Column>
          <Column field="isenabled" :header="t('Activo')" :sortable="true" class="text-center">
            <template #body="slotProps">
              <i
                :class="'pi ' + (slotProps.data.isenabled ? 'pi-check bg-blue-500 text-white font-bold rounded-full m-2 p-2' : 'pi-times bg-pink-500 text-white font-bold rounded-full m-2 p-2')"
              />
            </template>
          </Column>
          <Column field="iprange" :header="t('IP')">
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-model="filterModel.value"
                v-tooltip.top.focus="'Pulsa ENTER para aplicar'"
                type="text"
                class="p-column-filter"
                :placeholder="`Búsqueda por IP - `"
                @keydown.enter="filterCallback()"
              />
            </template>
          </Column>
          <Column field="geoip" :header="t('GeoIP')" class="text-yellow-600" />
          <Column field="referer" :header="t('Referer')" class="text-xs text-green-600" />
          <Column field="email" :header="t('Email')" :sortable="true" class="text-xs text-blue-600" />
          <Column field="meta" :header="t('Meta')" :sortable="true" class="text-xs" />
          <Column field="created_at" :header="t('Creado')" :sortable="true" class="text-xs">
            <template #body="slotProps">
              <span class="text-gray-700">{{ new Date(slotProps.data.created_at).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) }}</span>
            </template>
          </Column>
          <Column field="updated_at" :header="t('Actualizado')" :sortable="true" class="text-xs">
            <template #body="slotProps">
              <span class="text-gray-700">{{ new Date(slotProps.data.updated_at).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) }}</span>
            </template>
          </Column>
        </DataTable>
      </div>

      <Dialog v-model:visible="displayNewUser" :modal="true">
        <template #header>
          <h3 class="text-lg font-semibold text-gray-800"><i class="pi pi-user" /> {{ usuarioText }}</h3>
        </template>

        <div class="grid grid-cols-12 gap-6">
          <!-- Sección 1: Permisos y Estado -->
          <div class="col-span-12">
            <h4 class="text-md font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">{{ t('Permisos y Estado') }}</h4>
            <div class="space-y-3 mb-6">
              <div class="flex items-center gap-2">
                <ToggleButton v-model="newUser.isenabled" :on-label="t('Sí')" :off-label="t('No')" on-icon="pi pi-check" off-icon="pi pi-times" />
                <span class="pi pi-check text-green-600" /> <label for="isenabled" class="text-gray-700 font-medium">{{ t('Activo') }}</label>
              </div>
              <div class="flex items-center gap-2">
                <ToggleButton v-model="newUser.isadmin" :on-label="t('Sí')" :off-label="t('No')" on-icon="pi pi-check" off-icon="pi pi-times" />
                <span class="pi pi-user text-purple-600" /> <label for="isadmin" class="text-gray-700 font-medium">{{ t('Administrador') }}</label>
              </div>
              <div class="flex items-center gap-2">
                <ToggleButton v-model="newUser.iseditor" :on-label="t('Sí')" :off-label="t('No')" on-icon="pi pi-check" off-icon="pi pi-times" />
                <span class="pi pi-pencil text-blue-600" /> <label for="iseditor" class="text-gray-700 font-medium">{{ t('Editor') }}</label>
              </div>
              <div class="flex items-center gap-2">
                <ToggleButton v-model="newUser.istester" :on-label="t('Sí')" :off-label="t('No')" on-icon="pi pi-check" off-icon="pi pi-times" />
                <span class="pi pi-comment text-orange-600" /> <label for="istester" class="text-gray-700 font-medium">{{ t('Pregúntame') }}</label>
              </div>
            </div>
          </div>

          <!-- Sección 2: Información Básica -->
          <div class="col-span-12">
            <h4 class="text-md font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">{{ t('Información Básica') }}</h4>
            <div class="grid grid-cols-12 gap-4 mb-4">
              <div class="col-span-6">
                <label for="name1" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Nombre') }}</label>
                <InputText id="name1" v-model="newUser.name" type="text" />
              </div>
              <div class="col-span-6">
                <label for="email1" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Email') }}</label>
                <InputText id="email1" v-model="newUser.email" type="text" />
              </div>
            </div>
            <div class="grid grid-cols-12 gap-4 mb-4">
              <div class="col-span-6">
                <label for="user" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Usuario') }}</label>
                <InputText id="user" v-model="newUser.user" type="text" />
              </div>
              <div class="col-span-6">
                <label for="passwd" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Contraseña') }}</label>
                <Password id="passwd" v-model="newUser.passwd" type="text" toggle-mask />
              </div>
            </div>
            <div class="grid grid-cols-12 gap-4 mb-4">
              <div class="col-span-4">
                <label for="grupo" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Grupo') }}</label>
                <InputText id="grupo" v-model="newUser.grupo" type="text" />
              </div>
              <div class="col-span-4">
                <label for="meta" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Meta') }}</label>
                <InputText id="meta" v-model="newUser.meta" type="text" />
              </div>
              <div class="col-span-4">
                <label for="licencias" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Licencias') }}</label>
                <InputNumber id="licencias" v-model="newUser.licenses" mode="decimal" />
              </div>
            </div>
          </div>

          <!-- Sección 3: Configuración de Acceso -->
          <div class="col-span-12">
            <h4 class="text-md font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">{{ t('Configuración de Acceso') }}</h4>
            <div class="grid grid-cols-12 gap-4 mb-4">
              <div class="col-span-6">
                <label for="begin" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Desde') }}</label>
                <InputMask v-model="newUser.begin" mask="99/99/9999" placeholder="99/99/9999" slot-char="dd/mm/yyyy" />
              </div>
              <div class="col-span-6">
                <label for="end" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Hasta') }}</label>
                <InputMask v-model="newUser.end" mask="99/99/9999" placeholder="99/99/9999" slot-char="dd/mm/yyyy" />
              </div>
            </div>
            <div class="col-span-12 mb-4">
              <label for="collections" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Colecciones') }}</label>
              <MultiSelect
                v-model="newUser.collections"
                :options="collections"
                option-label="name"
                option-value="code"
                display="chip"
                :placeholder="t('Seleciona Colecciones')"
              />
            </div>
          </div>

          <!-- Sección 4: Restricciones -->
          <div class="col-span-12">
            <h4 class="text-md font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">{{ t('Restricciones') }}</h4>
            <div class="grid grid-cols-12 gap-4 mb-4">
              <div class="col-span-12">
                <label for="iprange" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Rango IP') }}</label>
                <Textarea id="iprange" v-model="newUser.iprange" :auto-resize="true" rows="3" cols="30" placeholder="Ej: 192.168.1.0/24, 10.0.0.0/8" />
              </div>
            </div>
            <div class="grid grid-cols-12 gap-4 mb-4">
              <div class="col-span-6">
                <label for="geoip" class="block text-sm font-medium text-gray-700 mb-2">{{ t('GeoIP') }}</label>
                <Textarea id="geoip" v-model="newUser.geoip" :auto-resize="true" rows="3" cols="30" placeholder="Ej: ES, FR, DE" />
              </div>
              <div class="col-span-6">
                <label for="referer" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Referer') }}</label>
                <Textarea id="referer" v-model="newUser.referer" :auto-resize="true" rows="3" cols="30" placeholder="Ej: *.example.com" />
              </div>
            </div>
          </div>

          <!-- Mensaje de error -->
          <Message v-show="showError" severity="error" class="col-span-12">
            {{ errorMessage }}
          </Message>
        </div>

        <template #footer>
          <Button :label="t('Cancelar')" icon="pi pi-times" class="p-button-danger" @click="closeNewUser" />
          <Button :label="t('Aceptar')" icon="pi pi-check" autofocus @click="addUser" />
        </template>
      </Dialog>
    </div>
  </div>
</template>
