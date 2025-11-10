// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config';
import pkg from './package.json';
import tailwindcss from "@tailwindcss/vite";

// Declaración de tipos para process (disponible en Node.js)
declare const process: {
  env: {
    NODE_ENV?: string;
    APP_TITLE_ENV?: string;
    API_BASE_URL?: string;
    API_BASE_URL_LONG_TASK?: string;
    API_USERNAME?: string;
    API_SECRET?: string;
    PAGE_BASE_URL?: string;
    EDITOR_BASE_URL?: string;
    AGENTS_MODELS?: string;
    DEFAULT_LLM_AGENT?: string;
    DEFAULT_LLM_MODEL?: string;
  };
};

export default defineNuxtConfig({
  // @ts-ignore - PrimeVue module configuration
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  alias: {
    quill: process?.env?.NODE_ENV === 'development' ? 'quill/dist/quill.js' : 'quill'
  },
  runtimeConfig: {
    public: {
      APP_VERSION: pkg.version,
      APP_NAME: pkg.name,
      APP_MODE: process?.env?.NODE_ENV,
      APP_TITLE: process?.env?.APP_TITLE_ENV,
      API_BASE_URL: process?.env?.API_BASE_URL,
      API_BASE_URL_LONG_TASK: process?.env?.API_BASE_URL_LONG_TASK,
      API_USERNAME: process?.env?.API_USERNAME,
      API_SECRET: process.env?.API_SECRET,
      PAGE_BASE_URL: process.env?.PAGE_BASE_URL,
      EDITOR_BASE_URL: process.env?.EDITOR_BASE_URL,
      AGENTS_MODELS: process.env?.AGENTS_MODELS,
      DEFAULT_LLM_AGENT: process.env?.DEFAULT_LLM_AGENT,
      DEFAULT_LLM_MODEL: process.env?.DEFAULT_LLM_MODEL
    }
  },
  modules: [
    '@primevue/nuxt-module',
    '@formkit/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@vueuse/nuxt',
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
    ]
  ],
  primevue: {
    importTheme: { from: '@/theme/app-theme.ts' },
    options: {
      ripple: true,
      inputVariant: 'filled',
      // @ts-ignore
      darkModeSelector: '.p-dark'
    },
    autoImport: true
  },
  css: [
    '@/assets/styles.scss',
    '@/assets/tailwind.css',
  ],
  vite: { 
    plugins: [
      tailwindcss()
    ], 
    resolve: { alias: { 'html2canvas': 'html2canvas-pro' } }    
  },
})
