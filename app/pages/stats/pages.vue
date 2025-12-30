<script setup lang="ts">
import { FilterMatchMode } from '~/utils/primevue';
import StatsService from '~/services/statsService';
import { useStatsDataTable } from '~/composables/useStatsDataTable';
import type { ApiResponse } from '~/interfaces/ApiResponse';

useAuthGuard();

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
  loadFunction: (data: any) => statsService.getPages(data) as Promise<ApiResponse<any>>,
  exportFunction: (data: any) => statsService.exportPages(data) as Promise<ApiResponse<any>>,
  exportMessage: t('Exportando datos páginas'),
  globalFilterFields: ['user', 'title', 'collection'],
  initialFilters: {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    user: { value: null, matchMode: FilterMatchMode.CONTAINS }
  }
});
</script>

<template>
  <div class="min-h-screen p-4" style="background-color: var(--surface-ground);">
    <!-- Header mejorado con estadísticas -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
      <div class="mb-4 lg:mb-0">
        <h2 class="text-2xl font-bold mb-2" style="color: var(--text-color);">
          <i class="pi pi-file-o mr-2 text-blue-500"></i>
          {{ t('Páginas') }}
        </h2>
        <p class="text-sm" style="color: var(--text-color-secondary);">
          {{ t('Estadísticas de visualización de páginas') }}
        </p>
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

    <div class="grid grid-cols-12">
      <div class="col-span-12">
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
          paginator-position="both" 
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
          @filter="onFilter($event)">
          <!-- Header con acciones mejoradas -->
          <template #header>
            <div class="flex flex-wrap justify-between items-center gap-4 p-4 border-b surface-card border-surface">
              <div class="flex items-center gap-2">
                <i class="pi pi-table text-blue-500"></i>
                <span class="font-semibold text-primary">{{ t('Lista de Páginas') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-secondary">{{ formatIntNumber(totalRecords) }} {{ t('registros') }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center mt-2">
                <div class="flex items-center gap-2">
                  <Button type="button" icon="pi pi-filter-slash" class="p-button-outlined"
                    @click="clearFilter()" />
                  <IconField iconPosition="left" v-if="filters && filters.global">
                    <InputIcon class="pi pi-search"> </InputIcon>
                    <InputText v-model="filters.global.value" :placeholder="t('Búsqueda')" @keydown.enter="onFilter" />
                  </IconField>
                </div>
              </div>
          </template>

          <!-- Estados de carga y vacío mejorados -->
          <template #empty>
            <div class="text-center py-8">
              <i class="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
              <p style="color: var(--text-color-secondary);">{{ t('No se han encontrado datos.') }}</p>
            </div>
          </template>

          <template #loading>
            <div class="text-center py-8">
              <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4"></i>
              <p style="color: var(--text-color-secondary);">{{ t('Cargando datos...') }}</p>
            </div>
          </template>

          <!-- Columna Usuario mejorada -->
          <Column field="user" :header="t('Usuario')" :sortable="true" :style="{ minWidth: '120px' }">
            <template #filter="{ filterModel, filterCallback }">
              <InputText v-model="filterModel.value" v-tooltip.top.focus="t('Pulsa ENTER para aplicar')" type="text"
                class="p-column-filter" :placeholder="t('busqueda-nombre')" @keydown.enter="filterCallback()" />
            </template>
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <i class="pi pi-user text-gray-400"></i>
                <NuxtLink :to="'/users/' + slotProps.data.user"
                  class="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                  {{ slotProps.data.user }}
                </NuxtLink>
              </div>
            </template>
          </Column>

          <!-- Columna Tipo mejorada -->
          <Column field="type" :header="t('Tipo')" :sortable="true" :style="{ minWidth: '100px' }">
            <template #body="slotProps">
              <Tag :severity="formatPageType(slotProps.data.type)" :value="slotProps.data.type" class="font-medium" />
            </template>
          </Column>

          <!-- Columna Colección mejorada -->
          <Column field="collection" :header="t('Colección')" :sortable="true" :style="{ minWidth: '120px' }">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <i class="pi pi-folder text-yellow-500"></i>
                <span class="text-yellow-700 font-medium">
                  {{ slotProps.data.collection }}
                </span>
              </div>
            </template>
          </Column>

          <!-- Columna Título mejorada -->
          <Column field="title" :header="t('Título')" :sortable="true" :style="{ minWidth: '200px' }">
            <template #body="slotProps">
              <PageLink :page="slotProps.data" />
            </template>
          </Column>

          <!-- Columna Fecha mejorada -->
          <Column field="date" :header="t('Fecha')" :sortable="true" :style="{ minWidth: '140px' }">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <i class="pi pi-calendar text-gray-500"></i>
                <span class="text-sm ">
                  {{ formatDateTime(slotProps.data.date) }}
                </span>
              </div>
            </template>
          </Column>

          <!-- Columna Cache mejorada -->
          <Column field="cached" :header="t('Cache')" :sortable="true" class="text-center"
            :style="{ minWidth: '80px' }">
            <template #body="slotProps">
              <div class="flex justify-center">
                <Tag v-if="slotProps.data.cached" severity="success" :value="t('Sí')" icon="pi pi-check" />
                <Tag v-else severity="secondary" :value="t('No')" icon="pi pi-times" />
              </div>
            </template>
          </Column>

          <!-- Columna País mejorada -->
          <Column field="glc_country_name" :header="t('País')" :sortable="true" :style="{ minWidth: '100px' }">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <span v-if="slotProps.data.glc_country_name">
                  <i class="pi pi-globe text-green-500"></i>
                  <span class="text-green-700 text-sm font-medium">
                    {{ slotProps.data.glc_country_name }}
                  </span>
                </span>
                <span v-else>
                  <i class="pi pi-globe text-gray-500"></i> -
                </span>
              </div>
            </template>
          </Column>

          <!-- Columna Región mejorada -->
          <Column field="glc_city" :header="t('Región')" :sortable="true" :style="{ minWidth: '100px' }">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <span v-if="slotProps.data.glc_city">
                  <i class="pi pi-map-marker text-blue-500"></i>
                  <span class="text-blue-700 text-sm font-medium">
                    {{ slotProps.data.glc_city }}
                  </span>
                </span>
                <span v-else>
                  <i class="pi pi-globe text-gray-500"></i> -
                </span>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>
