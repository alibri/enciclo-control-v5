<script lang="ts" setup>
const { t } = useI18n();

interface Props {
  src: string;
  showDimensions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDimensions: true
});

const dimensions = ref({ width: 0, height: 0 });
const loading = ref(true);

// Función para obtener las dimensiones de una imagen
const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = src;
  });
};

onMounted(async () => {
  if (props.src && props.showDimensions) {
    try {
      dimensions.value = await getImageDimensions(props.src);
    } catch (error) {
      console.error('Error loading image dimensions:', error);
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
  }
});
</script>

<template>
  <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-b-xl">
    <div v-if="loading" class="flex items-center justify-center">
      <i class="pi pi-spin pi-spinner mr-1"></i>
      <span>{{ t('Cargando...') }}</span>
    </div>
    <div v-else-if="dimensions.width > 0" class="text-center">
      <div class="font-semibold">{{ dimensions.width }} × {{ dimensions.height }}</div>
      <div class="text-gray-300 text-xs">px</div>
    </div>
    <div v-else class="text-center text-gray-300">
      <i class="pi pi-exclamation-triangle mr-1"></i>
      <span>{{ t('Error al cargar') }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos del componente ImageInfo */
.absolute {
  z-index: 10;
}

/* Transición suave para el overlay */
.bg-black {
  transition: opacity 0.2s ease-in-out;
}

/* Animación para el spinner */
.pi-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
