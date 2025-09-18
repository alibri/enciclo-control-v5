<script setup lang="ts">
import UserService from '~/services/userService';

const { showMessage, removeGroup } = useMessages();
const { t } = useI18n();
const userService = new UserService();

interface Props {
  visible: boolean;
  user: any;
  collections: any[];
  title: string;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'user-saved'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showError = ref(false);
const errorMessage = ref('');

const addUser = async () => {
  errorMessage.value = '';
  showError.value = false;

  const id: number | null = (props.user.id > 0) ? props.user.id : null;
  const userdata = JSON.parse(JSON.stringify(props.user));

  const response = await userService.add(id, userdata);
  if (checkLogged(response)) {
    if (response?.data?.value?.success !== true) {
      errorMessage.value = response?.data?.value?.message;
      showError.value = true;
      showMessage('error', t('Error'), response?.data?.value?.message);
    } else {
      if (props.user?.begin && props.user?.period?.[0]) {
        props.user.begin = props.user.period[0];
      }
      if (props.user?.end && props.user?.period?.[1]) {
        props.user.end = props.user.period[1];
      }
      if (props.user?.stats_min) {
        props.user.stats_min = props.user.stats_min;
      }
      showMessage('info', t('Usuarios'), t('Usuario {id} {status}').replace('{id}', response?.data?.value?.id).replace('{status}', (id !== null ? 'Actualizado' : 'Creado')));
      closeDialog();
      emit('user-saved');
    }
  }
};

const closeDialog = () => {
  emit('update:visible', false);
};
</script>

<template>
  <Dialog 
    :visible="visible" 
    @update:visible="(value) => emit('update:visible', value)"
    modal 
    maximizable
    :style="{ width: '50rem' }" 
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <template #header>
      <h3 class="text-lg font-semibold text-gray-800">
        <i class="pi pi-user" /> {{ title }}
      </h3>
    </template>

    <div class="grid grid-cols-12 gap-6">
      <!-- Sección 1: Permisos y Estado -->
      <Fieldset :legend="t('Estado del usuario')" class="col-span-12">
        <div class="grid grid-cols-12">
          <div class="col-span-12">
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <ToggleSwitch v-model="user.isenabled" />
                <span class="pi pi-check text-green-600" /> 
                <label for="isenabled" class="text-gray-700 font-medium">{{ t('Activo') }}</label>
              </div>
            </div>
          </div>
        </div>
      </Fieldset>
      
      <Fieldset :legend="t('Permisos del usuario')" class="col-span-12">
        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-3">
            <div class="flex items-center gap-2">
              <ToggleSwitch v-model="user.isadmin" />
              <span class="pi pi-user text-purple-600" /> 
              <label for="isadmin" class="text-gray-700 font-medium">{{ t('Admin') }}</label>
            </div>
          </div>
          <div class="col-span-3">
            <div class="flex items-center gap-2">
              <ToggleSwitch v-model="user.iseditor" />
              <span class="pi pi-pencil text-blue-600" /> 
              <label for="iseditor" class="text-gray-700 font-medium">{{ t('Editor') }}</label>
            </div>
          </div>
          <div class="col-span-3">
            <div class="flex items-center gap-2 h-full" style="align-items: center;">
              <ToggleSwitch v-model="user.dashboard_access" />
              <span class="pi pi-chart-bar text-yellow-600" />
              <label for="dashboard_access" class="text-gray-700 font-medium">{{ t('Dashboard') }}</label>
            </div>
          </div>
          <div class="col-span-3">
            <div class="flex items-center gap-2">
              <ToggleSwitch v-model="user.istester" />
              <span class="pi pi-comment text-orange-600" /> 
              <label for="istester" class="text-gray-700 font-medium">{{ t('Pregúntame') }}</label>
            </div>
          </div>            
        </div>
      </Fieldset>

      <!-- Sección 2: Información Básica -->
      <Fieldset :legend="t('Información Básica')" class="col-span-12">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-6 mb-4">
            <FloatLabel variant="in">
              <label for="name1" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Nombre') }}</label>
              <InputText id="name1" v-model="user.name" type="text" class="w-full"/>
            </FloatLabel>
          </div>
          <div class="col-span-6 mb-4">
            <FloatLabel variant="in">
              <label for="email1" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Email') }}</label>
              <InputText id="email1" v-model="user.email" type="text" class="w-full"/>
            </FloatLabel>
          </div>
        </div>
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-6 mb-4">
            <FloatLabel variant="in" class="w-full">
              <label for="user" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Usuario') }}</label>
              <InputText id="user" v-model="user.user" type="text"/>
            </FloatLabel>
          </div>
          <div class="col-span-6 mb-4">
            <FloatLabel variant="in">
              <label for="passwd" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Contraseña') }}</label>
              <InputText id="passwd" v-model="user.passwd" type="text" class="w-full" toggle-mask/>
            </FloatLabel>
          </div>
        </div>
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-6 mb-4">
            <FloatLabel variant="in">
              <label for="grupo" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Grupo') }}</label>
              <InputText id="grupo" v-model="user.grupo" type="text" class="w-full"/>
            </FloatLabel>
          </div>
          <div class="col-span-6 mb-4">
            <FloatLabel variant="in">
              <label for="meta" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Meta Por Defecto') }}</label>
              <InputText id="meta" v-model="user.meta" type="text" class="w-full"/>
            </FloatLabel>
          </div>
        </div>
      </Fieldset>

