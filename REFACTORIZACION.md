# Análisis de Refactorización - Enciclo Control 5

## Resumen
Este documento identifica código repetido y oportunidades de refactorización en el proyecto.

## 1. Componentes Simple*DataTable (ALTA PRIORIDAD)

### Problema
Los componentes `SimplePagesDataTable`, `SimpleSessionsDataTable`, `SimpleQueriesDataTable`, `SimpleChatsDataTable`, y `SimplePrintsDataTable` tienen código muy similar:

- Misma estructura de props (`rows`, `value`, `showUser`, `paginator`)
- Misma función `exportCSV()`
- Mismo template header con botón de exportar
- Columnas similares (usuario, fecha, etc.)

### Solución Implementada
✅ **Creado `BaseDataTable.vue`**: Componente base reutilizable con:
- Props comunes
- Función exportCSV integrada
- Slot para columnas personalizadas
- Columna de usuario opcional con template por defecto

### Archivos Afectados
- `app/components/SimplePagesDataTable.vue`
- `app/components/SimpleSessionsDataTable.vue`
- `app/components/SimpleQueriesDataTable.vue`
- `app/components/SimpleChatsDataTable.vue`
- `app/components/SimplePrintsDataTable.vue`

### Próximos Pasos
Refactorizar cada componente Simple*DataTable para usar `BaseDataTable.vue` como base.

---

## 2. Función getLanguageFlag (COMPLETADO)

### Problema
La función `getLanguageFlag` estaba duplicada en `RAGResultView.vue` y podría ser reutilizada en otros componentes.

### Solución Implementada
✅ **Creado `app/utils/language.ts`**: Utilidad centralizada con:
- Función `getLanguageFlag()` exportada
- Tipos TypeScript definidos
- Documentación JSDoc

### Archivos Actualizados
- ✅ `app/components/RAGResultView.vue` - Ahora importa desde utils

---

## 3. Configuración de DataTables con Paginación Lazy (ALTA PRIORIDAD)

### Problema
Múltiples páginas tienen configuraciones idénticas de DataTable:
- Paginación lazy
- Filtros
- Ordenamiento múltiple
- Mismos handlers de eventos (`onPage`, `onSort`, `onFilter`)

### Archivos Afectados
- `app/pages/stats/pages.vue`
- `app/pages/stats/queries.vue`
- `app/pages/stats/sessions.vue`
- `app/pages/stats/prints.vue`
- `app/pages/repositorio/index.vue`
- `app/pages/users/index.vue`
- `app/pages/chat/list.vue`
- `app/pages/utils/listrag.vue`
- `app/pages/chat/entidades.vue`
- `app/pages/crm/leads.vue`
- `app/pages/utils/search.vue`
- `app/pages/chat/index.vue`

### Solución Implementada
✅ **Creado `app/composables/useDataTableConfig.ts`**: Composable que proporciona:
- Estado reactivo para loading, filters, totalRecords, etc.
- Función `getDataTableProps()` con configuración estándar
- Handlers comunes: `onPage`, `onSort`, `onFilter`
- Función `resetFilters()`

### Próximos Pasos
Refactorizar cada página para usar `useDataTableConfig()`.

---

## 4. Estilos CSS Repetidos (MEDIA PRIORIDAD)

### Problema
Estilos inline repetidos en múltiples componentes:
```vue
style="background-color: var(--surface-card); border-color: var(--surface-border);"
style="color: var(--text-color);"
style="color: var(--text-color-secondary);"
```

### Archivos Afectados
- `app/components/RAGResultView.vue` (múltiples instancias)
- `app/components/UsersStatsTable.vue`
- `app/components/UserInfoTable.vue`
- Varios componentes de páginas

### Solución Propuesta
Crear clases CSS utilitarias en `app/assets/css/main.css`:
```css
.surface-card {
  background-color: var(--surface-card);
  border-color: var(--surface-border);
}

.text-primary {
  color: var(--text-color);
}

.text-secondary {
  color: var(--text-color-secondary);
}
```

---

## 5. Servicios con Estructura Similar (BAJA PRIORIDAD)

