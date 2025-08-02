# Enciclo Control 5.0

## 📋 Descripción

**Enciclo Control 5.0** es una aplicación web moderna desarrollada con **Nuxt 4** que proporciona un sistema completo de gestión y control para plataformas de contenido educativo y enciclopédico. Esta aplicación está diseñada para administrar sesiones de usuarios, estadísticas, contenido multimedia, y proporcionar herramientas de gestión integral para sistemas de información educativa.

## 🚀 Características Principales

### 🔐 Sistema de Autenticación
- Autenticación segura con middleware global
- Gestión de sesiones de usuario
- Control de acceso basado en roles
- Protección de rutas sensibles

### 📊 Dashboard y Estadísticas
- **Dashboard en tiempo real** con métricas de sesiones activas
- **Estadísticas de usuarios** con filtros por período
- **Monitoreo de actividad** con actualizaciones automáticas
- **Gráficos interactivos** usando Chart.js
- **Tablas de datos** con PrimeVue DataTable

### 🎨 Gestión de Contenido
- **Editor de páginas** con soporte para contenido rico
- **Gestión de imágenes** con editor integrado (Filerobot)
- **Sistema de colecciones** para organizar contenido
- **Editor de portada** con drag & drop
- **Gestión de metadatos** y SEO

### 💬 Sistema de Chat
- **Chat en tiempo real** para comunicación
- **Historial de conversaciones**
- **Gestión de mensajes** y sesiones

### 👥 Gestión de Usuarios
- **Panel de administración de usuarios**
- **Estadísticas por usuario**
- **Gestión de sesiones activas**
- **Control de acceso granular**

### 🎯 CRM y Gestión de Relaciones
- **Sistema CRM integrado**
- **Gestión de clientes y contactos**
- **Seguimiento de interacciones**

### 📱 Interfaz de Usuario
- **Diseño responsive** con Tailwind CSS
- **Temas personalizables** (Lara, Aura)
- **Componentes PrimeVue** para UI consistente
- **Modo oscuro/claro**
- **Iconografía PrimeIcons**

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Nuxt 4** - Framework Vue.js para aplicaciones universales
- **Vue 3** - Framework progresivo de JavaScript
- **TypeScript** - Superset de JavaScript con tipado estático
- **Tailwind CSS 4** - Framework CSS utility-first
- **PrimeVue 4** - Biblioteca de componentes Vue
- **PrimeIcons** - Iconografía moderna
- **PrimeFlex** - Sistema de flexbox utilities

### Backend y Servicios
- **Pinia** - Store de estado para Vue
- **Vue Router** - Router oficial de Vue
- **Axios** - Cliente HTTP para peticiones API
- **Chart.js** - Biblioteca de gráficos
- **Vue Chart.js** - Wrapper de Chart.js para Vue

### Herramientas de Desarrollo
- **Sass** - Preprocesador CSS
- **UnoCSS** - Framework CSS atómico
- **FormKit** - Framework de formularios
- **VueUse** - Colección de composables Vue
- **Nuxt Content** - Sistema de gestión de contenido

### Editores y Utilidades
- **Quill** - Editor de texto rico
- **Filerobot Image Editor** - Editor de imágenes
- **Markdown-it** - Parser de Markdown
- **Vue3 JSON Viewer** - Visualizador de JSON

## 📦 Instalación

### Prerrequisitos
- **Node.js** 18.x o superior
- **npm** o **yarn** o **pnpm**
- **Git**

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd enciclo-control-5
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
# o
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

4. **Configurar el archivo .env.local**
```env
# Configuración de la aplicación
APP_TITLE_ENV=Enciclo Control 5.0
NODE_ENV=development

# Configuración de la API
API_BASE_URL=http://localhost:3000/api
API_USERNAME=tu_usuario
API_SECRET=tu_secreto

# URLs de la aplicación
PAGE_BASE_URL=http://localhost:3000
EDITOR_BASE_URL=http://localhost:3000/editor
```

5. **Ejecutar en modo desarrollo**
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

## 🚀 Scripts Disponibles

