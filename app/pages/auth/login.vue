<script lang="ts" setup>

import { useRouter } from 'vue-router'; // import useRouter from vue-router
import { ref, computed, onMounted } from 'vue'; // import ref from vue
import { storeToRefs } from 'pinia'; // import storeToRefs helper hook from pinia
import { useAuthStore } from '~/stores/auth'; // import the auth store we just created

const { t } = useI18n();

definePageMeta({
  layout: 'simple'
});

const { authenticateUser } = useAuthStore(); // use authenticateUser action from  auth store

const { authenticated, auth_error } = storeToRefs(useAuthStore()); // make authenticated state reactive with storeToRefs

const runtimeConfig = useRuntimeConfig();

const user = ref({
  username: runtimeConfig.public?.API_USERNAME,
  secret: runtimeConfig.public?.API_SECRET
});
const router = useRouter();

// Tema oscuro/claro
const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  updateTheme();
};

const updateTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

onMounted(() => {
  // Verificar tema guardado o preferencia del sistema
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  isDark.value = savedTheme ? savedTheme === 'dark' : prefersDark;
  updateTheme();
});

const login = async () => {
  await authenticateUser(user.value); // call authenticateUser and pass the user object
  // redirect to homepage if user is authenticated
  if (authenticated) {
    router.push('/');
  }
};
</script>

<template>
  <form @submit.prevent="login">
    <div class="min-h-screen bg-surface-50 flex items-center justify-center px-6 py-8" style="background-color: var(--surface-ground);">
      <div
        class="bg-surface-0 p-8 md:p-12 shadow-sm rounded-2xl w-full max-w-sm flex flex-col gap-8" style="background-color: var(--surface-card);">
        <div class="flex flex-col items-center gap-4">
          <div class="flex items-center gap-4">
            <img src="/Grupo-Enciclo.svg" alt="Logo Enciclo" style="height: 3rem; margin-bottom: 0.5rem;" />
          </div>
          <div class="flex flex-col items-center gap-2 w-full">
            <div class="text-surface-900 text-2xl font-semibold leading-tight text-center w-full" style="color: var(--text-color);">{{
              runtimeConfig.public.APP_TITLE }}</div>
            <div class="text-center w-full">
              <span class="text-surface-700 leading-normal" style="color: var(--text-color-secondary);">{{ runtimeConfig.public.APP_VERSION
              }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-6 w-full">

          <div class="input-container">
            <InputGroup class="custom-input-group">
              <InputGroupAddon class="input-addon">
                <i class="pi pi-user" />
              </InputGroupAddon>
              <InputText v-model="user.username" :placeholder="t('Username')" required class="custom-input" />
            </InputGroup>
          </div>

          <div class="input-container">
            <InputGroup class="custom-input-group">
              <InputGroupAddon class="input-addon">
                <i class="pi pi-lock" />
              </InputGroupAddon>
              <Password v-model="user.secret" :placeholder="t('Password')" required toggle-mask :feedback="false"
                class="custom-password" inputClass="custom-input" />
            </InputGroup>
          </div>
        </div>
        <Button type="submit" :label="t('Login')" icon="pi pi-user" @click.prevent="login" :loading="false"
          class="w-full py-2 rounded-lg flex justify-center items-center gap-2">
          <template #icon>
            <i class="pi pi-user text-base! leading-normal!" />
          </template>
        </Button>

        <InlineMessage v-if="auth_error" severity="error" class="error-message">
          {{ auth_error }}
        </InlineMessage>
      </div>
    </div>
  </form>
</template>

  <style scoped>

  /* Modo oscuro */
  :global(.dark) .login-container {
    background: #0f172a;
  }
  .custom-input-group {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
  }

  .custom-input-group:hover {
    border-color: #cbd5e1;
  }

  .custom-input-group:focus-within {
    border-color: var(--primary-color, #3b82f6);
  }

  /* Modo oscuro */
  :global(.dark) .custom-input-group {
    border-color: #475569;
    background: #334155;
  }

  :global(.dark) .custom-input-group:hover {
    border-color: #64748b;
  }

  :global(.dark) .custom-input-group:focus-within {
    border-color: #60a5fa;
  }

  .input-addon {
    background: #f7fafc;
    border: none;
    padding: 0 15px;
    color: #718096;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 50px;
    transition: all 0.3s ease;
  }

  /* Modo oscuro */
  :global(.dark) .input-addon {
    background: #475569;
    color: #94a3b8;
  }

  .custom-input {
    border: none !important;
    /*padding: 15px 20px !important;*/
    font-size: 1rem !important;
    background: white !important;
    color: #2d3748 !important;
    box-shadow: none !important;
    outline: none !important;
    transition: all 0.3s ease !important;
  }

  .custom-input:focus {
    box-shadow: none !important;
    border: none !important;
  }

  /* Modo oscuro */
  :global(.dark) .custom-input {
    background: #334155 !important;
    color: #f1f5f9 !important;
  }

  :global(.dark) .custom-input::placeholder {
    color: #94a3b8 !important;
  }

  .custom-password :deep(.p-password-input) {
    border: none !important;
    /*padding: 15px 20px !important;*/
    font-size: 1rem !important;
    background: white !important;
    color: #2d3748 !important;
    box-shadow: none !important;
    outline: none !important;
    transition: all 0.3s ease !important;
  }

  .custom-password :deep(.p-password-input):focus {
    box-shadow: none !important;
    border: none !important;
  }

  /* Modo oscuro */
  :global(.dark) .custom-password :deep(.p-password-input) {
    background: #334155 !important;
    color: #f1f5f9 !important;
  }

  :global(.dark) .custom-password :deep(.p-password-input)::placeholder {
    color: #94a3b8 !important;
  }

  .custom-password :deep(.p-password-toggle) {
    background: #f7fafc !important;
    border: none !important;
    color: #718096 !important;
    padding: 0 15px !important;
    transition: all 0.3s ease !important;
  }

  /* Modo oscuro */
  :global(.dark) .custom-password :deep(.p-password-toggle) {
    background: #475569 !important;
    color: #94a3b8 !important;
  }
</style>