# Manual de Usuario - Enciclo Control 5.0

Este directorio contiene el manual de usuario de Enciclo Control 5.0, construido con VitePress.

## 🚀 Inicio Rápido

Para una guía completa paso a paso, consulta **[GUIA_INSTALACION.md](./GUIA_INSTALACION.md)**

## 📦 Instalación Rápida

```bash
cd doc/manual
npm install
```

## 🚀 Desarrollo

Para ver el manual en modo desarrollo:

```bash
npm run dev
```

El manual estará disponible en `http://localhost:5173`

## 🏗️ Construcción

Para generar la versión de producción:

```bash
npm run build
```

Los archivos generados estarán en `.vitepress/dist`

## 👀 Vista Previa

Para previsualizar la versión construida:

```bash
npm run preview
```

## 📁 Estructura

```
doc/manual/
├── .vitepress/
│   └── config.js          # Configuración de VitePress
├── index.md               # Página principal
├── acceso.md              # Acceso a la aplicación
├── dashboard.md           # Dashboard
├── estadisticas.md        # Estadísticas generales
├── usuarios.md            # Gestión de usuarios
├── authoritas.md          # Herramientas Authoritas
├── utilidades.md          # Utilidades
├── package.json           # Dependencias
└── README.md              # Este archivo
```

## 📸 Capturas de Pantalla

Las capturas de pantalla deben colocarse en:

```
doc/manual/public/screenshots/
```

Para generar capturas de pantalla, consulta:
- **[GUIA_INSTALACION.md](./GUIA_INSTALACION.md)** - Sección "Generación de Capturas de Pantalla"
- **[INSTRUCCIONES_CAPTURAS.md](./INSTRUCCIONES_CAPTURAS.md)** - Instrucciones detalladas

O usa el script proporcionado:

```bash
npm run screenshots
# o
./scripts/capture-screenshots.sh
```

## 📝 Agregar Nuevo Contenido

1. Crea un nuevo archivo `.md` en el directorio raíz
2. Agrega la entrada correspondiente en `.vitepress/config.js` en la sección `sidebar`
3. Usa enlaces relativos para navegar entre páginas

## 📚 Documentación Adicional

- **[GUIA_INSTALACION.md](./GUIA_INSTALACION.md)** - Guía completa de instalación y uso
- **[INSTRUCCIONES_CAPTURAS.md](./INSTRUCCIONES_CAPTURAS.md)** - Instrucciones para capturas de pantalla
- **[RESUMEN.md](./RESUMEN.md)** - Resumen del estado del proyecto

## 🔗 Enlaces Externos

- [Documentación de VitePress](https://vitepress.dev/)
- [Guía de Markdown](https://www.markdownguide.org/)
- [Documentación de Playwright](https://playwright.dev/)