```json
{
  "dev": "nuxi dev --host --dotenv .env.local",
  "dev:next": "nuxi dev --host --dotenv .env.next",
  "build": "nuxt build",
  "generate": "nuxi generate --dotenv .env.prod && rm -rf ../enciclo-v4/public/control && cp -rf .output/public ../enciclo-v4/public/control",
  "preview": "nuxt preview",
  "postinstall": "nuxt prepare"
}
```

## 📁 Estructura del Proyecto

```
enciclo-control-5/
├── app/
│   ├── assets/                 # Recursos estáticos
│   │   ├── css/               # Estilos CSS
│   │   ├── demo/              # Archivos de demostración
│   │   ├── layout/            # Estilos de layout
│   │   ├── sass/              # Archivos Sass
│   │   ├── styles.scss        # Estilos principales
│   │   └── tailwind.css       # Configuración de Tailwind
│   ├── components/            # Componentes Vue
│   │   ├── app/               # Componentes de aplicación
│   │   ├── content/           # Componentes de contenido
│   │   ├── tiptap/            # Componentes del editor
│   │   ├── AdvertiseBox.vue   # Componente de anuncios
│   │   ├── AppToast.vue       # Componente de notificaciones
│   │   ├── ChatViewer.vue     # Visor de chat
│   │   ├── ImagenSelect.vue   # Selector de imágenes
│   │   ├── PageInfo.vue       # Información de páginas
│   │   └── UserStatsComplete.vue # Estadísticas de usuarios
│   ├── composables/           # Composables Vue
│   │   ├── data.ts            # Composable de datos
│   │   ├── layout.ts          # Composable de layout
│   │   └── messages.ts        # Composable de mensajes
│   ├── content/               # Contenido estático
│   │   ├── component.md       # Documentación de componentes
│   │   ├── help.md            # Archivo de ayuda
│   │   └── markdown.md        # Ejemplos de Markdown
│   ├── layouts/               # Layouts de la aplicación
│   │   ├── AppFooter.vue      # Pie de página
│   │   ├── AppMenu.vue        # Menú principal
│   │   ├── AppMenuItem.vue    # Elementos del menú
│   │   └── composables/       # Composables de layout
│   ├── locale/                # Archivos de localización
│   │   └── es.json            # Traducciones en español
│   ├── middleware/            # Middleware de la aplicación
│   │   └── auth.global.ts     # Middleware de autenticación
│   ├── pages/                 # Páginas de la aplicación
│   │   ├── auth/              # Páginas de autenticación
│   │   ├── chat/              # Páginas de chat
│   │   ├── cms/               # Páginas del CMS
│   │   ├── crm/               # Páginas del CRM
│   │   ├── repositorio/       # Páginas del repositorio
│   │   ├── sessions/          # Páginas de sesiones
│   │   ├── stats/             # Páginas de estadísticas
│   │   ├── templates/         # Páginas de plantillas
│   │   ├── ui/                # Páginas de UI
│   │   ├── users/             # Páginas de usuarios
│   │   ├── utils/             # Páginas de utilidades
│   │   ├── 404.vue            # Página de error 404
│   │   ├── index.vue          # Página principal
│   │   ├── metas.vue          # Página de metadatos
│   │   ├── portada.vue        # Página de portada
│   │   └── test.vue           # Página de pruebas
│   ├── services/              # Servicios de la aplicación
│   │   ├── chatService.ts     # Servicio de chat
│   │   ├── crmService.ts      # Servicio de CRM
│   │   ├── entityService.ts   # Servicio de entidades
│   │   ├── mediaService.ts    # Servicio de medios
│   │   ├── messageService.ts  # Servicio de mensajes
│   │   ├── metaService.ts     # Servicio de metadatos
│   │   ├── pageService.ts     # Servicio de páginas
│   │   ├── processService.ts  # Servicio de procesos
│   │   ├── repositoryService.ts # Servicio de repositorio
│   │   ├── statsService.ts    # Servicio de estadísticas
│   │   ├── testService.ts     # Servicio de pruebas
│   │   └── userService.ts     # Servicio de usuarios
│   ├── stores/                # Stores de Pinia
│   │   ├── api.ts             # Store de API
│   │   ├── auth.ts            # Store de autenticación
│   │   ├── counter.ts         # Store de contador
│   │   ├── data.ts            # Store de datos
│   │   ├── page.ts            # Store de páginas
│   │   └── theme.ts           # Store de tema
│   ├── theme/                 # Configuración de temas
│   │   └── app-theme.ts       # Tema de la aplicación
│   ├── utils/                 # Utilidades
│   │   └── [archivos de utilidades]
│   ├── App.scss               # Estilos globales
│   └── app.vue                # Componente raíz
├── content.config.ts          # Configuración de contenido
├── event-bus.ts               # Bus de eventos
├── i18n/                      # Configuración de internacionalización
│   └── locales/
│       └── es.json            # Traducciones
├── nuxt.config.ts             # Configuración de Nuxt
├── package.json               # Dependencias del proyecto
├── public/                    # Archivos públicos
│   ├── flags/                 # Banderas de países
│   ├── layout/                # Archivos de layout
│   ├── themes/                # Temas
│   ├── favicon copy.ico       # Favicon
│   └── robots.txt             # Robots.txt
└── README.md                  # Este archivo
```

