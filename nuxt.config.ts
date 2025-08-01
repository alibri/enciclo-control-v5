// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import pkg from './package.json';

export default defineNuxtConfig({
  // @ts-ignore - PrimeVue module configuration
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },  
  ssr: false,
  runtimeConfig: {
    public: {
      APP_VERSION: pkg.version,
      APP_NAME: pkg.name,
      APP_MODE: process.env?.NODE_ENV,
      APP_TITLE: process.env?.APP_TITLE_ENV,
      API_BASE_URL: process.env?.API_BASE_URL,
      API_USERNAME: process.env?.API_USERNAME,
      API_SECRET: process.env?.API_SECRET,
      PAGE_BASE_URL: process.env?.PAGE_BASE_URL,
      EDITOR_BASE_URL: process.env?.EDITOR_BASE_URL
    }
  },
  modules: [
    '@primevue/nuxt-module',
    '@formkit/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    [
      '@nuxtjs/i18n',
      {
        lazy: true,
        langDir: 'locales',
        defaultLocale: 'es',
        strategy: 'no_prefix',
        locales: [
          { code: 'es', file: 'es.json', name: 'Español' }
        ],
        vueI18n: './vue-i18n.options.ts'
      }
    ],
    [
      '@nuxt/content',
      {
        highlight: {
          theme: 'one-dark-pro',
          preload: ['json', 'js', 'ts', 'html', 'css', 'vue']
        }
      }
    ],
    '@vueuse/nuxt'
  ],
  // @ts-ignore
  primevue: {
    options: {
      ripple: true,
      inputVariant: 'filled',
      theme: {
        preset: Lara
      }
    },
    autoImport: true
  },
  css: [
    // 'primevue/resources/primevue.css',
    // 'primevue/resources/themes/lara-light-blue/theme.css',
    'primeicons/primeicons.css',
    'primeflex/primeflex.css',
    //'@sfxcode/formkit-primevue/dist/sass/formkit-primevue.scss'
  ]
})
