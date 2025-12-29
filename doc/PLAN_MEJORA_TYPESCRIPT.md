# Plan de Mejora TypeScript y Vue 3 - 3 Etapas

## ETAPA ALTA: Tipado Estricto y Respuestas API (Crítico)

### Objetivo
Eliminar uso de `any`, tipar completamente las respuestas de API y crear interfaces compartidas.

### Tareas

#### 1.1 Crear interfaces base para respuestas API
- **Archivo**: `app/interfaces/ApiResponse.ts`
- Crear interfaces genéricas:
  - `ApiResponse<T>` para respuestas exitosas
  - `ApiError` para errores
  - `ApiClient` para tipar el cliente API
  - `ApiRequestParams` para parámetros comunes

#### 1.2 Tipar el cliente API
- **Archivo**: `app/stores/api.ts`
- Reemplazar `Record<string, any>` con tipos específicos
- Tipar función `get()` como genérica: `get<T>(method: string, ...): Promise<ApiResponse<T>>`
- Tipar función `post()` si existe
- Eliminar `as Record<string, any>` en líneas 53 y 61

#### 1.3 Crear interfaces para servicios
- **Archivos**: `app/interfaces/services/`
- Crear interfaces para cada servicio:
  - `UserServiceParams.ts` - Parámetros de métodos de UserService
  - `PageServiceParams.ts` - Parámetros de PageService
  - `StatsServiceParams.ts` - Parámetros de StatsService
  - Similar para otros servicios

#### 1.4 Tipar todos los servicios
- **Archivos**: Todos los archivos en `app/services/`
- Reemplazar `api: any` con `api: ApiClient`
- Tipar todos los métodos con interfaces específicas
- Ejemplo en `userService.ts`:
  - `getUsers(data: GetUsersParams): Promise<ApiResponse<User[]>>`
  - `add(id: number | null, data: CreateUserData): Promise<ApiResponse<User>>`

#### 1.5 Eliminar @ts-ignore justificados
- **Archivos**: `nuxt.config.ts`, `vue-i18n.options.ts`
- Crear tipos apropiados o usar `@ts-expect-error` con comentarios explicativos
- Si es necesario, crear archivos de declaración de tipos para módulos de terceros

### Archivos afectados
- `app/stores/api.ts`
- `app/services/*.ts` (12 archivos)
- `app/interfaces/ApiResponse.ts` (nuevo)
- `app/interfaces/services/*.ts` (nuevos)
- `nuxt.config.ts`
- `vue-i18n.options.ts`

---

## ETAPA MEDIA: Manejo de Errores y Tipado de Componentes (Importante)

### Objetivo
Mejorar consistencia en manejo de errores, tipar parámetros de componentes y reemplazar console.log.

### Tareas

#### 2.1 Crear composable de manejo de errores
- **Archivo**: `app/composables/useErrorHandler.ts` (nuevo)
- Crear función `handleApiError()` que unifique el manejo
- Integrar con `useMessages()` para mostrar errores al usuario
- Tipar todos los errores con `ApiError`

#### 2.2 Actualizar servicios con manejo de errores
- **Archivos**: Todos los archivos en `app/services/`
- Usar `useErrorHandler()` en métodos que requieran manejo de errores
- Mantener compatibilidad con `checkLogged()` existente

#### 2.3 Tipar parámetros de funciones en componentes
- **Archivos**: Componentes con funciones sin tipar
- `app/components/DocumentUploader.vue`:
  - Tipar `onRemoveTemplatingFile(file, removeFileCallback, index)`
  - Tipar `onSelectedFiles(event)`
  - Crear interfaces `FileUploadEvent`, `RemoveFileCallback`
- `app/components/ImagenSelect.vue`: Tipar funciones similares
- Otros componentes con parámetros `any`

#### 2.4 Reemplazar console.log con logger
- **Archivo**: `app/utils/logger.ts` (nuevo)
- Crear wrapper alrededor de `consola` con niveles (debug, info, warn, error)
- Configurar para deshabilitar logs en producción
- **Archivos a actualizar**: Buscar y reemplazar `console.log` (68 ocurrencias)
- Priorizar archivos de servicios y componentes críticos