## 🔧 Configuración

### Configuración de Nuxt

El archivo `nuxt.config.ts` contiene la configuración principal:

```typescript
export default defineNuxtConfig({
  // Configuración de compatibilidad
  compatibilityDate: '2025-07-15',
  
  // Herramientas de desarrollo
  devtools: { enabled: true },
  
  // Modo SSR deshabilitado
  ssr: false,
  
  // Configuración de runtime
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
  
  // Módulos de Nuxt
  modules: [
    '@primevue/nuxt-module',
    '@formkit/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/content'
  ]
})
```

### Configuración de PrimeVue

```typescript
primevue: {
  importTheme: { from: '@/theme/app-theme.ts' },
  options: {
    ripple: true,
    inputVariant: 'filled'
  },
  autoImport: true
}
```

### Configuración de i18n

```typescript
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
]
```

## 🎨 Temas y Estilos

### Temas Disponibles
- **Lara** - Tema moderno y elegante
- **Aura** - Tema con enfoque en accesibilidad

### Configuración de Tailwind CSS
El proyecto utiliza Tailwind CSS 4 con configuración personalizada:

```css
@import "tailwindcss";

@theme {
  --color-primary: #3B82F6;
  --color-secondary: #64748B;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
}
```

## 🔌 Servicios

### Servicios Principales

#### StatsService
Gestiona estadísticas de usuarios y sesiones:
```typescript
class StatsService {
  async getActiveSessions() // Obtiene sesiones activas
  async getUserStats(params) // Obtiene estadísticas de usuario
}
```

#### PageService
Gestiona páginas y contenido:
```typescript
class PageService {
  async getCollections() // Obtiene colecciones
  async getDashboard(name) // Obtiene dashboard
  async getPageImages(collection, friendly) // Obtiene imágenes de página
}
```

#### UserService
Gestiona usuarios y autenticación:
```typescript
class UserService {
  async getUsers() // Obtiene lista de usuarios
  async getUserById(id) // Obtiene usuario por ID
}
```

## 📊 Componentes Principales

### UserStatsComplete
Componente para mostrar estadísticas completas de usuarios:
```vue
<UserStatsComplete 
  :value="stats" 
  :show-user="true" 
/>
```

### SimpleSessionsDataTable
Tabla de datos para sesiones:
```vue
<SimpleSessionsDataTable 
  :value="sessions" 
  :rows="5" 
  :show-user="true" 
  :show-end="true" 
/>
```

### ChatViewer
Visor de chat en tiempo real:
```vue
<ChatViewer 
  :messages="messages" 
  :loading="loading" 
/>
```

### ImagenSelect
Selector de imágenes con editor integrado:
```vue
<ImagenSelect 
  v-model="selectedImage" 
  :collection="collection" 
/>
```

## 🔐 Autenticación y Seguridad

### Middleware de Autenticación
```typescript
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // Verificación de autenticación
  const { $auth } = useNuxtApp();
  
  if (!to.meta.public && !$auth.isAuthenticated) {
    return navigateTo('/auth/login');
  }
});
```

### Store de Autenticación
```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),
  
  actions: {
    async login(credentials) {
      // Lógica de login
    },
    
    async logout() {
      // Lógica de logout
    }
  }
});
```

## 🌐 Internacionalización

