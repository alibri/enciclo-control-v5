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
  loadFunction: (data: any) => statsService.getPrints(data) as Promise<ApiResponse<any>>,
  exportFunction: (data: any) => statsService.exportPrints(data) as Promise<ApiResponse<any>>,
  exportMessage: t('Exportando datos impresiones'),
  globalFilterFields: ['user', 'title', 'collection'],
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
          <i class="pi pi-print mr-2 text-blue-500"></i>
          {{ t('Impresiones') }}</h2>
        <p class="text-sm" style="color: var(--text-color-secondary);">{{ t('Registro de páginas impresas por los usuarios') }}</p>
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
    <div class="rounded-lg shadow-sm border surface-card border-surface">
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
        :global-filter-fields="['user', 'title', 'collection']"
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
              <span class="font-semibold text-primary">{{ t('Lista de Impresiones') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-secondary">{{ totalRecords }} {{ t('registros') }}</span>
            </div>
          </div>
        </template>

        <!-- Estados de carga y vacío -->
        <template #empty>
          <div class="text-center py-8">
            <i class="pi pi-print text-4xl text-gray-300 mb-4"></i>
            <p class="text-lg" style="color: var(--text-color-secondary);">{{ t('No se han encontrado datos.') }}</p>
          </div>
        </template>
        
        <template #loading>
          <div class="text-center py-8">
            <i class="pi pi-spin pi-spinner text-2xl text-blue-500 mb-2"></i>
            <p style="color: var(--text-color-secondary);">{{ t('Cargando datos...') }}</p>
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

        <!-- Información del documento -->
        <Column :header="t('Documento')" :sortable="false" style="min-width: 300px">
          <template #body="slotProps">
            <div class="space-y-2">
              <!-- Título del documento -->
              <div class="flex items-start gap-2">
                <i class="pi pi-file text-gray-400 mt-1"></i>
                <div class="flex-1 min-w-0">
                  <PageLink :page="slotProps.data" />
                </div>
              </div>
              
              <!-- Tipo y colección -->
              <div class="flex items-center gap-2 flex-wrap">
                <div class="flex items-center gap-1">
                  <i class="pi pi-tag text-gray-400"></i>
                  <Tag 
                    :severity="formatPageType(slotProps.data.type)" 
                    :value="slotProps.data.type"
                    class="text-xs"
                  />
                </div>
                <div class="flex items-center gap-1">
                  <i class="pi pi-folder text-yellow-500"></i>
                  <span class="text-xs text-yellow-600 font-medium">{{ slotProps.data.collection }}</span>
                </div>
              </div>
            </div>
          </template>
        </Column>

        <!-- Fecha de impresión -->
        <Column field="date" :header="t('Fecha de Impresión')" :sortable="true" style="min-width: 150px">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <i class="pi pi-calendar text-gray-400"></i>
              <div class="text-sm">
                <div style="color: var(--text-color);">{{ formatDateTime(slotProps.data.date) }}</div>
              </div>
            </div>
          </template>
        </Column>

        <!-- Ubicación -->
        <Column :header="t('Ubicación')" :sortable="false" style="min-width: 150px">
          <template #body="slotProps">
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-sm">
                <i class="pi pi-map-marker text-red-500"></i>
                <span style="color: var(--text-color);">{{ slotProps.data.glc_country_name }}</span>
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