      <!-- Sección 3: Configuración de Acceso -->
      <Fieldset :legend="t('Configuración de Acceso')" class="col-span-12">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-4">
            <FloatLabel variant="in">
              <label for="licencias" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Licencias') }}</label>
              <InputNumber id="licencias" v-model="user.licenses" mode="decimal" />
            </FloatLabel>
          </div>
          <div class="col-span-4">
            <FloatLabel variant="in">
              <label for="begin" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Desde') }}</label>
              <InputMask v-model="user.begin" mask="99/99/9999" placeholder="99/99/9999" slot-char="dd/mm/yyyy" />
            </FloatLabel>
          </div>
          <div class="col-span-4">
            <FloatLabel variant="in">
              <label for="end" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Hasta') }}</label>
              <InputMask v-model="user.end" mask="99/99/9999" placeholder="99/99/9999" slot-char="dd/mm/yyyy" />
            </FloatLabel>
          </div>
        </div>
        <hr/>
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <FloatLabel variant="in">
              <label for="stats_min" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Inicio estadísticas') }}</label>
              <InputMask v-model="user.stats_min" mask="99/99/9999" placeholder="99/99/9999" slot-char="dd/mm/yyyy" />
            </FloatLabel>
          </div>
        </div>
        <hr/>
        <div class="col-span-12 gap-4">
          <FloatLabel variant="on">
            <label for="collections" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Colecciones') }}</label>
            <MultiSelect
              v-model="user.collections"
              :options="collections"
              option-label="name"
              option-value="code"
              display="chip"
              :fluid="true"
              :maxSelectedLabels="3"
              :selectedItemsLabel="user.collections.length + ' ' + t('Colecciones seleccionadas')"
              :placeholder="t('Seleciona Colecciones')"
            />
          </FloatLabel>
        </div>
      </Fieldset>

      <!-- Sección 4: Restricciones -->
      <Fieldset :legend="t('Restricciones')" class="col-span-12">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <FloatLabel variant="in">
              <label for="iprange" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Rango IP') }}</label>
              <Textarea id="iprange" v-model="user.iprange" :auto-resize="true" rows="3" :placeholder="t('Ej: 192.168.1.0/24, 10.0.0.0/8')" class="w-full" />
            </FloatLabel>
          </div>
          <div class="col-span-6">
            <FloatLabel variant="in">
              <label for="geoip" class="block text-sm font-medium text-gray-700 mb-2">{{ t('GeoIP') }}</label>
              <Textarea id="geoip" v-model="user.geoip" :auto-resize="true" rows="3" cols="30" :placeholder="t('Ej: ES, FR, DE')" class="w-full" />
            </FloatLabel>
          </div>
          <div class="col-span-6">
            <FloatLabel variant="in">
              <label for="referer" class="block text-sm font-medium text-gray-700 mb-2">{{ t('Referer') }}</label>
              <Textarea id="referer" v-model="user.referer" :auto-resize="true" rows="3" cols="30" :placeholder="t('Ej: *.example.com')" class="w-full" />
            </FloatLabel>
          </div>
        </div>
      </Fieldset>

      <!-- Mensaje de error -->
      <Message v-show="showError" severity="error" class="col-span-12">
        {{ errorMessage }}
      </Message>
    </div>

    <template #footer>
      <Button :label="t('Cancelar')" icon="pi pi-times" class="p-button-danger" @click="closeDialog" />
      <Button :label="t('Aceptar')" icon="pi pi-check" autofocus @click="addUser" />
    </template>
  </Dialog>
</template>

<style scoped>
@layer primevue {
  .p-floatlabel:has(input.p-filled) label, .p-floatlabel:has(textarea.p-filled) label, .p-floatlabel:has(.p-inputwrapper-filled) label {
    z-index: 999;
  }
}
@layer primevue {
  .p-floatlabel label {
    z-index: 999;
  }
}
</style>
