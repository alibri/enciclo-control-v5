# Authoritas

La sección Authoritas contiene herramientas avanzadas relacionadas con inteligencia artificial, consultas y repositorio de documentos.

## 🤖 Secciones Disponibles

El menú de Authoritas incluye:

1. **Pregúntame**: Interfaz de chat para realizar consultas
2. **Pregúntame (listado)**: Listado de todas las consultas realizadas
3. **Repositorio**: Gestión de documentos del repositorio
4. **Test RAG**: Herramientas de prueba para RAG (Retrieval-Augmented Generation)
5. **Test RAG A/B**: Pruebas comparativas A/B
6. **Listado Test RAG**: Historial de pruebas RAG

## 💬 Pregúntame

### Vista General

Pregúntame es una interfaz de chat que permite realizar consultas utilizando inteligencia artificial.

### Funcionalidades

- **Chat en tiempo real**: Interfaz conversacional
- **Historial**: Guarda todas las conversaciones
- **Búsqueda**: Busca en conversaciones anteriores
- **Exportación**: Exporta conversaciones

### Uso

1. Accede a **Pregúntame** desde el menú
2. Escribe tu pregunta en el campo de texto
3. Presiona **Enter** o haz clic en enviar
4. La IA procesará tu consulta y responderá
5. Puedes continuar la conversación haciendo más preguntas

## 📋 Pregúntame (Listado)

### Vista General

Esta página muestra un listado completo de todas las consultas realizadas en el sistema "Pregúntame", organizadas en formato de tarjetas.

![Pregúntame (Listado)](/screenshots/10-preguntame-listado.png)

### Funcionalidades Principales

#### Vista de Tarjetas

Cada consulta se muestra en una tarjeta con:

- **ID de consulta**: Identificador único
- **Pregunta**: Texto completo de la pregunta
- **Usuario**: Usuario que realizó la consulta
- **Colección**: Colección relacionada
- **Fecha y hora**: Cuándo se realizó la consulta
- **Tiempo de respuesta**: Tiempo que tardó en responder
- **Tokens**: Información sobre tokens utilizados (prompt y completion)
- **Respuesta**: Si hay respuesta o no
- **Like/Dislike**: Valoración de la respuesta
- **Idioma**: Idioma detectado de la pregunta
- **Traducciones**: Idiomas a los que se tradujo
- **Clasificación**: Categoría asignada
- **Configuración RAG**: Modelo y parámetros utilizados
- **Enlace compartido**: Si se generó un enlace para compartir
- **Clicks**: Número de veces que se accedió al enlace

#### Filtros y Búsqueda

- **Filtro "SIN RESPUESTA"**: Toggle para mostrar solo consultas sin respuesta
- **Búsqueda**: Campo de búsqueda para filtrar por texto
- **Paginación**: Navega entre páginas de resultados (24, 48 o 96 por página)

#### Ver Detalles

- **Doble clic**: Haz doble clic en cualquier tarjeta para ver detalles completos
- **Botón de ojo**: Haz clic en el icono de ojo para abrir el drawer de detalles
- **Navegación**: En el drawer puedes navegar entre consultas anterior/siguiente

#### Exportación

- **Botón Exportar**: Descarga todas las consultas a Excel
- **Filtros respetados**: La exportación respeta los filtros activos

### Tarjetas Destacadas

Las consultas **sin respuesta** se muestran con:

- Borde naranja a la izquierda
- Fondo ligeramente coloreado
- Indicador visual claro

### Información Detallada en Tarjetas

Cada tarjeta muestra:

1. **Header**: ID, botón de ver, like/dislike, estado de respuesta
2. **Pregunta**: Destacada con fondo azul claro
3. **Usuario y Colección**: Enlaces navegables
4. **Fecha y Métricas**: Tiempo de respuesta, tokens
5. **Idiomas**: Idioma detectado y traducciones
6. **Enlaces y Clicks**: Si hay enlace compartido
7. **Clasificación**: Categoría y porcentaje de asignación
8. **Configuración RAG**: Modelo y temperatura utilizados
9. **¿Sabías?**: Información adicional si está disponible

