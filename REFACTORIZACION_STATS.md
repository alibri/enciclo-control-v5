# Refactorización de Páginas Stats - Completada

## Resumen
Se ha creado un composable unificado `useStatsDataTable` que integra toda la lógica común de las páginas de estadísticas, eliminando ~70% del código duplicado.

## Composable Creado

### `app/composables/useStatsDataTable.ts`
Composable que integra:
- `usePrimeDataTable` - Para gestión de filtros
- `useUtilsData` - Para lazyParams, getParamsData, exportDataGeneric
- Lógica común de carga, exportación y eventos del DataTable

**Características:**
- ✅ Gestión automática de estado (loading, stats, totalRecords)
- ✅ Inicialización de filtros personalizables
- ✅ Handlers de eventos (onPage, onSort, onFilter)
- ✅ Funciones de carga y exportación
- ✅ Configuración estándar del DataTable

## Páginas Refactorizadas

### ✅ `app/pages/stats/pages.vue`
**Antes**: ~74 líneas de script
**Después**: ~25 líneas de script
**Reducción**: ~66%

### ✅ `app/pages/stats/queries.vue`
**Antes**: ~73 líneas de script
**Después**: ~25 líneas de script
**Reducción**: ~66%

### ✅ `app/pages/stats/sessions.vue`
**Antes**: ~74 líneas de script
**Después**: ~30 líneas de script (filtros más complejos)
**Reducción**: ~59%

### ✅ `app/pages/stats/prints.vue`
**Antes**: ~76 líneas de script
**Después**: ~25 líneas de script
**Reducción**: ~67%

## Beneficios

1. **Código más limpio**: Cada página ahora solo define su configuración específica
2. **Mantenibilidad**: Cambios en la lógica común se hacen en un solo lugar
3. **Consistencia**: Todas las páginas usan la misma lógica y comportamiento
4. **Tipado**: Completamente tipado con TypeScript
5. **Flexibilidad**: Permite personalización de filtros y configuración por página

## Ejemplo de Uso

```typescript
const {
  loading,
  stats,
  dt,
  totalRecords,
  filters,
  loadData,
  exportData,
  clearFilter,
  onPage,
  onSort,
  onFilter
} = useStatsDataTable({
  loadFunction: (data: any) => statsService.getPages(data),
  exportFunction: (data: any) => statsService.exportPages(data),
  exportMessage: t('Exportando datos páginas'),
  globalFilterFields: ['user', 'title', 'collection'],
  initialFilters: {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    user: { value: null, matchMode: FilterMatchMode.CONTAINS }
  }
});
```

## Métricas Totales

- **Líneas de código eliminadas**: ~200 líneas
- **Reducción promedio**: ~64% por página
- **Archivos afectados**: 4 páginas + 1 composable nuevo
- **Tiempo de mantenimiento**: Reducido significativamente

## Próximos Pasos (Opcional)

1. Aplicar el mismo patrón a otras páginas con DataTables similares:
   - `app/pages/chat/list.vue`
   - `app/pages/repositorio/index.vue`
   - `app/pages/users/index.vue`
   - `app/pages/utils/listrag.vue`

2. Crear variantes del composable para casos específicos si es necesario

