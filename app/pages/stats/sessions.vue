<script setup lang="ts">
import { FilterMatchMode, FilterOperator } from '~/utils/primevue';
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
  loadFunction: (data: any) => statsService.getLastSessions(data) as Promise<ApiResponse<any>>,
  exportFunction: (data: any) => statsService.exportSessions(data) as Promise<ApiResponse<any>>,
  exportMessage: t('Exportando datos sesiones'),
  globalFilterFields: ['user', 'name'],
  initialFilters: {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    user: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
  }
});
</script>

<template>
  <div class="min-h-screen p-4" style="background-color: var(--surface-ground);">
    <!-- Header mejorado -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold mb-2" style="color: var(--text-color);">
          <i class="pi pi-sign-in mr-2" style="color: var(--primary-color);"></i>
          {{ t('Sesiones') }}</h2>
        <p class="text-sm" style="color: var(--text-color-secondary);">{{ t('Gestión y seguimiento de sesiones de usuario') }}</p>
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
        :global-filter-fields="['user', 'name']"
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
              <i class="pi pi-table" style="color: var(--primary-color);"></i>
              <span class="font-semibold text-primary">{{ t('Lista de Sesiones') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-secondary">{{ totalRecords }} {{ t('registros') }}</span>
            </div>
          </div>
        </template>

        <!-- Estados de carga y vacío -->
        <template #empty>
          <div class="text-center py-8">
            <i class="pi pi-inbox text-4xl mb-4" style="color: var(--text-color-secondary);"></i>
            <p class="text-lg" style="color: var(--text-color-secondary);">{{ t('No se han encontrado datos.') }}</p>
          </div>
        </template>
        
        <template #loading>
          <div class="text-center py-8">
            <i class="pi pi-spin pi-spinner text-2xl mb-2" style="color: var(--primary-color);"></i>
            <p style="color: var(--text-color-secondary);">{{ t('Cargando datos...') }}</p>
          </div>
        </template>

        <!-- Columna de acciones -->
        <Column field="id" :header="t('Acciones')" :sortable="false" :exportable="false" style="width: 80px">
          <template #body="slotProps">
            <div class="flex justify-center">
              <NuxtLink :to="'/sessions/'+slotProps.data.id" class="no-underline">
                <Button 
                  icon="pi pi-eye" 
                  type="button" 
                  class="p-button-text p-button-sm"
                  style="color: var(--primary-color);"
                  v-tooltip.top="t('Ver detalles')"
                />
              </NuxtLink>
            </div>
          </template>
        </Column>

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
              <i class="pi pi-user" style="color: var(--text-color-secondary);"></i>
              <NuxtLink 
                :to="'/users/'+slotProps.data.user" 
                class="font-medium no-underline hover:underline"
                style="color: var(--primary-color);"
              >
                {{ slotProps.data.user }}
              </NuxtLink>
            </div>
          </template>
        </Column>

        <!-- Fecha de inicio -->
        <Column field="begin" :header="t('Inicio')" :sortable="true" style="min-width: 150px">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <i class="pi pi-calendar" style="color: var(--text-color-secondary);"></i>
              <span class="text-sm" style="color: var(--text-color);">{{ formatDateTime(slotProps.data.begin) }}</span>
            </div>
          </template>
        </Column>

        <!-- Duración -->
        <Column field="ts" :header="t('Duración')" :sortable="true" style="min-width: 100px">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <i class="pi pi-clock" style="color: var(--text-color-secondary);"></i>
              <span class="text-sm font-mono px-2 py-1 rounded" style="background-color: var(--surface-hover); color: var(--text-color);">{{ formatSegundosAHora(slotProps.data.ts) }}</span>
            </div>
          </template>
        </Column>

        <!-- Páginas visitadas -->
        <Column field="pages" :header="t('Páginas')" :sortable="true" style="min-width: 80px">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <i class="pi pi-file" style="color: var(--text-color-secondary);"></i>
              <span class="text-sm font-semibold" style="color: var(--primary-color);">{{ slotProps.data.pages }}</span>
            </div>
          </template>
        </Column>

        <!-- Modo de login -->
        <Column field="mode" :header="t('Modo')" :sortable="true" style="min-width: 100px">
          <template #body="slotProps">
            <Tag 
              :severity="formatLoginMode(slotProps.data.mode)" 
              :value="slotProps.data.mode"
              class="text-xs"
            />
          </template>
        </Column>

        <!-- Información del dispositivo -->
        <Column :header="t('Dispositivo')" :sortable="false" style="min-width: 200px">
          <template #body="slotProps">
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-sm">
                <i class="pi pi-desktop" style="color: var(--text-color-secondary);"></i>
                <span style="color: var(--text-color-secondary);">{{ slotProps.data.browser }} {{ slotProps.data.version }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs" style="color: var(--text-color-secondary);">
                <i class="pi pi-mobile" style="color: var(--text-color-secondary);"></i>
                <span>{{ slotProps.data.platform }}</span>
                <div class="flex gap-1 ml-2">
                  <i v-if="slotProps.data.mobile" class="pi pi-check-circle text-green-500" title="Mobile"></i>
                  <i v-if="slotProps.data.tablet" class="pi pi-tablet" style="color: var(--primary-color);" title="Tablet"></i>
                </div>
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
              <div class="flex items-center gap-2 text-xs" style="color: var(--text-color-secondary);">
                <i class="pi pi-building" style="color: var(--text-color-secondary);"></i>
                <span>{{ slotProps.data.glc_city }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs" style="color: var(--text-color-secondary);">
                <i class="pi pi-wifi" style="color: var(--text-color-secondary);"></i>
                <span class="font-mono">{{ slotProps.data.ip }}</span>
              </div>
            </div>
          </template>
        </Column>

        <!-- User Agent (colapsable) -->
        <Column field="agent" :header="t('User Agent')" :sortable="true" style="min-width: 200px" class="hidden lg:table-cell">
          <template #body="slotProps">
            <div class="max-w-xs">
              <span class="text-xs break-all" style="color: var(--text-color-secondary);">{{ slotProps.data.agent }}</span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
