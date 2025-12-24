<script setup>
// En app.vue o en un plugin
/*
import 'primevue/resources/primevue.css';
//import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/themes/lara-light-blue/theme.css';
import '/themes/lara-light-blue/theme.css'
//import '/themes/lara-light-blue/theme.css';
//import 'primevue/resources/themes/vela-blue/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '@sfxcode/formkit-primevue/dist/sass/formkit-primevue.scss';
*/
const data = {
  es: {
    startsWith: 'Comience con',
    contains: 'Contenga',
    notContains: 'No contenga',
    endsWith: 'Termine con',
    equals: 'Igual a',
    notEquals: 'Diferente a',
    noFilter: 'Sin filtro',
    lt: 'Menor que',
    lte: 'Menor o igual a',
    gt: 'Mayor que',
    gte: 'Mayor o igual a',
    dateIs: 'Fecha igual a',
    dateIsNot: 'Fecha diferente a',
    dateBefore: 'Fecha antes de',
    dateAfter: 'Fecha después de',
    custom: 'Personalizar',
    clear: 'Limpiar',
    apply: 'Aplicar',
    matchAll: 'Coincidir todo',
    matchAny: 'Coincidir con cualquiera',
    addRule: 'Agregar regla',
    removeRule: 'Eliminar regla',
    accept: 'Sí',
    reject: 'No',
    choose: 'Escoger',
    upload: 'Subir',
    cancel: 'Cancelar',
    fileSizeTypes: [
      'B',
      'KB',
      'MB',
      'GB',
      'TB',
      'PB',
      'EB',
      'ZB',
      'YB'
    ],
    dayNames: [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado'
    ],
    dayNamesShort: [
      'Dom',
      'Lun',
      'Mar',
      'Mié',
      'Jue',
      'Vie',
      'Sáb'
    ],
    dayNamesMin: [
      'D',
      'L',
      'M',
      'M',
      'J',
      'V',
      'S'
    ],
    monthNames: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'
    ],
    monthNamesShort: [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic'
    ],
    today: 'Hoy',
    now: 'Ahora',
    weekHeader: 'Sem',
    firstDayOfWeek: 1,
    showMonthAfterYear: false,
    dateFormat: 'dd/mm/yy',
    weak: 'Débil',
    medium: 'Medio',
    strong: 'Fuerte',
    passwordPrompt: 'Escriba una contraseña',
    emptyFilterMessage: 'Sin opciones disponibles',
    emptySearchMessage: 'Sin opciones disponibles',
    emptyMessage: 'No se han encontrado resultados',
    aria: {
      trueLabel: 'Verdadero',
      falseLabel: 'Falso',
      nullLabel: 'No seleccionado',
      star: '1 estrella',
      stars: '{star} estrellas',
      selectAll: 'Seleccionar todos',
      unselectAll: 'Deseleccionar todos',
      close: 'Cerrar',
      previous: 'Anterior',
      next: 'Siguiente',
      navigation: 'Navegación',
      scrollTop: 'Desplazarse hacia arriba',
      moveTop: 'Mover arriba',
      moveUp: 'Subir',
      moveDown: 'Bajar',
      moveBottom: 'Desplazarse hacia abajo',
      moveToTarget: 'Mover al objetivo',
      moveToSource: 'Mover al origen',
      moveAllToTarget: 'Mover todo al objetivo',
      moveAllToSource: 'Mover todo al origen',
      pageLabel: 'Página {page}',
      firstPageLabel: 'Primera Página',
      lastPageLabel: 'Última Página',
      nextPageLabel: 'Siguiente Página',
      previousPageLabel: 'Página Anterior',
      rowsPerPageLabel: 'Filas por página',
      jumpToPageDropdownLabel: 'Ir al menú desplegable de página',
      jumpToPageInputLabel: 'Ir a la entrada de página',
      selectRow: 'Seleccionar fila',
      unselectRow: 'Desmarcar fila',
      expandRow: 'Expandir Fila',
      collapseRow: 'Reducir Fila',
      showFilterMenu: 'Mostrar menú del filtro',
      hideFilterMenu: 'Ocultar menú del filtro',
      filterOperator: 'Operador de filtro',
      filterConstraint: 'Restricción de filtro',
      editRow: 'Editar fila',
      saveEdit: 'Guardar editado',
      cancelEdit: 'Cancelar editado',
      listView: 'Vista de lista',
      gridView: 'Vista de cuadrícula',
      slide: 'Deslizar',
      slideNumber: '{slideNumber}',
      zoomImage: 'Ampliar imagen',
      zoomIn: 'Ampliar',
      zoomOut: 'Reducir',
      rotateRight: 'Girar a la derecha',
      rotateLeft: 'Girar a la izquierda'
    }
  }
};

const runtimeConfig = useRuntimeConfig();
useHead({
  title: runtimeConfig.public.APP_TITLE
});

// load json from assets
// const { data } = await useFetch('~/assets/es.json');

const primevue = usePrimeVue();
primevue.config.locale = data.es;
primevue.config.locale.closeText = 'Cerrar';
primevue.config.locale.prevText = 'Anterior';
primevue.config.locale.nextText = 'Siguiente';
primevue.config.locale.monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
primevue.config.locale.monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
primevue.config.locale.dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
primevue.config.locale.dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
primevue.config.locale.dayNamesMin = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
primevue.config.locale.weekHeader = 'Semana';
primevue.config.locale.firstDay = 0;
primevue.config.locale.isRTL = false;
primevue.config.locale.showMonthAfterYear = false;
primevue.config.locale.yearSuffix = '';
primevue.config.locale.timeOnlyTitle = 'Solo hora';
primevue.config.locale.timeText = 'Tiempo';
primevue.config.locale.hourText = 'Hora';
primevue.config.locale.minuteText = 'Minuto';
primevue.config.locale.secondText = 'Segundo';
primevue.config.locale.currentText = 'Fecha actual';
primevue.config.locale.ampm = false;
primevue.config.locale.month = 'Mes';
primevue.config.locale.week = 'Semana';
primevue.config.locale.day = 'Día';
primevue.config.locale.allDayText = 'Todo el día';
primevue.config.locale.dateFormat = 'dd/mm/yy';
primevue.config.locale.firstDayOfWeek = 1;

const { logger } = useLogger();
logger.debug('APP_VERSION', runtimeConfig.public.APP_VERSION);
const apiBaseUrl = getApiUrl();
logger.debug('apiBaseUrl', apiBaseUrl);
</script>

<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtPage />
    <AppToast />
  </NuxtLayout>
</template>

<style lang='scss'>
// @use 'App.scss' as *;
</style>
