# Reglas para Modo Dark/Light en PrimeVue + Tailwind CSS

Este documento establece las reglas y mejores prácticas para implementar correctamente el modo oscuro/claro en páginas y componentes Vue usando PrimeVue y Tailwind CSS.

## Principio Fundamental

**NUNCA uses clases Tailwind con colores hardcodeados que incluyan variantes `dark:`**. En su lugar, usa siempre las **variables CSS de PrimeVue** que se adaptan automáticamente al modo activo.

## Variables CSS Disponibles

### Colores de Texto
- `var(--text-color)` - Color principal del texto
- `var(--text-color-secondary)` - Color secundario del texto (textos menos importantes, placeholders, etc.)

### Fondos
- `var(--surface-ground)` - Fondo principal de la página
- `var(--surface-card)` - Fondo de tarjetas y contenedores
- `var(--surface-hover)` - Fondo para estados hover y elementos destacados

### Bordes
- `var(--surface-border)` - Color de bordes

### Colores Especiales
- `var(--primary-color)` - Color primario del tema
- `var(--highlight-bg)` - Fondo para elementos destacados

## Reglas por Tipo de Elemento

### 1. Textos

#### ❌ INCORRECTO
```vue
<span class="text-gray-900 dark:text-gray-100">Texto</span>
<span class="text-gray-600 dark:text-gray-400">Texto secundario</span>
<p class="text-gray-500">Descripción</p>
```

#### ✅ CORRECTO
```vue
<span style="color: var(--text-color);">Texto</span>
<span style="color: var(--text-color-secondary);">Texto secundario</span>
<p style="color: var(--text-color-secondary);">Descripción</p>
```

### 2. Fondos

#### ❌ INCORRECTO
```vue
<div class="bg-white dark:bg-gray-800">Contenido</div>
<div class="bg-gray-50 dark:bg-gray-900">Fondo</div>
<div class="bg-gray-100 dark:bg-gray-700">Elemento destacado</div>
```

#### ✅ CORRECTO
```vue
<div style="background-color: var(--surface-card);">Contenido</div>
<div style="background-color: var(--surface-ground);">Fondo</div>
<div style="background-color: var(--surface-hover);">Elemento destacado</div>
```

### 3. Bordes

#### ❌ INCORRECTO
```vue
<div class="border border-gray-200 dark:border-gray-700">Contenido</div>
<div class="border-gray-300 dark:border-gray-600">Borde</div>
```

#### ✅ CORRECTO
```vue
<div class="border" style="border-color: var(--surface-border);">Contenido</div>
<div style="border-color: var(--surface-border);">Borde</div>
```

### 4. Combinación de Estilos

#### ❌ INCORRECTO
```vue
<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
  <h2 class="text-gray-900 dark:text-gray-100">Título</h2>
  <p class="text-gray-600 dark:text-gray-400">Descripción</p>
</div>
```

#### ✅ CORRECTO
```vue
<div class="border rounded-lg p-4" style="background-color: var(--surface-card); border-color: var(--surface-border);">
  <h2 style="color: var(--text-color);">Título</h2>
  <p style="color: var(--text-color-secondary);">Descripción</p>
</div>
```

### 5. Estados Hover

#### ❌ INCORRECTO
```vue
<div class="hover:bg-gray-50 dark:hover:bg-gray-700">Elemento</div>
```

#### ✅ CORRECTO
```vue
<div style="background-color: var(--surface-hover);">Elemento</div>
<!-- O usando clases de Tailwind sin variantes dark: -->
<div class="hover:opacity-80">Elemento</div>
```

### 6. Estilos en Bloques `<style scoped>`

#### ❌ INCORRECTO
```vue
<style scoped>
:deep(.p-datatable-tbody > tr) {
  border-bottom: 1px solid #f1f5f9;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f8fafc !important;
}

:deep(.p-datatable-thead > tr > th) {
  background-color: #f8fafc;
  color: #475569;
}
</style>
```

#### ✅ CORRECTO
```vue
<style scoped>
:deep(.p-datatable-tbody > tr) {
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: var(--surface-hover) !important;
}

:deep(.p-datatable-thead > tr > th) {
  background-color: var(--surface-card);
  color: var(--text-color);
}
</style>
```

