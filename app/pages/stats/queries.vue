<script setup lang="ts">
import { FilterMatchMode } from '~/utils/primevue';
import StatsService from '~/services/statsService';
import { useStatsDataTable } from '~/composables/useStatsDataTable';
import type { ApiResponse } from '~/interfaces/ApiResponse';

const { t } = useI18n();
const statsService = new StatsService();

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
  loadFunction: (data: any) => statsService.getQueries(data) as Promise<ApiResponse<any>>,
  exportFunction: (data: any) => statsService.exportQueries(data) as Promise<ApiResponse<any>>,
  exportMessage: t('Exportando datos consultas'),
  globalFilterFields: ['user', 'term', 'collections'],
  initialFilters: {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    user: { value: null, matchMode: FilterMatchMode.CONTAINS }
  }
});
</script>

<template>
  <div class="min-h-screen p-4" style="background-color: var(--surface-ground);">
    <!-- Header mejorado -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold mb-2" style="color: var(--text-color);">
          <i class="pi pi-search mr-2 text-blue-500"></i>
          {{ t('Consultas') }}</h2>
        <p class="text-sm" style="color: var(--text-color-secondary);">{{ t('Historial de búsquedas y consultas realizadas por los usuarios') }}</p>
      </div>
      <div class="flex gap-2">
        <Button
          icon="pi pi-refresh"
          :label="t('Refrescar')"
          class="p-button-outlined p-button-secondary"
          @click="loadData()"
        />
        <Button 
          icon="pi pi-file-excel" 
          :label="t('Exportar')"
          class="p-button-success" 
          @click="exportData()" 
        />
      </div>
    </div>

    <!-- Tabla mejorada -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <DataTable
        ref="dt"
        v-model:filters="filters"
        :value="stats"
        :paginator="true"
        :rows="25"
        :lazy="true"
        :total-records="totalRecords"
        filter-display="menu"
        paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        paginatorPosition="both"
        :rows-per-page-options="[25, 50, 100]"
        responsive-layout="scroll"
        data-key="id"
        striped-rows
        sort-mode="multiple"
        show-gridlines
        :loading="loading"
        :global-filter-fields="['user', 'term', 'collections']"
        :current-page-report-template="t('show-per-page')"
        class="p-datatable-sm"
        @page="onPage($event)"
        @sort="onSort($event)"
        @filter="onFilter($event)"
      >
        <!-- Header de la tabla -->
        <template #header>
          <div class="flex flex-wrap justify-between items-center gap-4 p-4 border-b surface-card border-surface">
            <div class="flex items-center gap-2">
              <i class="pi pi-table text-blue-500"></i>
              <span class="font-semibold text-primary">{{ t('Lista de Consultas') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-secondary">{{ formatIntNumber(totalRecords) }} {{ t('registros') }}</span>
            </div>
          </div>
        </template>

        <!-- Estados de carga y vacío -->
        <template #empty>
          <div class="text-center py-8">
            <i class="pi pi-search text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 text-lg">{{ t('No se han encontrado datos.') }}</p>
          </div>
        </template>
        
        <template #loading>
          <div class="text-center py-8">
            <i class="pi pi-spin pi-spinner text-2xl text-blue-500 mb-2"></i>
            <p class="text-gray-600">{{ t('Cargando datos...') }}</p>
          </div>
        </template>

        <!-- Usuario -->
        <Column field="user" :header="t('Usuario')" :sortable="true" style="min-width: 120px">
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              v-tooltip.top.focus="t('Pulsa ENTER para aplicar')"
              type="text"
              class="p-column-filter"
              :placeholder="t('busqueda-nombre')"
              @keydown.enter="filterCallback()"
            />
          </template>
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <i class="pi pi-user text-gray-400"></i>
              <NuxtLink 
                :to="'/users/'+slotProps.data.user" 
                class="text-blue-600 hover:text-blue-800 font-medium no-underline hover:underline"
              >
                {{ slotProps.data.user }}
              </NuxtLink>
            </div>
          </template>
        </Column>

        <!-- Término de búsqueda -->
        <Column field="term" :header="t('Término')" :sortable="true" style="min-width: 200px">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <i class="pi pi-search text-gray-400"></i>
              <span class="font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded text-sm">
                {{ slotProps.data.term }}
              </span>
            </div>
          </template>
        </Column>

        <!-- Colección -->
        <Column field="collections" :header="t('Colección')" :sortable="true" style="min-width: 120px">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <i class="pi pi-folder text-yellow-500"></i>
              <span class="text-sm text-yellow-600 font-medium">{{ slotProps.data.collections }}</span>
            </div>
          </template>
        </Column>

        <!-- Fecha -->
        <Column field="date" :header="t('Fecha')" :sortable="true" style="min-width: 150px">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <i class="pi pi-calendar text-gray-400"></i>
              <span class="text-sm text-gray-700">{{ formatDateTime(slotProps.data.date) }}</span>
            </div>
          </template>
        </Column>

        <!-- Configuración de búsqueda -->
        <Column :header="t('Configuración')" :sortable="false" style="min-width: 200px">
          <template #body="slotProps">
            <div class="space-y-1">
              <div v-if="slotProps.data.filter" class="flex items-center gap-2">
                <i class="pi pi-filter text-blue-400"></i>
                <Tag severity="info" class="text-xs">{{ slotProps.data.filter }}</Tag>
              </div>
              <div v-if="slotProps.data.order" class="flex items-center gap-2">
                <i class="pi pi-sort text-red-400"></i>
                <Tag severity="danger" class="text-xs">{{ slotProps.data.order }}</Tag>
              </div>
            </div>
          </template>
        </Column>

        <!-- Rango de resultados -->
        <Column :header="t('Rango')" :sortable="false" style="min-width: 120px">
          <template #body="slotProps">
            <div class="text-center">
              <div class="flex items-center justify-center gap-1 text-sm">
                <span class="text-gray-600">{{ formatIntNumber(slotProps.data.from) }}</span>
                <i class="pi pi-arrow-right text-gray-400"></i>
                <span class="text-gray-600">{{ formatIntNumber(slotProps.data.to) }}</span>
              </div>
            </div>
          </template>
        </Column>

        <!-- Total de resultados -->
        <Column field="total" :header="t('Total')" :sortable="true" style="min-width: 100px">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <i class="pi pi-chart-bar text-green-500"></i>
              <span class="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                {{ formatIntNumber(slotProps.data.total) }}
              </span>
            </div>
          </template>
        </Column>

        <!-- Estado de caché -->
        <Column field="cached" :header="t('Cache')" :sortable="true" style="min-width: 80px">
          <template #body="slotProps">
            <div class="flex justify-center">
              <i
                v-if="slotProps.data.cached"
                class="pi pi-check-circle text-green-500 text-lg"
                v-tooltip.top="t('Resultado en caché')"
              />
              <i
                v-else
                class="pi pi-times-circle text-gray-400 text-lg"
                v-tooltip.top="t('No en caché')"
              />
            </div>
          </template>
        </Column>

        <!-- Ubicación -->
        <Column :header="t('Ubicación')" :sortable="false" style="min-width: 150px">
          <template #body="slotProps">
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-sm">
                <i class="pi pi-map-marker text-red-500"></i>
                <span class="text-gray-700">{{ slotProps.data.glc_country_name }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <i class="pi pi-building text-gray-400"></i>
                <span>{{ slotProps.data.glc_city }}</span>
              </div>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
