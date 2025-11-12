<script lang="ts" setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import html2pdf from 'html2pdf.js';

const { t } = useI18n();
const { showMessage } = useMessages();

interface StatsData {
  logins: number;
  pages: number;
  preguntas: number;
  ts: string;
}

interface UserPageStats {
  [year: string]: {
    [month: string]: StatsData;
  };
}

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps<{
  collection?: string | null;
  userPageStats?: UserPageStats | null;
  loading?: boolean;
  user?: string | null;
}>();

const yearSelected = ref((Object.keys(props.userPageStats || {})[0] || new Date().getFullYear()).toString());

// Computed property para ordenar los datos por mes
const sortedUserPageStats = computed(() => {
  if (!props.userPageStats) return {};
  return props.userPageStats[yearSelected.value];
});

// Datos para el gráfico de barras
const chartData = computed(() => {
  if (!props.userPageStats) return { labels: [], datasets: [] };

  if (!props.userPageStats[yearSelected.value]) {
    yearSelected.value = (Object.keys(props.userPageStats || {})[0] || new Date().getFullYear()).toString();
  }

  const entries = Object.entries(props.userPageStats[yearSelected.value] || {});
  const labels = entries.map(([month]) => formatMonthName(Number(month)));
  const loginsData = entries.map(([, stats]) => (stats as StatsData).logins);
  const pagesData = entries.map(([, stats]) => (stats as StatsData).pages);
  const preguntasData = entries.map(([, stats]) => (stats as StatsData).preguntas);

  if (props.collection === 'authoritas') {
    return {
      labels,
      datasets: [
        {
          label: t('Pregúntame'),
          data: preguntasData,
          backgroundColor: 'rgba(147, 51, 234, 0.6)',
          borderColor: 'rgba(147, 51, 234, 1)',
          borderWidth: 1,
        }
      ]
    };
  }
  return {
    labels,
    datasets: [
    {
        label: t('Sesiones'),
        data: loginsData,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: t('Páginas'),
        data: pagesData,
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      }
    ]
  };
});

// Opciones del gráfico
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: `${t('Año')} ${yearSelected.value}`,
      font: {
        size: 16,
        weight: 'bold' as const
      }
    },
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: t('Mes')
      }
    },
    y: {
      display: true,
      title: {
        display: true,
        text: t('Cantidad')
      },
      beginAtZero: true
    }
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false
  }
}));

// Función para formatear el nombre del mes
const formatMonthName = (monthNumber: number): string => {
  const months = [
    t('Enero'), t('Febrero'), t('Marzo'), t('Abril'), t('Mayo'), t('Junio'),
    t('Julio'), t('Agosto'), t('Septiembre'), t('Octubre'), t('Noviembre'), t('Diciembre')
  ];
  return months[monthNumber - 1] || `Mes ${monthNumber}`;
};

// Función para exportar la tabla a CSV
const exportarCSV = () => {

  console.log('exportarCSV', sortedUserPageStats.value);
  if (!sortedUserPageStats.value) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Cabeceras de la tabla
  const headers = [t('Mes'), t('Sesiones'), t('Páginas'), t('Tiempo'), t('Pregúntame')];
  
  // Construir las filas de datos
  const rows = Object.entries(sortedUserPageStats.value).map(([month, stats]) => {
    return [
      formatMonthName(Number(month)),
      stats.logins.toString(),
      stats.pages.toString(),
      stats.ts,
      stats.preguntas.toString()
    ];
  });

  // Unir cabeceras y filas
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // Crear un blob y descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url)
  const fileName = `${props.user}_${props.collection || 'coleccion'}_${yearSelected.value}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showMessage('success', t('Éxito'), t('Exportado correctamente') + ' ' + fileName);
};

const printing = ref(false);
// Función para generar PDF del componente
const generarPDF = async () => {
  // Obtener el contenido del componente
  printing.value = true;
  const contenido = document.querySelector('.print-area');
  console.log('contenido', contenido);

  if (!contenido) {
    showMessage('error', t('Error'), t('No se encontró contenido para generar PDF'));
    return;
  }

  try {
    // Esperar a que las imágenes se carguen completamente
    const images = contenido.querySelectorAll('img');
    const imagePromises = Array.from(images).map((img: HTMLImageElement) => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve(img);
        } else {
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
        }
      });
    });

    await Promise.all(imagePromises);

    // Configuración para el PDF
    const opt = {
      margin: 1,
      filename: `${t('estadisticas')}_${props.user || t('usuario')}_${props.collection || t('coleccion')}_${yearSelected.value}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        logging: false,
        // Configuración específica para imágenes
        onclone: (clonedDoc: Document) => {
          // Asegurar que las imágenes se muestren en el documento clonado
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach((img: HTMLImageElement) => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';
          });
        },
        // Excluir elementos específicos del PDF
        ignoreElements: (element: Element) => {
          return element.classList.contains('no-print') ||
            element.classList.contains('no-pdf') ||
            element.tagName === 'BUTTON' ||
            element.tagName === 'A';
        }
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait' as const
      }
    };

    // Mostrar mensaje de carga
    showMessage('info', t('Generando PDF'), t('Por favor espere...'));

    // Generar el PDF
    await html2pdf().set(opt).from(contenido as HTMLElement).save();

    // Mostrar mensaje de éxito
    showMessage('success', t('Éxito'), t('PDF generado correctamente'));

  } catch (error) {
    console.error('Error generando PDF:', error);
    showMessage('error', t('Error'), t('No se pudo generar el PDF'));
  } finally {
    printing.value = false;
  }
};

</script>

