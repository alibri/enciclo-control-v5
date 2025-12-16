# Utilidades

La sección de Utilidades contiene herramientas adicionales para la gestión de contenido y configuración del sistema.

## 🛠️ Secciones Disponibles

El menú de Utilidades incluye:

1. **Portada**: Editor de portada de colecciones
2. **Metas**: Configuración de metadatos y SEO
3. **Búsqueda**: Herramienta de búsqueda avanzada
4. **Test IP**: Herramienta para probar direcciones IP
5. **Test Referer**: Herramienta para probar referers

## 🏠 Portada

### Vista General

La página de Portada permite editar y gestionar el contenido que se muestra en la portada de cada colección.

![Editor de Portada](/screenshots/12-portada.png)

### Estructura

La página se divide en:

- **Selector de Colección**: Lista desplegable para seleccionar la colección
- **Selector de Grupo**: Lista desplegable para seleccionar el grupo de elementos
- **Tabla de Elementos**: Lista de elementos del grupo seleccionado

### Grupos Disponibles

Los grupos pueden incluir:

- **articulos**: Artículos destacados
- **videos**: Videos destacados
- **destacados**: Elementos destacados
- **destacados2**: Segunda sección de destacados
- **efemerides**: Efemérides
- **top**: Contenido superior
- **bottom**: Contenido inferior

### Funcionalidades

#### Agregar Elemento

1. Selecciona la colección y el grupo
2. Haz clic en el botón **"Agregar"**
3. Se abrirá un diálogo de edición
4. Completa los campos:
   - **Búsqueda**: Busca una entrada existente para rellenar datos automáticamente
   - **Imagen**: URL de la imagen o selección desde imágenes disponibles
   - **Título**: Título del elemento
   - **Resumen**: Descripción breve
   - **Enlace**: URL de enlace
   - **Otros campos**: Según el tipo de grupo
5. Haz clic en **"Guardar"**

#### Editar Elemento

1. Haz clic en el botón de editar (✏️) en la fila del elemento
2. O haz doble clic en la fila
3. Se abrirá el diálogo de edición
4. Modifica los campos necesarios
5. Haz clic en **"Guardar"**

#### Eliminar Elemento

1. Haz clic en el botón de eliminar (🗑️) en la fila del elemento
2. Confirma la eliminación
3. El elemento será eliminado

#### Guardar Cambios

1. Realiza los cambios necesarios
2. Haz clic en el botón **"Guardar"** (aparece un asterisco * cuando hay cambios sin guardar)
3. Los cambios se guardarán en la base de datos

#### Publicar Portada

1. Después de guardar, haz clic en **"Publicar"**
2. La portada se publicará y estará visible para los usuarios
3. Se mostrará un mensaje de confirmación

#### Vista Previa

1. Haz clic en el botón **"Vista previa"**
2. Se abrirá una nueva pestaña con la vista previa de la portada
3. Úsala para ver cómo se verá antes de publicar

#### Refrescar

1. Haz clic en el botón **"Refrescar"**
2. Se recargarán los datos desde el servidor
3. Si hay cambios sin guardar, se pedirá confirmación

### Campos por Tipo de Grupo

#### Artículos y Videos

- Imagen
- Título
- Enlace
- Resumen
- Entrada (friendly)
- Colección

#### Destacados

- Imagen
- Título
- Enlace
- Categoría
- Entrada (friendly)
- Colección

#### Efemérides

- Imagen
- Título
- Enlace
- Titular
- Fecha
- Fecha 2
- Resumen
- Entrada (friendly)
- Colección

#### Top/Bottom

- Texto (con editor HTML)

### Búsqueda de Entradas

1. En el diálogo de edición, usa el campo de búsqueda
2. Escribe el título o parte del título
3. Selecciona una entrada de la lista
4. Los campos se rellenarán automáticamente con los datos de la entrada

### Selección de Imágenes

1. Haz clic en el botón de selección de imágenes
2. Se mostrará un selector con imágenes disponibles de la entrada
3. Selecciona una imagen
4. La URL se insertará automáticamente

## ⚙️ Metas

### Vista General

La página de Metas permite configurar los metadatos y configuración SEO de cada colección.

![Configuración de Metas](/screenshots/13-metas.png)

### Funcionalidades

#### Configuración de Metadatos

1. Selecciona la colección desde el selector
2. Se cargará la configuración actual
3. Edita los campos:

   - **Título**: Título de la colección (para SEO)
   - **Colecciones**: Lista de colecciones relacionadas
   - **Acerca de**: Descripción breve de la colección
   - **Logo**: URL de la imagen del logo

4. Haz clic en **"Guardar"**

#### Vista Previa del Logo

- Se muestra una vista previa del logo cuando se ingresa una URL
- Puedes seleccionar el logo desde imágenes disponibles usando el selector

#### Guardar Cambios

- El botón **"Guardar"** se habilita cuando hay cambios sin guardar
- Un asterisco (*) indica que hay cambios pendientes
- El botón **"Cancelar"** restaura los valores originales

## 🔍 Búsqueda

### Vista General

Herramienta de búsqueda avanzada para encontrar contenido en el sistema.

### Funcionalidades

- **Búsqueda por texto**: Busca en títulos, contenido, etc.
- **Filtros**: Filtra por colección, tipo, etc.
- **Resultados**: Muestra resultados con información relevante

## 🌐 Test IP

### Vista General

Herramienta para probar y validar direcciones IP.

### Funcionalidades

- **Ingresar IP**: Ingresa una dirección IP para probar
- **Validación**: Verifica si la IP es válida
- **Información**: Muestra información sobre la IP

## 🔗 Test Referer

### Vista General

Herramienta para probar y validar referers HTTP.

### Funcionalidades

- **Ingresar Referer**: Ingresa un referer para probar
- **Validación**: Verifica si el referer es válido
- **Información**: Muestra información sobre el referer

## 💡 Consejos de Uso

### Portada

- **Organiza contenido**: Usa diferentes grupos para organizar el contenido
- **Vista previa siempre**: Siempre revisa la vista previa antes de publicar
- **Imágenes optimizadas**: Usa imágenes optimizadas para mejor rendimiento
- **Mantén actualizado**: Actualiza el contenido regularmente

### Metas

- **SEO optimizado**: Completa todos los campos para mejor SEO
- **Descripciones claras**: Escribe descripciones claras y concisas
- **Logo de calidad**: Usa un logo de buena calidad y tamaño apropiado

### Búsqueda

- **Usa filtros**: Aprovecha los filtros para encontrar contenido específico
- **Búsquedas específicas**: Sé específico en tus búsquedas para mejores resultados

## ⚠️ Notas Importantes

- Los cambios en Portada requieren guardar y publicar para ser visibles
- Los metadatos afectan el SEO de la colección
- Algunas herramientas pueden requerir permisos especiales
- Siempre guarda los cambios antes de salir de la página

---

**Fin del Manual**
