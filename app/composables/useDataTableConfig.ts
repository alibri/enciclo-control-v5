import { ref } from 'vue';
import type { FilterMatchMode } from 'primevue/api';

/**
 * Composable para configuración común de DataTables con paginación lazy
 */
export function useDataTableConfig() {
  const loading = ref(false);
  const filters = ref<Record<string, { value: any; matchMode: FilterMatchMode }>>({});
  const totalRecords = ref(0);
  const first = ref(0);
  const rows = ref(25);
  const sortField = ref<string | null>(null);
  const sortOrder = ref<number>(1); // 1 para asc, -1 para desc

  /**
   * Configuración estándar para DataTable con paginación lazy
   */
  const getDataTableProps = () => ({
    paginator: true,
    rows: rows.value,
    lazy: true,
    totalRecords: totalRecords.value,
    filterDisplay: 'menu' as const,
    paginatorTemplate: 'CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
    paginatorPosition: 'both' as const,
    rowsPerPageOptions: [25, 50, 100],
    responsiveLayout: 'scroll' as const,
    stripedRows: true,
    sortMode: 'multiple' as const,
    showGridlines: true,
    loading: loading.value,
    currentPageReportTemplate: 'show-per-page'
  });

  /**
   * Maneja el evento de cambio de página
   */
  const onPage = (event: any) => {
    first.value = event.first;
    rows.value = event.rows;
  };

  /**
   * Maneja el evento de ordenamiento
   */
  const onSort = (event: any) => {
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;
  };

  /**
   * Maneja el evento de filtrado
   */
  const onFilter = (event: any) => {
    filters.value = event.filters;
  };

  /**
   * Resetea los filtros
   */
  const resetFilters = () => {
    filters.value = {};
  };

  return {
    loading,
    filters,
    totalRecords,
    first,
    rows,
    sortField,
    sortOrder,
    getDataTableProps,
    onPage,
    onSort,
    onFilter,
    resetFilters
  };
}