### 7. Scrollbars

#### ❌ INCORRECTO
```vue
<style scoped>
.table-container::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
}
</style>
```

#### ✅ CORRECTO
```vue
<style scoped>
.table-container::-webkit-scrollbar-track {
  background: var(--surface-ground);
}

.table-container::-webkit-scrollbar-thumb {
  background: var(--surface-border);
}
</style>
```

### 8. Box Shadows con Colores Primarios

#### ❌ INCORRECTO
```vue
<style scoped>
:deep(.p-column-filter:focus) {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
```

#### ✅ CORRECTO
```vue
<style scoped>
:deep(.p-column-filter:focus) {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 10%, transparent);
}
</style>
```

## Excepciones: Cuándo SÍ Usar Colores Específicos

### Badges y Etiquetas de Estado

Los badges que representan estados específicos (éxito, error, advertencia) pueden mantener sus colores específicos, pero **sin variantes `dark:`**:

#### ✅ CORRECTO
```vue
<!-- Badge de éxito -->
<span class="bg-green-100 text-green-800">Activo</span>

<!-- Badge de error -->
<span class="bg-red-100 text-red-800">Error</span>

<!-- Badge de advertencia -->
<span class="bg-yellow-100 text-yellow-800">Advertencia</span>
```

Estos colores son lo suficientemente contrastados para funcionar en ambos modos.

## Checklist al Crear un Componente/Página

- [ ] ¿He eliminado todas las clases `dark:*`?
- [ ] ¿He reemplazado `text-gray-*` por `style="color: var(--text-color);"` o `var(--text-color-secondary);"`?
- [ ] ¿He reemplazado `bg-gray-*` por `style="background-color: var(--surface-*);"`?
- [ ] ¿He reemplazado `border-gray-*` por `style="border-color: var(--surface-border);"`?
- [ ] ¿He actualizado los estilos en `<style scoped>` para usar variables CSS?
- [ ] ¿He probado el componente en modo claro y oscuro?

## Ejemplo Completo

### Componente Correcto

```vue
<script setup lang="ts">
const { t } = useI18n();
const items = ref([]);
</script>

<template>
  <div class="min-h-screen p-4" style="background-color: var(--surface-ground);">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold mb-2" style="color: var(--text-color);">
        {{ t('Título') }}
      </h2>
      <p class="text-sm" style="color: var(--text-color-secondary);">
        {{ t('Descripción') }}
      </p>
    </div>

    <!-- Card -->
    <div class="border rounded-lg p-6" style="background-color: var(--surface-card); border-color: var(--surface-border);">
      <div class="flex items-center gap-2 mb-4">
        <i class="pi pi-info-circle" style="color: var(--primary-color);"></i>
        <span style="color: var(--text-color);">{{ t('Información') }}</span>
      </div>
      
      <div class="space-y-2">
        <div class="p-3 rounded" style="background-color: var(--surface-hover);">
          <span style="color: var(--text-color-secondary);">{{ t('Item') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos profundos usando variables CSS */
:deep(.p-datatable-tbody > tr) {
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: var(--surface-hover) !important;
}
</style>
```

## Referencias

- Documentación PrimeVue Dark Mode: https://primevue.org/tailwind/#darkmode
- Variables CSS de PrimeVue: Definidas en `app/assets/layout/variables/_common.scss`
- Configuración del tema: `app/theme/app-theme.ts`

## Notas Importantes

1. **Nunca mezcles** clases Tailwind con variantes `dark:` y variables CSS. Usa solo variables CSS.

2. **Los colores de estado** (verde para éxito, rojo para error, etc.) pueden mantenerse específicos ya que tienen suficiente contraste.

3. **Siempre prueba** en ambos modos (claro y oscuro) antes de considerar el componente completo.

4. **Usa `:deep()`** en `<style scoped>` cuando necesites estilizar componentes hijos de PrimeVue.

5. **Prefiere estilos inline** con `style=""` para colores dinámicos, y clases Tailwind solo para layout y espaciado.

