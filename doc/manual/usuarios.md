# Gestión de Usuarios

La sección de Usuarios permite gestionar todos los usuarios del sistema, incluyendo su creación, edición, eliminación y visualización de estadísticas.

## 👥 Vista General

La página de Usuarios muestra un listado completo de todos los usuarios registrados en el sistema con información detallada sobre cada uno.

![Gestión de Usuarios](/screenshots/08-usuarios.png)

## 📋 Información Mostrada

Cada usuario muestra las siguientes columnas:

- **ID**: Identificador único del usuario
- **Nombre**: Nombre completo del usuario
- **Usuario**: Nombre de usuario (con enlace a su perfil)
- **Grupo**: Grupo al que pertenece el usuario
- **Colecciones**: Colecciones asignadas al usuario
- **Inicio/Final**: Período de validez de la cuenta
- **Dashboard**: Indica si tiene acceso al dashboard
- **I.Est.**: Fecha de inicio de estadísticas
- **Email**: Dirección de correo electrónico
- **Estado**: Activo o Inactivo
- **Roles**: Roles asignados (Admin, Editor, Tester, Dashboard, Stats)
- **IP**: Rango de IP permitido
- **Ubicación**: Restricción geográfica
- **Creado/Actualizado**: Fechas de creación y última actualización

## ➕ Crear Nuevo Usuario

### Método 1: Formulario Manual

1. Haz clic en el botón **"Nuevo"** en la barra de herramientas
2. Se abrirá un diálogo con el formulario de usuario

![Diálogo de Nuevo Usuario](/screenshots/09-usuarios-nuevo.png)

3. Completa todos los campos requeridos:
   - **Nombre**: Nombre completo
   - **Usuario**: Nombre de usuario único
   - **Contraseña**: Contraseña del usuario
   - **Email**: Dirección de correo electrónico
   - **Colecciones**: Selecciona las colecciones asignadas
   - **Período**: Fecha de inicio y fin de validez
   - **Roles**: Selecciona los roles (Admin, Editor, Tester, etc.)
   - **Configuraciones adicionales**: IP, ubicación, etc.
4. Haz clic en **"Guardar"**

### Método 2: Importación desde Excel

1. Haz clic en el botón **"Crear desde EXCEL"** en la barra de herramientas
2. Selecciona un archivo Excel (.xlsx o .xls)
3. El sistema procesará el archivo y mostrará el progreso
4. Revisa el resultado de la importación:
   - **Usuarios nuevos**: Lista de usuarios creados
   - **Usuarios actualizados**: Lista de usuarios modificados
   - **Errores**: Lista de errores encontrados

## ✏️ Editar Usuario

### Método 1: Doble Clic

1. Haz **doble clic** en cualquier fila de usuario
2. Se abrirá el diálogo de edición con los datos del usuario
3. Modifica los campos necesarios
4. Haz clic en **"Guardar"**

### Método 2: Menú de Opciones

1. Haz clic en el botón de tres puntos (⋮) en la columna de acciones
2. Selecciona **"Editar"** del menú desplegable
3. Se abrirá el diálogo de edición
4. Modifica los campos necesarios
5. Haz clic en **"Guardar"**

## 🗑️ Eliminar Usuario

1. Haz clic en el botón de tres puntos (⋮) en la columna de acciones
2. Selecciona **"Eliminar"** del menú desplegable
3. Confirma la eliminación en el diálogo
4. El usuario será eliminado permanentemente

⚠️ **Advertencia**: La eliminación es permanente y no se puede deshacer.

## 📊 Ver Estadísticas de Usuario

### Método 1: Clic en Usuario

1. Haz **clic** en el nombre de usuario (enlace azul)
2. Se abrirá la página de estadísticas del usuario

### Método 2: Menú de Opciones

1. Haz clic en el botón de tres puntos (⋮)
2. Selecciona **"Gestión de estadísticas"**
3. Se abrirá un diálogo con las estadísticas del usuario

## 📈 Ver Dashboard de Usuario

1. Haz clic en el botón de tres puntos (⋮)
2. Selecciona **"Ver Dashboard"**
3. Se abrirá un diálogo con el dashboard personalizado del usuario

## 🔑 Resetear Contraseña

1. Haz clic en el botón de tres puntos (⋮)
2. Selecciona **"Resetear contraseña"**
3. Confirma la acción
4. El sistema generará una nueva contraseña y la mostrará (o enviará por email según configuración)

## 🔍 Búsqueda y Filtrado

### Búsqueda Global

1. Usa el campo de búsqueda en la parte superior de la tabla
2. Escribe el término de búsqueda
3. Presiona **Enter** o haz clic en el botón de búsqueda
4. La tabla se filtrará automáticamente

### Filtros por Columna

1. Haz clic en el icono de filtro (🔽) en el encabezado de cualquier columna
2. Ingresa el valor de filtro
3. Presiona **Enter** para aplicar

### Limpiar Filtros

- Haz clic en el botón **"Limpiar filtros"** (🚫) para eliminar todos los filtros

## 📤 Exportar Datos

1. Haz clic en el botón **"Exportar"** en la parte superior
2. Se descargará un archivo Excel con todos los usuarios
3. Los filtros aplicados se respetan en la exportación

## 👥 Desactivar Grupo

1. Haz clic en el botón **"Desactivar grupo"** en la barra de herramientas
2. Ingresa el nombre del grupo
3. Confirma la acción
4. Todos los usuarios del grupo serán desactivados

## 🏷️ Roles y Permisos

### Roles Disponibles

- **Admin**: Acceso completo al sistema
- **Editor**: Permisos para editar contenido
- **Tester**: Permisos de prueba
- **Dashboard**: Acceso al dashboard de estadísticas
- **Stats**: Permisos para ver estadísticas manuales

### Asignar Roles

1. Al crear o editar un usuario
2. Marca las casillas correspondientes a los roles deseados
3. Guarda los cambios

## 📅 Período de Validez

Cada usuario puede tener un período de validez:

- **Inicio**: Fecha desde la cual el usuario puede acceder
- **Final**: Fecha hasta la cual el usuario puede acceder
- **Sin límite**: Deja los campos vacíos para acceso ilimitado

## 🌐 Restricciones de Acceso

### Rango de IP

- Ingresa un rango de IP permitido (ej: 192.168.1.0/24)
- El usuario solo podrá acceder desde IPs dentro de este rango
- Deja vacío para permitir acceso desde cualquier IP

### Restricción Geográfica

- Ingresa un código de país o región
- El usuario solo podrá acceder desde esa ubicación
- Deja vacío para permitir acceso desde cualquier ubicación

## 💡 Consejos

- **Usa grupos**: Organiza usuarios en grupos para facilitar la gestión
- **Revisa permisos**: Asegúrate de asignar solo los permisos necesarios
- **Períodos de validez**: Establece períodos de validez para cuentas temporales
- **Exporta regularmente**: Mantén copias de seguridad de los datos de usuarios

## ⚠️ Notas Importantes

- Los cambios se guardan inmediatamente
- Algunas acciones requieren permisos de administrador
- La eliminación de usuarios es permanente
- Los usuarios inactivos no pueden iniciar sesión

---

**Siguiente**: [Authoritas](./authoritas.md)
