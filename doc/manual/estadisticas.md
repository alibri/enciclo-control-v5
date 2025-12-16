# Estadísticas

La sección de Estadísticas proporciona análisis detallados de diferentes aspectos del sistema. Puedes acceder a ella desde el menú lateral bajo la sección "Estadísticas".

## 📊 Secciones Disponibles

El menú de Estadísticas incluye:

1. **Sesiones**: Análisis completo de sesiones de usuario
2. **Páginas**: Estadísticas de páginas visitadas
3. **Queries**: Análisis de consultas realizadas
4. **Impresiones**: Estadísticas de documentos impresos

## 🔐 Sesiones

### Vista General

La página de Sesiones muestra un listado completo de todas las sesiones registradas en el sistema con información detallada.

![Estadísticas - Sesiones](/screenshots/04-estadisticas-sesiones.png)

### Funcionalidades

#### Filtrado y Búsqueda

- **Búsqueda global**: Busca por usuario o nombre
- **Filtros por columna**: Filtra por usuario específico
- **Ordenamiento**: Ordena por cualquier columna (fecha, duración, páginas, etc.)

#### Información Mostrada

Cada sesión muestra:

- **Acciones**: Botón para ver detalles completos de la sesión
- **Usuario**: Nombre del usuario con enlace a su perfil
- **Inicio**: Fecha y hora de inicio de la sesión
- **Duración**: Tiempo total de la sesión
- **Páginas**: Número de páginas visitadas
- **Modo**: Modo de login utilizado
- **Dispositivo**: Información del navegador y plataforma
- **Ubicación**: País, ciudad e IP del usuario
- **User Agent**: Información técnica del navegador

#### Exportación

- **Exportar a Excel**: Descarga un archivo Excel con todos los datos de sesiones
- **Filtros aplicados**: La exportación respeta los filtros activos

### Ver Detalles de una Sesión

1. Haz clic en el botón de ojo (👁️) en la columna de Acciones
2. O haz clic directamente en el ID de la sesión
3. Se abrirá una página con información detallada de la sesión

## 📄 Páginas

### Vista General

La página de Páginas muestra estadísticas sobre las páginas más visitadas del sistema.

### Funcionalidades

- **Listado de páginas**: Páginas ordenadas por número de visitas
- **Filtros**: Busca y filtra páginas específicas
- **Exportación**: Exporta datos a Excel

## ❓ Queries

### Vista General

La página de Queries muestra todas las consultas realizadas por los usuarios.

### Funcionalidades

- **Listado de queries**: Todas las consultas con información detallada
- **Filtros**: Busca queries específicas
- **Exportación**: Exporta datos a Excel

## 🖨️ Impresiones

### Vista General

La página de Impresiones muestra estadísticas sobre documentos impresos.

### Funcionalidades

- **Listado de impresiones**: Todas las impresiones registradas
- **Filtros**: Busca impresiones específicas
- **Exportación**: Exporta datos a Excel

## 🔧 Funciones Comunes

### Paginación

Todas las tablas de estadísticas incluyen:

- **Paginación**: Navega entre páginas de resultados
- **Filas por página**: Selecciona 25, 50 o 100 registros por página
- **Navegación**: Botones para primera, anterior, siguiente y última página

### Ordenamiento

- **Clic en encabezado**: Haz clic en cualquier encabezado de columna para ordenar
- **Ordenamiento múltiple**: Mantén presionada la tecla Shift para ordenar por múltiples columnas
- **Indicadores**: Las flechas indican el orden actual

### Filtrado

- **Filtro global**: Busca en todas las columnas
- **Filtros por columna**: Filtra por columnas específicas
- **Limpiar filtros**: Botón para limpiar todos los filtros aplicados

### Exportación

- **Botón Exportar**: Descarga los datos actuales a Excel
- **Filtros respetados**: Solo se exportan los datos visibles según los filtros aplicados
- **Formato Excel**: Los archivos se descargan en formato .xlsx

## 💡 Consejos de Uso

### Análisis de Sesiones

- **Identifica patrones**: Busca patrones en las horas de acceso
- **Usuarios activos**: Identifica los usuarios más activos
- **Duración promedio**: Analiza la duración promedio de las sesiones

### Análisis de Páginas

- **Páginas populares**: Identifica las páginas más visitadas
- **Optimización**: Usa esta información para optimizar contenido

### Análisis de Queries

- **Consultas frecuentes**: Identifica las consultas más comunes
- **Mejoras**: Usa esta información para mejorar el sistema de búsqueda

## ⚠️ Notas Importantes

- Los datos se cargan de forma lazy (bajo demanda) para mejorar el rendimiento
- Algunas estadísticas pueden requerir permisos especiales
- Los datos históricos pueden tener limitaciones según la configuración del sistema

---

**Siguiente**: [Usuarios](./usuarios.md)
