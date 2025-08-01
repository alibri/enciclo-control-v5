import { consola } from 'consola';

interface SortField {
    field: string;
    order: number;
}

const lazyParams = ref({
  first: 0,
  rows: 0,
  sortField: null,
  sortOrder: null,
  page: 0,
  multiSortMeta: [],
  filters: {}
});

export function useUtilsData () {
  const { showMessage, removeGroup } = useMessages();
  const { t } = useI18n();

  const getParamsData = (localLazyParams?: typeof lazyParams.value) => {
    // consola.log('getParamsData localLazyParams', localLazyParams);
    localLazyParams = localLazyParams ?? lazyParams.value;
    let sort: string|null = null;
    if (localLazyParams?.multiSortMeta.length > 0) {
      const s: SortField = localLazyParams.multiSortMeta[0] as SortField;
      sort = s.field;
      sort += ' ' + (s.order === 1 ? 'asc' : 'desc');
    }
    const data = {
      page: localLazyParams?.page + 1,
      items: localLazyParams?.rows,
      filter: localLazyParams?.filters,
      order: sort
    };
    return data;
  };

  const resetLazyParams = (rows: number, filters: any) => {
    lazyParams.value = {
      first: 0,
      rows,
      multiSortMeta: [],
      sortField: null,
      sortOrder: null,
      page: 0,
      filters
    };
  };

  const exportDataGeneric = async (title: string, callback: (data: any) => Promise<any>) => {
    showMessage('info', t('Exportar'), title, -1, 'bc');

    const data = getParamsData();
    const response = await callback(data);

    if (checkLogged(response)) {
      if (response?.data?.value?.success) {
        consola.log(response?.data?.value);
        const fileLink = document.createElement('a');
        const fileName = response?.data?.value?.url.split('/').pop();
        fileLink.href = response?.data?.value?.url;
        fileLink.setAttribute('download', fileName);
        document.body.appendChild(fileLink);
        fileLink.click();
        showMessage('success', t('Exportar'), t('Fichero generado') + ' ' + fileLink.href, 5000);
      } else {
        showMessage('error', t('Error'), response?.data?.value?.message, 5000);
      }
      removeGroup('bc');
    }
  };

  return {
    getParamsData,
    exportDataGeneric,
    resetLazyParams,
    lazyParams
  };
}