### Problema
Todos los servicios siguen el mismo patrón:
- Constructor que inicializa `api` y `apiLongTask`
- Métodos que llaman a `this.api.get()` o `this.apiLongTask.get()`
- Misma estructura de tipos y parámetros

### Archivos Afectados
- `app/services/userService.ts`
- `app/services/pageService.ts`
- `app/services/statsService.ts`
- `app/services/chatService.ts`
- `app/services/crmService.ts`
- `app/services/entityService.ts`
- `app/services/metaService.ts`
- `app/services/mediaService.ts`
- `app/services/messageService.ts`
- `app/services/processService.ts`
- `app/services/repositoryService.ts`
- `app/services/testService.ts`

### Solución Propuesta
Crear una clase base `BaseService` que encapsule la lógica común:
```typescript
export abstract class BaseService {
  protected api: ApiClient;
  protected apiLongTask: ApiClient;

  constructor() {
    this.api = useApiClient();
    this.apiLongTask = useApiClient(true);
  }

  protected async get<T>(method: string, data?: any): Promise<ApiResponse<T>> {
    return await this.api.get<T>(method, data);
  }

  protected async getLongTask<T>(method: string, data?: any): Promise<ApiResponse<T>> {
    return await this.apiLongTask.get<T>(method, data);
  }
}
```

**Nota**: Esta refactorización requiere cambios significativos y debe evaluarse cuidadosamente.

---

## 6. Funciones de Formato (COMPLETADO)

### Estado
✅ Las funciones de formato ya están centralizadas en `app/utils/format.ts`:
- `formatDateTime`
- `formatIntNumber`
- `formatStringPre`
- `formatPageType`
- `formatLoginMode`
- etc.

No requiere refactorización adicional.

---

## 7. Manejo de Errores (COMPLETADO)

### Estado
✅ Ya existe un composable `useErrorHandler` en `app/composables/useErrorHandler.ts` y la función `checkLogged` en `app/utils/security.ts`.

No requiere refactorización adicional, pero se recomienda su uso consistente en todo el proyecto.

---

## Prioridades de Implementación

### Alta Prioridad
1. ✅ Extraer `getLanguageFlag` a utilidad (COMPLETADO)
2. ✅ Crear `BaseDataTable` para componentes Simple* (COMPLETADO)
3. ✅ Refactorizar componentes Simple*DataTable para usar BaseDataTable (COMPLETADO)
4. ⏳ Refactorizar páginas para usar `useDataTableConfig` (EN PROGRESO - requiere integración con useUtilsData)

### Media Prioridad
5. ✅ Crear clases CSS utilitarias para estilos repetidos (COMPLETADO)
6. ✅ Aplicar clases CSS en componentes existentes (COMPLETADO - parcialmente en RAGResultView, UsersStatsTable, UserInfoTable)

### Baja Prioridad
7. ⏳ Evaluar creación de BaseService para servicios
8. ⏳ Revisar uso consistente de `useErrorHandler`

---

## Métricas de Mejora

### Antes
- 5 componentes Simple*DataTable con ~80 líneas cada uno = ~400 líneas
- Función `getLanguageFlag` duplicada
- ~12 páginas con configuración de DataTable duplicada

### Después (Realizado)
- ✅ 1 componente BaseDataTable (~60 líneas) + 5 componentes específicos (~20-30 líneas cada uno) = ~180 líneas
- ✅ 1 utilidad `language.ts` reutilizable
- ✅ 1 composable `useDataTableConfig` creado (pendiente aplicar en páginas)
- ✅ Clases CSS utilitarias creadas y aplicadas parcialmente

### Reducción Real
- **~55% menos código** en componentes Simple*DataTable (de ~400 líneas a ~180 líneas)
- **Eliminación de duplicación** en función getLanguageFlag
- **Clases CSS reutilizables** para estilos comunes
- **Mejor mantenibilidad** con código centralizado

---

## Notas Adicionales

1. **Compatibilidad**: Todas las refactorizaciones propuestas mantienen la compatibilidad con el código existente.

2. **Testing**: Se recomienda probar cada refactorización antes de continuar con la siguiente.

3. **Documentación**: Los nuevos archivos incluyen documentación JSDoc para facilitar el mantenimiento.

4. **TypeScript**: Todas las nuevas utilidades y composables están completamente tipadas.