## 📁 Repositorio

### Vista General

El Repositorio permite gestionar documentos que se utilizan para el sistema RAG (Retrieval-Augmented Generation).

![Repositorio de Documentos](/screenshots/11-repositorio.png)

### Funcionalidades

#### Subir Documentos

1. Haz clic en el área de carga de documentos
2. Selecciona uno o varios archivos (PDF, DOC, DOCX, TXT)
3. El sistema procesará los documentos automáticamente
4. Los documentos aparecerán en la lista una vez procesados

#### Listado de Documentos

La tabla muestra:

- **ID**: Identificador único
- **Creado**: Fecha y hora de creación
- **Nombre**: Nombre del archivo
- **Fichero original**: Nombre original del archivo
- **Estado**: Estado del procesamiento (pending, processing, imported, error)
- **Tipo**: Tipo MIME del archivo
- **Tamaño**: Tamaño del archivo
- **Ruta**: Ruta donde se almacena
- **Actualizado**: Fecha de última actualización

#### Acciones sobre Documentos

Desde el menú de opciones (⋮) puedes:

- **Ver original**: Abre el documento original en una nueva pestaña
- **Eliminar**: Elimina el documento del repositorio
- **Volver a generar**: Regenera el procesamiento del documento (solo si está en estado "imported")

#### Estados de Documentos

- **pending**: Esperando procesamiento
- **processing**: En proceso de indexación
- **imported**: Procesado e indexado correctamente
- **error**: Error en el procesamiento

### Exportación

- **Botón Exportar**: Descarga la lista de documentos a Excel

## 🧪 Test RAG

### Vista General

Herramienta para probar configuraciones RAG antes de aplicarlas en producción.

### Funcionalidades

- **Configuración de parámetros**: Ajusta modelo, temperatura, etc.
- **Realizar consultas de prueba**: Prueba diferentes preguntas
- **Ver resultados**: Compara resultados con diferentes configuraciones

## 🔬 Test RAG A/B

### Vista General

Permite realizar pruebas comparativas A/B entre diferentes configuraciones RAG.

### Funcionalidades

- **Configurar dos variantes**: A y B
- **Realizar consultas**: Misma pregunta con ambas configuraciones
- **Comparar resultados**: Evalúa cuál configuración funciona mejor

## 📊 Listado Test RAG

### Vista General

Muestra el historial de todas las pruebas RAG realizadas.

### Funcionalidades

- **Listado completo**: Todas las pruebas realizadas
- **Filtros**: Busca pruebas específicas
- **Exportación**: Exporta resultados a Excel

## 💡 Consejos de Uso

### Pregúntame (Listado)

- **Revisa consultas sin respuesta**: Usa el filtro para identificar consultas que necesitan atención
- **Analiza patrones**: Identifica preguntas frecuentes
- **Mejora el sistema**: Usa los datos para mejorar las respuestas del sistema

### Repositorio

- **Mantén documentos actualizados**: Actualiza documentos regularmente
- **Revisa estados**: Monitorea el estado de procesamiento
- **Regenera si es necesario**: Si un documento tiene problemas, regenera su procesamiento

### Test RAG

- **Prueba antes de aplicar**: Siempre prueba nuevas configuraciones antes de aplicarlas en producción
- **Compara resultados**: Usa A/B testing para encontrar la mejor configuración
- **Documenta cambios**: Mantén un registro de las configuraciones que funcionan mejor

## ⚠️ Notas Importantes

- El procesamiento de documentos puede tardar según el tamaño
- Las consultas se guardan automáticamente
- Los tests RAG no afectan el sistema de producción
- Algunas funcionalidades pueden requerir permisos especiales

---

**Siguiente**: [Utilidades](./utilidades.md)
