import { ref, onMounted } from 'vue';
import { FilterMatchMode, FilterOperator } from '~/utils/primevue';
import type { ApiResponse } from '~/interfaces/ApiResponse';

/**
 * Configuración de filtros iniciales
 */
export interface InitialFilters {
  global?: { value: null | string; matchMode: string };
  user?: { value: null | string; matchMode: string } | { operator: string; constraints: Array<{ value: null | string; matchMode: string }> };
  [key: string]: any;
}

/**
 * Opciones para el composable useStatsDataTable
 */
export interface UseStatsDataTableOptions {
  /** Función que carga los datos desde el servicio */
  loadFunction: (data: any) => Promise<ApiResponse<any>>;
  /** Función que exporta los datos */
  exportFunction: (data: any) => Promise<ApiResponse<any>>;
  /** Mensaje para la exportación */
  exportMessage?: string;
  /** Campos para el filtro global */
  globalFilterFields?: string[];
  /** Filtros iniciales personalizados */
  initialFilters?: InitialFilters;
  /** Filas por defecto */
  defaultRows?: number;
}

/**
 * Composable unificado para páginas de estadísticas con DataTable lazy
 * Integra usePrimeDataTable, useUtilsData y la lógica común de carga/exportación
 */
export function useStatsDataTable(options: UseStatsDataTableOptions) {
  const { t } = useI18n();
  const primeDataTable = usePrimeDataTable() as { filters: any };
  const filters = primeDataTable.filters;
  const { getParamsData, lazyParams, exportDataGeneric, resetLazyParams } = useUtilsData();

  const {
    loadFunction,
    exportFunction,
    exportMessage = t('Exportando datos'),
    globalFilterFields = ['user'],
    initialFilters,
    defaultRows = 25
  } = options;

  // Estado reactivo
  const loading = ref(true);
  const stats = ref<any[]>([]);
  const dt = ref();
  const totalRecords = ref(0);

  // Inicializar filtros
  const initFilters = () => {
    if (initialFilters) {
      filters.value = { ...initialFilters };
    } else {
      filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        user: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
      };
    }
  };

  // Inicializar filtros inmediatamente para que estén disponibles en el template
  initFilters();

  // Limpiar filtros
  const clearFilter = () => {
    initFilters();
    lazyParams.value.filters = filters.value;
    loadData();
  };

  // Cargar datos
  const loadData = async () => {
    loading.value = true;
    const data = getParamsData(lazyParams.value);
    const response = await loadFunction(data);
    
    if (checkLogged(response)) {
      stats.value = response?.data?.value?.list || [];
      totalRecords.value = response?.data?.value?.total || 0;
    }
    loading.value = false;
  };

  // Exportar datos
  const exportData = async () => {
    await exportDataGeneric(exportMessage, exportFunction);
  };

  // Handlers de eventos del DataTable
  const onPage = (event: any) => {
    lazyParams.value = event;
    loadData();
  };

  const onSort = (event: any) => {
    lazyParams.value = event;
    loadData();
  };

  const onFilter = (event: any) => {
    lazyParams.value.filters = filters.value;
    loadData();
  };

  // Props estándar para DataTable
  const getDataTableProps = () => ({
    ref: dt,
    'v-model:filters': filters,
    value: stats,
    paginator: true,
    rows: defaultRows,
    lazy: true,
    'total-records': totalRecords,
    'filter-display': 'menu' as const,
    'paginator-template': 'CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
    'paginator-position': 'both' as const,
    'rows-per-page-options': [25, 50, 100],
    'responsive-layout': 'scroll' as const,
    'data-key': 'id',
    'striped-rows': true,
    'sort-mode': 'multiple' as const,
    'show-gridlines': true,
    loading: loading.value,
    'global-filter-fields': globalFilterFields,
    'current-page-report-template': t('show-per-page'),
    class: 'p-datatable-sm',
    '@page': onPage,
    '@sort': onSort,
    '@filter': onFilter
  });

  // Inicialización
  onMounted(() => {
    initFilters();
    resetLazyParams(defaultRows, filters.value);
    loadData();
  });

  return {
    // Estado
    loading,
    stats,
    dt,
    totalRecords,
    filters,
    
    // Funciones
    loadData,
    exportData,
    clearFilter,
    initFilters,
    
    // Handlers
    onPage,
    onSort,
    onFilter,
    
    // Props
    getDataTableProps
  };
}

