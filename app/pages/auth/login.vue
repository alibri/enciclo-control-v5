<script lang="ts" setup>

import { useRouter } from 'vue-router'; // import useRouter from vue-router
import { ref } from 'vue'; // import ref from vue
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
    <div class="card">
      <div class="text-center">
        <span style="color: var(--primary-color)">{{ runtimeConfig.public.APP_TITLE }} {{
          runtimeConfig.public.APP_VERSION }}</span>
      </div>
      <h1 class="text-center">{{ t('Login') }}</h1>
      <form @submit.prevent="login">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-user" />
          </InputGroupAddon>
          <InputText v-model="user.username" :placeholder="t('Username')" required />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-hashtag" />
          </InputGroupAddon>
          <Password v-model="user.secret" :placeholder="t('Password')" required toggle-mask :feedback="false" />
        </InputGroup>
        <Button type="submit" :label="t('Login')" class="m-2" @click.prevent="login" />
        <InlineMessage v-if="auth_error" severity="error">
          {{ auth_error }}
        </InlineMessage>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.card {
  width: 300px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

form {
  display: flex;
  flex-direction: column;
}
</style>
