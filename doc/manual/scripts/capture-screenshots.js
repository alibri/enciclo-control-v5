// Script de Node.js para capturar pantallas usando Playwright
// Uso: node capture-screenshots.js

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const USERNAME = process.env.USERNAME || 'admin';
const PASSWORD = process.env.PASSWORD || 'password';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'public', 'screenshots');

// Crear directorio si no existe
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const screenshots = [
  {
    name: '01-login.png',
    url: '/auth/login',
    description: 'Página de Login',
    waitFor: 2000,
    actions: []
  },
  {
    name: '02-login-filled.png',
    url: '/auth/login',
    description: 'Formulario de Login lleno',
    waitFor: 1000,
    actions: [
      { type: 'fill', selector: 'input[type="text"], input[placeholder*="Username"]', value: USERNAME },
      { type: 'fill', selector: 'input[type="password"]', value: PASSWORD }
    ]
  },
  {
    name: '03-dashboard.png',
    url: '/',
    description: 'Dashboard principal',
    waitFor: 3000,
    actions: [
      { type: 'click', selector: 'button[type="submit"], button:has-text("Login")' },
      { type: 'waitForURL', pattern: '**/' }
    ]
  },
  {
    name: '04-estadisticas-sesiones.png',
    url: '/stats/sessions',
    description: 'Estadísticas - Sesiones',
    waitFor: 3000,
    actions: []
  },
  {
    name: '05-estadisticas-paginas.png',
    url: '/stats/pages',
    description: 'Estadísticas - Páginas',
    waitFor: 3000,
    actions: []
  },
  {
    name: '06-estadisticas-queries.png',
    url: '/stats/queries',
    description: 'Estadísticas - Queries',
    waitFor: 3000,
    actions: []
  },
  {
    name: '07-estadisticas-impresiones.png',
    url: '/stats/prints',
    description: 'Estadísticas - Impresiones',
    waitFor: 3000,
    actions: []
  },
  {
    name: '08-usuarios.png',
    url: '/users',
    description: 'Gestión de Usuarios',
    waitFor: 3000,
    actions: []
  },
  {
    name: '09-usuarios-nuevo.png',
    url: '/users',
    description: 'Diálogo de Nuevo Usuario',
    waitFor: 2000,
    actions: [
      { type: 'click', selector: 'button:has-text("Nuevo")' },
      { type: 'waitFor', selector: 'dialog, .p-dialog' }
    ],
    closeDialog: true
  },
  {
    name: '10-preguntame-listado.png',
    url: '/chat/list',
    description: 'Pregúntame (Listado)',
    waitFor: 3000,
    actions: []
  },
  {
    name: '11-repositorio.png',
    url: '/repositorio/',
    description: 'Repositorio de Documentos',
    waitFor: 3000,
    actions: []
  },
  {
    name: '12-portada.png',
    url: '/portada',
    description: 'Editor de Portada',
    waitFor: 3000,
    actions: []
  },
  {
    name: '13-metas.png',
    url: '/metas',
    description: 'Configuración de Metas',
    waitFor: 3000,
    actions: []
  }
];

async function captureScreenshots() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Ralentizar acciones para mejor captura
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });
  
  const page = await context.newPage();
  let isLoggedIn = false;

  try {
    console.log('📸 Iniciando capturas de pantalla...\n');

    for (const screenshot of screenshots) {
      console.log(`📷 ${screenshot.description}...`);
      
      // Navegar a la URL
      await page.goto(`${BASE_URL}${screenshot.url}`);
      await page.waitForTimeout(1000);

      // Ejecutar acciones
      for (const action of screenshot.actions) {
        try {
          switch (action.type) {
            case 'fill':
              await page.fill(action.selector, action.value);
              break;
            case 'click':
              await page.click(action.selector);
              break;
            case 'waitFor':
              await page.waitForSelector(action.selector);
              break;
            case 'waitForURL':
              await page.waitForURL(action.pattern);
              break;
          }
          await page.waitForTimeout(500);
        } catch (error) {
          console.warn(`   ⚠️  Acción fallida: ${action.type}`, error.message);
        }
      }

      // Esperar tiempo adicional
      await page.waitForTimeout(screenshot.waitFor);

      // Capturar pantalla
      const screenshotPath = path.join(SCREENSHOTS_DIR, screenshot.name);
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      console.log(`   ✓ Guardado: ${screenshot.name}\n`);

      // Cerrar diálogo si es necesario
      if (screenshot.closeDialog) {
        try {
          await page.click('button:has-text("Cancelar"), button:has-text("Cerrar"), .p-dialog-header-close');
          await page.waitForTimeout(1000);
        } catch (error) {
          // Ignorar si no hay diálogo
        }
      }

      // Marcar como logueado después del login
      if (screenshot.url === '/' && !isLoggedIn) {
        isLoggedIn = true;
      }
    }

    console.log('✅ Todas las capturas completadas exitosamente!');
    console.log(`📁 Las capturas están en: ${SCREENSHOTS_DIR}`);

  } catch (error) {
    console.error('❌ Error durante la captura:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  captureScreenshots().catch(console.error);
}

module.exports = { captureScreenshots };
