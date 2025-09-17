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
  <div class="login-container">
    <!-- Botón de cambio de tema -->
    <button @click="toggleTheme" class="theme-toggle">
      <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" />
    </button>
    
    <div class="login-card">
      <!-- Header con logo y título -->
      <div class="login-header">
        <div class="app-logo" style="display: flex; justify-content: center;">
          <img src="/Grupo-Enciclo.svg" alt="Logo Enciclo" style="height: 3rem; margin-bottom: 0.5rem;" />
        </div>
        <h1 class="app-title">{{ runtimeConfig.public.APP_TITLE }}</h1>
        <p class="app-version">{{ runtimeConfig.public.APP_VERSION }}</p>
      </div>

      <!-- Formulario -->
      <div class="login-form">
        <h2 class="form-title">{{ t('Login') }}</h2>
        <p class="form-subtitle">Ingresa tus credenciales para acceder</p>
        
        <form @submit.prevent="login">
          <div class="input-container">
            <InputGroup class="custom-input-group">
              <InputGroupAddon class="input-addon">
                <i class="pi pi-user" />
              </InputGroupAddon>
              <InputText 
                v-model="user.username" 
                :placeholder="t('Username')" 
                required 
                class="custom-input"
              />
            </InputGroup>
          </div>

          <div class="input-container">
            <InputGroup class="custom-input-group">
              <InputGroupAddon class="input-addon">
                <i class="pi pi-lock" />
              </InputGroupAddon>
              <Password 
                v-model="user.secret" 
                :placeholder="t('Password')" 
                required 
                toggle-mask 
                :feedback="false"
                class="custom-password"
                inputClass="custom-input"
              />
            </InputGroup>
          </div>

          <Button 
            type="submit" 
            :label="t('Login')" 
            class="login-button" 
            @click.prevent="login"
            :loading="false"
          />
          
          <InlineMessage v-if="auth_error" severity="error" class="error-message">
            {{ auth_error }}
          </InlineMessage>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
  position: relative;
  transition: background-color 0.3s ease;
}

/* Modo oscuro */
:global(.dark) .login-container {
  background: #0f172a;
}

.theme-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  color: #64748b;
  z-index: 10;
}

.theme-toggle:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: scale(1.05);
}

:global(.dark) .theme-toggle {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

:global(.dark) .theme-toggle:hover {
  background: #334155;
  border-color: #475569;
}

.login-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  width: 100%;
  max-width: 420px;
  animation: slideUp 0.6s ease-out;
  transition: all 0.3s ease;
}

/* Modo oscuro */
:global(.dark) .login-card {
  background: #1e293b;
  border-color: #334155;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  background: var(--primary-color, #3b82f6);
  color: white;
  padding: 40px 30px;
  text-align: center;
  transition: background-color 0.3s ease;
}

/* Modo oscuro */
:global(.dark) .login-header {
  background: #1e40af;
}

.app-logo {
  margin-bottom: 15px;
}

.app-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.app-version {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.login-form {
  padding: 40px 30px;
  transition: background-color 0.3s ease;
}

/* Modo oscuro */
:global(.dark) .login-form {
  background: #1e293b;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
  text-align: center;
  transition: color 0.3s ease;
}

/* Modo oscuro */
:global(.dark) .form-title {
  color: #f1f5f9;
}

.form-subtitle {
  color: #718096;
  font-size: 0.9rem;
  text-align: center;
  margin: 0 0 30px 0;
  transition: color 0.3s ease;
}

/* Modo oscuro */
:global(.dark) .form-subtitle {
  color: #94a3b8;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-container {
  position: relative;
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
  padding: 15px 20px !important;
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
  padding: 15px 20px !important;
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

.login-button {
  background: var(--primary-color, #3b82f6) !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 15px 30px !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  color: white !important;
  transition: all 0.3s ease !important;
  margin-top: 10px !important;
}

.login-button:hover {
  background: #2563eb !important;
}

.login-button:active {
  background: #1d4ed8 !important;
}

/* Modo oscuro */
:global(.dark) .login-button {
  background: #60a5fa !important;
}

:global(.dark) .login-button:hover {
  background: #3b82f6 !important;
}

:global(.dark) .login-button:active {
  background: #2563eb !important;
}

.error-message {
  margin-top: 15px !important;
  border-radius: 8px !important;
  padding: 12px 16px !important;
  font-size: 0.9rem !important;
  transition: all 0.3s ease !important;
}

/* Modo oscuro */
:global(.dark) .error-message {
  background: #dc2626 !important;
  color: white !important;
  border: 1px solid #ef4444 !important;
}

/* Responsive */
@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }
  
  .login-card {
    border-radius: 15px;
  }
  
  .login-header {
    padding: 30px 20px;
  }
  
  .login-form {
    padding: 30px 20px;
  }
  
  .app-title {
    font-size: 1.5rem;
  }
}
</style>