#### 2.5 Mejorar tipado en stores
- **Archivo**: `app/stores/auth.ts`
- Reemplazar `any` en línea 22 con tipo específico de `useFetch`
- Crear interface `LoginResponse` para tipar respuesta de login
- Tipar `auth_error` con `string | null` explícito

### Archivos afectados
- `app/composables/useErrorHandler.ts` (nuevo)
- `app/utils/logger.ts` (nuevo)
- `app/services/*.ts` (12 archivos)
- `app/components/DocumentUploader.vue`
- `app/components/ImagenSelect.vue`
- `app/stores/auth.ts`
- Archivos con `console.log` (29 archivos)

---

## ETAPA BAJA: Limpieza y Mejoras Menores (Opcional)

### Objetivo
Eliminar código muerto, mejorar mantenibilidad y agregar validación opcional.

### Tareas

#### 3.1 Eliminar código comentado
- **Archivos**: 
  - `app/stores/api.ts` (líneas 1, 11, 13-14)
  - `app/stores/auth.ts` (línea 8)
  - Otros archivos con comentarios de código muerto
- Revisar y eliminar código comentado innecesario
- Mantener solo comentarios de documentación útiles

#### 3.2 Extraer constantes mágicas
- **Archivo**: `app/utils/constants.ts` (nuevo)
- Extraer valores hardcodeados:
  - `MAX_FILE_SIZE` desde `DocumentUploader.vue`
  - Timeouts de API desde `ConfigApiCall`
  - Valores de configuración repetidos
- Usar constantes tipadas con `as const`

#### 3.3 Agregar validación opcional con Zod
- **Archivo**: `app/utils/validation.ts` (nuevo, opcional)
- Crear schemas Zod para validación de datos críticos:
  - `UserPayloadSchema` para login
  - `CreateUserSchema` para creación de usuarios
  - Validar antes de enviar a API
- Integrar con `useErrorHandler` para mostrar errores de validación

#### 3.4 Mejorar documentación con JSDoc
- **Archivos**: Interfaces y funciones públicas
- Agregar JSDoc a:
  - Interfaces en `app/interfaces/`
  - Métodos públicos de servicios
  - Composables exportados
- Incluir ejemplos de uso donde sea relevante

#### 3.5 Configurar ESLint estricto (opcional)
- **Archivo**: `.eslintrc.js` o configuración en `nuxt.config.ts`
- Habilitar reglas TypeScript estrictas:
  - `@typescript-eslint/no-explicit-any`
  - `@typescript-eslint/no-unsafe-assignment`
  - `@typescript-eslint/no-unsafe-call`
- Configurar gradualmente para no romper código existente

### Archivos afectados
- `app/utils/constants.ts` (nuevo)
- `app/utils/validation.ts` (nuevo, opcional)
- `app/stores/api.ts`
- `app/stores/auth.ts`
- `app/components/DocumentUploader.vue`
- Archivos con código comentado

---

## Métricas de Éxito

### Etapa Alta
- 0 ocurrencias de `api: any` en servicios
- 0 ocurrencias de `Record<string, any>` en respuestas API
- Todos los servicios con tipos específicos
- 0 `@ts-ignore` sin justificación

### Etapa Media
- Manejo de errores unificado en todos los servicios
- 0 `console.log` en código de producción
- Parámetros de funciones tipados en componentes críticos

### Etapa Baja
- Código comentado eliminado
- Constantes extraídas y documentadas
- Validación implementada en puntos críticos

## Orden de Implementación Recomendado

1. **Etapa Alta** → Crítica para seguridad de tipos
2. **Etapa Media** → Mejora experiencia de desarrollo y usuario
3. **Etapa Baja** → Mejoras incrementales y mantenibilidad

## Notas de Implementación

- Cada etapa puede implementarse de forma independiente
- Se recomienda hacer commits incrementales por tarea
- Probar cada cambio antes de continuar con la siguiente tarea
- Mantener compatibilidad con código existente durante la transición