<template>
  <div class="card">
    <div v-if="userPageStats && !loading" class="print-area">
      <div class="flex justify-start gap-2 cursor-pointer no-print">
      <a class="mb-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded shadow transition-all duration-200"
        @click="generarPDF">
        <i class="pi pi-file-pdf mr-2"></i> {{ t('Generar PDF') }}
      </a>
    </div>
      <div class="flex justify-center items-center my-6">
        <h1
          class="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight transition-all duration-300">
          <span v-if="printing">{{ user }} - </span>
          {{ collection }}
        </h1>
      </div>
      <hr />
      <SelectButton v-model="yearSelected" :options="Object.keys(userPageStats)" aria-labelledby="custom">
        <template #option="slotProps">
          <span v-if="yearSelected.toString() === slotProps.option">
            <i class="pi pi-chart-bar"></i>
          </span>
          {{ slotProps.option }}
        </template>
      </SelectButton>

      <div class="grid grid-cols-12 p-1 gap-4">
        <div class="col-span-12">
          <div :class="printing ? 'chart-container' : 'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'">
            <div :class="printing ? '' : 'h-96'">
              <Bar :data="chartData" :options="chartOptions" />
            </div>
          </div>
        </div>
        <div class="col-span-12">
          <div class="flex justify-start cursor-pointer no-print">
          <a
            class="mb-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded shadow transition-all duration-200"
            @click="exportarCSV">
            <i class="pi pi-file-excel mr-2"></i> {{ t('Exportar EXCEL') }}
        </a>
      </div>
          <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  {{ t('Mes') }}
                </th>
                <th v-if="collection !== 'authoritas'"
                  class="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  {{ t('Sesiones') }}
                </th>
                <th v-if="collection !== 'authoritas'"
                  class="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  {{ t('Páginas') }}
                </th>
                <th v-if="collection !== 'authoritas'"
                  class="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  {{ t('Tiempo') }}
                </th>
                <th v-if="collection === 'authoritas'"
                  class="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                  {{ t('Pregúntame') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
              <tr v-for="(stats, month, index) in sortedUserPageStats" :key="String(month)" :class="[
                'transition-colors duration-200 ease-in-out',
                'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-sm',
                index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
              ]">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                {{ yearSelected }} - {{ formatMonthName(Number(month)) }}
                </td>
                <td v-if="collection !== 'authoritas'" class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-center">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {{ formatIntNumber(stats.logins) }}
                  </span>
                </td>
                <td v-if="collection !== 'authoritas'" class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-center">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    {{ formatIntNumber(stats.pages) }}
                  </span>
                </td>
                <td v-if="collection !== 'authoritas'" class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-center font-mono">
                  {{ stats.ts }}
                </td>
                <td v-if="collection === 'authoritas'" class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-center">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    {{ formatIntNumber(stats.preguntas) }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-gray-100 dark:bg-gray-600 font-bold">
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-right">
                  {{ t('Totales') }}
                </td>
                <td v-if="collection !== 'authoritas'" class="px-6 py-4 text-sm text-blue-800 dark:text-blue-200 text-center">
                  {{
                    formatIntNumber(
                      Object.values(sortedUserPageStats || {}).reduce((acc, stats) => acc + (stats.logins || 0), 0)
                    )
                  }}
                </td>
                <td v-if="collection !== 'authoritas'" class="px-6 py-4 text-sm text-green-800 dark:text-green-200 text-center">
                  {{
                    formatIntNumber(
                      Object.values(sortedUserPageStats || {}).reduce((acc, stats) => acc + (stats.pages || 0), 0)
                    )
                  }}
                </td>
                <td v-if="collection !== 'authoritas'" class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 text-center font-mono">
                  {{
                    (() => {
                      // Sumar los tiempos en formato HH:MM:SS
                       const totalSeconds = Object.values(sortedUserPageStats || {}).reduce((acc, stats) => {
                         if (!stats.ts) return acc;
                         const [h, m, s] = stats.ts.split(':').map(Number);
                         return acc + ((h || 0) * 3600 + (m || 0) * 60 + (s || 0));
                       }, 0);
                      const hours = Math.floor(totalSeconds / 3600);
                      const minutes = Math.floor((totalSeconds % 3600) / 60);
                      const seconds = totalSeconds % 60;
                      return [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':');
                    })()
                  }}
                </td>
                <td v-if="collection === 'authoritas'" class="px-6 py-4 text-sm text-purple-800 dark:text-purple-200 text-center">
                  {{
                    formatIntNumber(
                      Object.values(sortedUserPageStats || {}).reduce((acc, stats) => acc + (stats.preguntas || 0), 0)
                    )
                  }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
    <div v-else-if="loading" class="text-gray-500 dark:text-gray-400 text-center py-8">
      {{ t('Cargando...') }}
    </div>
    <div v-else class="text-gray-500 dark:text-gray-400 text-center py-8">
      No hay datos disponibles
    </div>
  </div>
</template>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }

  /* Clases específicas para PDF */
  .no-pdf {
    display: none !important;
  }

  .pdf-only {
    display: block !important;
  }

  /* Mejorar la apariencia de la impresión */
  .card {
    box-shadow: none !important;
    border: 1px solid #ddd !important;
  }

  /* Asegurar que las tablas se impriman correctamente */
  table {
    page-break-inside: avoid;
  }

  /* Mejorar la legibilidad del texto */
  body {
    color: #000 !important;
    background: #fff !important;
  }

  /* Estilos específicos para el contenedor del gráfico en impresión */
  .chart-container {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  .chart-container > div {
    height: auto !important;
    min-height: 300px;
  }

  /* Estilos específicos para la imagen en impresión */
  .col-span-6 img {
    max-width: 100% !important;
    height: auto !important;
    display: block !important;
    margin: 0 auto !important;
    page-break-inside: avoid;
  }
}
</style>
