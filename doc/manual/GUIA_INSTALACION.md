# Guía de Instalación y Uso del Manual de Usuario

Esta guía te llevará paso a paso a través de todo el proceso de instalación, configuración y uso del manual de usuario de Enciclo Control 5.0.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación Inicial](#instalación-inicial)
3. [Configuración](#configuración)
4. [Generación de Capturas de Pantalla](#generación-de-capturas-de-pantalla)
5. [Desarrollo Local](#desarrollo-local)
6. [Construcción para Producción](#construcción-para-producción)
7. [Despliegue](#despliegue)
8. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Requisitos Previos

### Software Necesario

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js** (versión 18 o superior)
   ```bash
   node --version
   # Debe mostrar v18.x.x o superior
   ```

2. **npm** (viene con Node.js)
   ```bash
   npm --version
   ```

3. **Git** (opcional, para control de versiones)
   ```bash
   git --version
   ```

### Aplicación Enciclo Control 5.0

- La aplicación debe estar ejecutándose y accesible
- Debes tener credenciales de acceso válidas
- La URL base debe ser conocida (ej: `http://localhost:3000`)

---

## 📦 Instalación Inicial

### Paso 1: Navegar al Directorio

```bash
cd /var/www/enciclo-control-v5/doc/manual
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

Este comando instalará:
- VitePress (framework de documentación)
- Playwright (para capturas de pantalla automáticas)
- Otras dependencias necesarias

**Tiempo estimado**: 2-5 minutos

### Paso 3: Verificar la Instalación

```bash
npm run dev
```

Si todo está correcto, deberías ver:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Presiona `Ctrl+C` para detener el servidor.

---

## ⚙️ Configuración

### Configuración de VitePress

El archivo `.vitepress/config.js` contiene la configuración principal. Puedes modificar:

- **Título**: Cambia `title` para modificar el título del manual
- **Base URL**: Cambia `base` si vas a desplegar en una ruta diferente
- **Sidebar**: Modifica `sidebar` para cambiar la navegación

### Configuración de Variables de Entorno

Para las capturas de pantalla, configura estas variables:

```bash
export BASE_URL="http://localhost:3000"
export USERNAME="tu_usuario"
export PASSWORD="tu_contraseña"
```

O crea un archivo `.env`:

```bash
BASE_URL=http://localhost:3000
USERNAME=tu_usuario
PASSWORD=tu_contraseña
```

---

## 📸 Generación de Capturas de Pantalla

### Método 1: Script Automático (Recomendado)

#### Paso 1: Instalar Playwright

```bash
npx playwright install chromium
```

**Tiempo estimado**: 2-3 minutos

#### Paso 2: Configurar Variables

```bash
export BASE_URL="http://localhost:3000"
export USERNAME="admin"
export PASSWORD="tu_contraseña"
```

#### Paso 3: Ejecutar el Script

**Opción A - Usando npm script:**
```bash
npm run screenshots
```

**Opción B - Usando script bash:**
```bash
chmod +x scripts/capture-screenshots.sh
./scripts/capture-screenshots.sh
```

**Opción C - Usando Node.js directamente:**
```bash
node scripts/capture-screenshots.js
```

#### Paso 4: Verificar las Capturas

Las capturas se guardarán en:
```
public/screenshots/
```

Deberías tener 13 archivos:
- `01-login.png`
- `02-login-filled.png`
- `03-dashboard.png`
- `04-estadisticas-sesiones.png`
- `05-estadisticas-paginas.png`
- `06-estadisticas-queries.png`
- `07-estadisticas-impresiones.png`
- `08-usuarios.png`
- `09-usuarios-nuevo.png`
- `10-preguntame-listado.png`
- `11-repositorio.png`
- `12-portada.png`
- `13-metas.png`

### Método 2: Captura Manual

Si prefieres capturar manualmente, sigue estos pasos:

#### Paso 1: Preparar el Entorno

1. Abre la aplicación en tu navegador
2. Ajusta la ventana a 1920x1080 píxeles
3. Usa el modo claro (no oscuro)

#### Paso 2: Capturar Cada Pantalla

Sigue la lista en `INSTRUCCIONES_CAPTURAS.md`:

1. Navega a cada página
2. Captura la pantalla completa
3. Guarda con el nombre exacto (ej: `01-login.png`)
4. Coloca en `public/screenshots/`

#### Paso 3: Optimizar Imágenes

```bash
# Instalar herramienta de optimización (opcional)
npm install -g imagemin-cli

# Optimizar todas las imágenes
imagemin public/screenshots/*.png --out-dir=public/screenshots/optimized
```

---

## 🛠️ Desarrollo Local

### Paso 1: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

### Paso 2: Abrir en el Navegador

Abre tu navegador y ve a:
```
http://localhost:5173
```

### Paso 3: Editar Contenido

1. Edita cualquier archivo `.md` en el directorio raíz
2. Los cambios se reflejarán automáticamente en el navegador
3. VitePress tiene hot-reload, no necesitas recargar manualmente

### Paso 4: Ver Cambios

- Los cambios en `.md` se ven inmediatamente
- Los cambios en `.vitepress/config.js` requieren reiniciar el servidor
- Las nuevas capturas se ven al recargar la página

### Estructura de Edición

```
doc/manual/
├── index.md          # Edita la página principal
├── acceso.md         # Edita la sección de acceso
├── dashboard.md      # Edita la sección de dashboard
└── ...               # Edita otras secciones
```

### Agregar Nuevas Secciones

1. Crea un nuevo archivo `.md`:
   ```bash
   touch nueva-seccion.md
   ```

2. Agrega contenido en Markdown

3. Actualiza `.vitepress/config.js`:
   ```javascript
   sidebar: [
     // ... otras secciones
     {
       text: 'Nueva Sección',
       items: [
         { text: 'Título', link: '/nueva-seccion' }
       ]
     }
   ]
   ```

---

## 🏗️ Construcción para Producción

### Paso 1: Construir el Manual

```bash
npm run build
```

Este comando:
- Compila todos los archivos Markdown
- Genera HTML estático
- Optimiza recursos
- Crea la estructura en `.vitepress/dist/`

**Tiempo estimado**: 30-60 segundos

### Paso 2: Verificar la Construcción

```bash
npm run preview
```

Esto iniciará un servidor local para previsualizar la versión construida:
```
  ➜  Local:   http://localhost:4173/
```

### Paso 3: Revisar el Contenido

1. Navega por todas las secciones
2. Verifica que las imágenes se carguen correctamente
3. Comprueba que los enlaces funcionen
4. Revisa la búsqueda

### Paso 4: Verificar el Tamaño

```bash
du -sh .vitepress/dist
```

El tamaño debería ser razonable (generalmente < 10MB con imágenes).

---

## 🚀 Despliegue

### Opción 1: Despliegue Estático

#### Paso 1: Copiar Archivos

```bash
# Copiar el contenido de dist a tu servidor web
scp -r .vitepress/dist/* usuario@servidor:/ruta/destino/
```

#### Paso 2: Configurar Servidor Web

**Nginx:**
```nginx
server {
    listen 80;
    server_name ejemplo.com;
    root /ruta/destino;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Apache:**
```apache
<VirtualHost *:80>
    ServerName ejemplo.com
    DocumentRoot /ruta/destino

    <Directory /ruta/destino>
        AllowOverride All
        Require all granted
    </Directory>

    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /index.html [QSA,L]
</VirtualHost>
```

### Opción 2: GitHub Pages

#### Paso 1: Configurar GitHub Actions

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy Manual

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd doc/manual && npm install
      - run: cd doc/manual && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./doc/manual/.vitepress/dist
```

#### Paso 2: Configurar Base URL

En `.vitepress/config.js`:
```javascript
base: '/nombre-repositorio/manual/'
```

### Opción 3: Netlify/Vercel

#### Netlify

1. Conecta tu repositorio
2. Configuración de build:
   - **Build command**: `cd doc/manual && npm install && npm run build`
   - **Publish directory**: `doc/manual/.vitepress/dist`

#### Vercel

1. Instala Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Despliega:
   ```bash
   cd doc/manual
   vercel
   ```

---

## 🔍 Solución de Problemas

### Problema: `npm install` falla

**Solución:**
```bash
# Limpiar caché
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problema: Playwright no instala Chromium

**Solución:**
```bash
# Instalar manualmente
npx playwright install chromium --with-deps

# O instalar todos los navegadores
npx playwright install
```

### Problema: Las capturas están vacías

**Solución:**
1. Verifica que la aplicación esté ejecutándose
2. Verifica las credenciales (USERNAME, PASSWORD)
3. Aumenta el tiempo de espera en el script
4. Verifica que la URL base sea correcta

### Problema: El servidor no inicia

**Solución:**
```bash
# Verificar que el puerto 5173 esté libre
lsof -i :5173

# Usar otro puerto
npm run dev -- --port 3001
```

### Problema: Las imágenes no se cargan

**Solución:**
1. Verifica que las imágenes estén en `public/screenshots/`
2. Verifica los nombres de archivo (deben coincidir exactamente)
3. Verifica las rutas en los archivos `.md` (deben ser `/screenshots/...`)

### Problema: La búsqueda no funciona

**Solución:**
```bash
# Reconstruir el índice de búsqueda
npm run build
```

### Problema: Errores de compilación

**Solución:**
```bash
# Verificar sintaxis Markdown
# Usar un validador online o:
npm install -g markdownlint-cli
markdownlint *.md
```

---

## 📝 Checklist de Verificación

Antes de considerar el manual completo, verifica:

### Contenido
- [ ] Todas las secciones tienen contenido
- [ ] Los enlaces internos funcionan
- [ ] Las referencias a capturas están correctas
- [ ] No hay errores de ortografía

### Capturas de Pantalla
- [ ] Las 13 capturas están presentes
- [ ] Las imágenes se cargan correctamente
- [ ] Las imágenes están optimizadas (< 500KB cada una)
- [ ] Los nombres de archivo son correctos

### Funcionalidad
- [ ] El servidor de desarrollo funciona
- [ ] La construcción para producción funciona
- [ ] La búsqueda funciona
- [ ] La navegación funciona en todos los dispositivos

### Despliegue
- [ ] El manual se ve correctamente en producción
- [ ] Todas las rutas funcionan
- [ ] Las imágenes se cargan en producción
- [ ] El SEO está configurado correctamente

---

## 🎯 Comandos Rápidos de Referencia

```bash
# Instalación
npm install
npx playwright install chromium

# Desarrollo
npm run dev

# Capturas
npm run screenshots

# Construcción
npm run build
npm run preview

# Limpieza
rm -rf node_modules .vitepress/dist
```

---

## 📚 Recursos Adicionales

- **Documentación de VitePress**: https://vitepress.dev/
- **Guía de Markdown**: https://www.markdownguide.org/
- **Documentación de Playwright**: https://playwright.dev/
- **Optimización de Imágenes**: https://web.dev/fast/#optimize-your-images

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa esta guía completa
2. Consulta `INSTRUCCIONES_CAPTURAS.md` para problemas de capturas
3. Revisa `RESUMEN.md` para el estado del proyecto
4. Consulta la documentación oficial de VitePress
5. Contacta al equipo de desarrollo

---

**Última actualización**: 2024
**Versión**: 1.0.0