### Configuración de Idiomas
- **Español (es)** - Idioma por defecto
- Soporte para múltiples idiomas
- Traducciones lazy-loaded

### Uso de Traducciones
```vue
<script setup>
const { t } = useI18n();
</script>

<template>
  <h1>{{ t('Título de la Página') }}</h1>
</template>
```

## 📱 Responsive Design

La aplicación está diseñada para ser completamente responsive:

- **Mobile First** - Diseño optimizado para móviles
- **Breakpoints** - Adaptación automática a diferentes tamaños
- **Grid System** - Sistema de grid flexible con Tailwind CSS
- **Touch Friendly** - Interfaz optimizada para dispositivos táctiles

## 🚀 Despliegue

### Despliegue en Producción

1. **Construir la aplicación**
```bash
npm run build
```

2. **Generar archivos estáticos**
```bash
npm run generate
```

3. **Configurar variables de entorno de producción**
```env
NODE_ENV=production
API_BASE_URL=https://api.tudominio.com
```

### Configuración de Servidor

#### Nginx
```nginx
server {
    listen 80;
    server_name tudominio.com;
    
    location / {
        root /var/www/enciclo-control-5/.output/public;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend-server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Apache
```apache
<VirtualHost *:80>
    ServerName tudominio.com
    DocumentRoot /var/www/enciclo-control-5/.output/public
    
    <Directory /var/www/enciclo-control-5/.output/public>
        AllowOverride All
        Require all granted
    </Directory>
    
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /index.html [QSA,L]
</VirtualHost>
```

## 🧪 Testing

### Ejecutar Tests
```bash
npm run test
```

### Tests Unitarios
```bash
npm run test:unit
```

### Tests de Integración
```bash
npm run test:integration
```

## 📈 Monitoreo y Analytics

### Métricas de Rendimiento
- **Core Web Vitals** - Monitoreo de métricas de rendimiento
- **Error Tracking** - Seguimiento de errores en producción
- **User Analytics** - Análisis de comportamiento de usuarios

### Logs y Debugging
```typescript
// Configuración de logs
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  }
};
```

## 🔄 CI/CD

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run generate
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /var/www/enciclo-control-5
            git pull origin main
            npm ci
            npm run build
            npm run generate
            sudo systemctl restart nginx
```

## 🤝 Contribución

### Guías de Contribución

1. **Fork del repositorio**
2. **Crear una rama para tu feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Hacer commits descriptivos**
   ```bash
   git commit -m "feat: añadir nueva funcionalidad de estadísticas"
   ```
4. **Push a la rama**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. **Crear un Pull Request**

### Convenciones de Código

#### Estructura de Commits
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bugs
- `docs:` - Documentación
- `style:` - Cambios de estilo
- `refactor:` - Refactorización
- `test:` - Tests
- `chore:` - Tareas de mantenimiento

#### Estructura de Archivos
- **PascalCase** para componentes Vue
- **camelCase** para archivos JavaScript/TypeScript
- **kebab-case** para archivos de configuración

## 📄 Licencia

Este proyecto es de licencia propietaria. Todos los derechos reservados.

## 👥 Equipo

- **Desarrollador Principal** - [Tu Nombre]
- **Diseñador UI/UX** - [Nombre del Diseñador]
- **DevOps** - [Nombre del DevOps]

## 📞 Soporte

### Contacto
- **Email:** soporte@enciclo.com
- **Documentación:** [URL de la documentación]
- **Issues:** [URL del repositorio de issues]

### Recursos Adicionales
- **Documentación de Nuxt:** https://nuxt.com/docs
- **Documentación de PrimeVue:** https://primevue.org/
- **Documentación de Tailwind CSS:** https://tailwindcss.com/docs

## 🔄 Changelog

### v5.0.0 (2024-01-XX)
- ✨ Migración a Nuxt 4
- ✨ Actualización a PrimeVue 4
- ✨ Integración de Tailwind CSS 4
- ✨ Nuevo sistema de temas
- ✨ Mejoras en el dashboard
- ✨ Nuevo editor de imágenes
- 🐛 Correcciones de bugs menores

### v4.x.x (Versiones anteriores)
- Historial de versiones anteriores...

---

**Enciclo Control 5.0** - Sistema de gestión integral para plataformas educativas
