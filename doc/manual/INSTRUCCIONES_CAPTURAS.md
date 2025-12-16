# Instrucciones para Capturas de Pantalla

Este documento explica cómo generar las capturas de pantalla para el manual de usuario.

## 📋 Requisitos Previos

1. **Node.js** (versión 18 o superior)
2. **Playwright** instalado globalmente o localmente
3. La aplicación Enciclo Control 5.0 ejecutándose y accesible

## 🚀 Método 1: Script Automático (Recomendado)

### Instalación de Playwright

```bash
npm install -g playwright
playwright install chromium
```

O si prefieres instalarlo localmente en el proyecto:

```bash
cd doc/manual
npm install playwright
npx playwright install chromium
```

### Configuración

Edita el script `scripts/capture-screenshots.sh` o establece variables de entorno:

```bash
export BASE_URL="http://localhost:3000"
export USERNAME="tu_usuario"
export PASSWORD="tu_contraseña"
```

### Ejecución

```bash
cd doc/manual
chmod +x scripts/capture-screenshots.sh
./scripts/capture-screenshots.sh
```

O usando Node.js directamente:

```bash
cd doc/manual
BASE_URL="http://localhost:3000" \
USERNAME="tu_usuario" \
PASSWORD="tu_contraseña" \
node scripts/capture-screenshots.js
```

## 🖼️ Método 2: Captura Manual

Si prefieres capturar las pantallas manualmente, sigue estos pasos:

### 1. Preparación

- Abre la aplicación en tu navegador
- Ajusta la ventana a 1920x1080 píxeles
- Asegúrate de tener buena iluminación y contraste

### 2. Lista de Capturas Necesarias

1. **01-login.png** - Página de login vacía
2. **02-login-filled.png** - Formulario de login con datos
3. **03-dashboard.png** - Dashboard principal
4. **04-estadisticas-sesiones.png** - Listado de sesiones
5. **05-estadisticas-paginas.png** - Estadísticas de páginas
6. **06-estadisticas-queries.png** - Estadísticas de queries
7. **07-estadisticas-impresiones.png** - Estadísticas de impresiones
8. **08-usuarios.png** - Listado de usuarios
9. **09-usuarios-nuevo.png** - Diálogo de nuevo usuario
10. **10-preguntame-listado.png** - Listado de consultas Pregúntame
11. **11-repositorio.png** - Repositorio de documentos
12. **12-portada.png** - Editor de portada
13. **13-metas.png** - Configuración de metas

### 3. Herramientas Recomendadas

#### Navegador con Extensiones

- **Chrome/Edge**: Usa la extensión "Full Page Screen Capture"
- **Firefox**: Usa "FireShot" o "Nimbus Screenshot"

#### Herramientas de Escritorio

- **Linux**: `gnome-screenshot -f` o `scrot`
- **macOS**: `screencapture` (nativo) o herramientas como "CleanShot X"
- **Windows**: Herramienta de recorte nativa o "Greenshot"

#### Herramientas Online

- **Screenshot.guru**: Para capturas de páginas web completas
- **BrowserStack**: Para capturas en diferentes navegadores

### 4. Ubicación de Archivos

Guarda todas las capturas en:

```
doc/manual/public/screenshots/
```

### 5. Nomenclatura

Usa la nomenclatura exacta:
- `01-login.png`
- `02-login-filled.png`
- `03-dashboard.png`
- etc.

### 6. Formato y Calidad

- **Formato**: PNG (preferido) o JPG de alta calidad
- **Resolución**: Mínimo 1920x1080, preferiblemente más alta
- **Tamaño**: Optimiza las imágenes para web (máximo 500KB por imagen)
- **Calidad**: Alta calidad, sin compresión excesiva

## 🎨 Mejores Prácticas

### Antes de Capturar

1. **Limpia la interfaz**: Cierra notificaciones, pestañas innecesarias
2. **Datos de prueba**: Usa datos consistentes y realistas
3. **Estado consistente**: Asegúrate de que el estado de la aplicación sea el mismo en cada captura
4. **Modo claro**: Usa el modo claro (no oscuro) para mejor legibilidad en el manual

### Durante la Captura

1. **Captura completa**: Usa "full page" cuando sea posible
2. **Evita información sensible**: Oculta o reemplaza datos personales reales
3. **Consistencia**: Mantén el mismo nivel de zoom y tamaño de ventana
4. **Marcadores**: Si es necesario, añade círculos o flechas para destacar elementos

### Después de Capturar

1. **Revisa las imágenes**: Verifica que sean claras y legibles
2. **Optimiza**: Comprime las imágenes si son muy grandes
3. **Renombra**: Asegúrate de que los nombres sean correctos
4. **Actualiza el manual**: Agrega referencias a las capturas en los archivos .md

## 📝 Agregar Capturas al Manual

Para incluir una captura en el manual, usa la siguiente sintaxis:

```markdown
![Descripción de la imagen](/screenshots/01-login.png)
```

O con tamaño personalizado:

```markdown
<img src="/screenshots/01-login.png" alt="Página de Login" width="800"/>
```

## 🔧 Solución de Problemas

### Playwright no encuentra el navegador

```bash
npx playwright install chromium
```

### La aplicación no está accesible

- Verifica que la aplicación esté ejecutándose
- Verifica la URL en BASE_URL
- Verifica el firewall y permisos de red

### Las capturas están vacías o en negro

- Aumenta el tiempo de espera (`waitFor`) en el script
- Verifica que los selectores CSS sean correctos
- Asegúrate de que la página haya cargado completamente

### Errores de autenticación

- Verifica las credenciales (USERNAME y PASSWORD)
- Asegúrate de que el usuario tenga permisos adecuados
- Verifica que la sesión no haya expirado

## 📚 Recursos Adicionales

- [Documentación de Playwright](https://playwright.dev/)
- [Guía de Screenshots con Playwright](https://playwright.dev/docs/screenshots)
- [Optimización de Imágenes para Web](https://web.dev/fast/#optimize-your-images)

## ✅ Checklist Final

- [ ] Todas las capturas están en `public/screenshots/`
- [ ] Los nombres de archivo son correctos (01-13)
- [ ] Las imágenes están optimizadas (< 500KB cada una)
- [ ] Las capturas muestran la información relevante
- [ ] No hay información sensible visible
- [ ] Las referencias en los archivos .md están actualizadas
- [ ] El manual se ve correctamente con las capturas incluidas

---

**Nota**: Si encuentras problemas o necesitas ayuda, consulta la documentación de Playwright o contacta al equipo de desarrollo.
