#!/bin/bash

# Script para capturar pantallas de Enciclo Control 5.0
# Requiere: playwright, chromium/chrome

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
BASE_URL="${BASE_URL:-http://localhost:3000}"
SCREENSHOTS_DIR="./public/screenshots"
USERNAME="${USERNAME:-admin}"
PASSWORD="${PASSWORD:-password}"

echo -e "${BLUE}=== Script de Captura de Pantallas - Enciclo Control 5.0 ===${NC}\n"

# Crear directorio de capturas si no existe
mkdir -p "$SCREENSHOTS_DIR"

# Verificar si playwright está instalado
if ! command -v playwright &> /dev/null; then
    echo -e "${YELLOW}Playwright no está instalado. Instalando...${NC}"
    npm install -g playwright
    playwright install chromium
fi

# Crear script temporal de Node.js para capturas
cat > /tmp/capture-screenshots.js << 'EOF'
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const USERNAME = process.env.USERNAME || 'admin';
const PASSWORD = process.env.PASSWORD || 'password';
const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR || './public/screenshots';

// Crear directorio si no existe
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('📸 Iniciando capturas de pantalla...\n');

    // 1. Página de Login
    console.log('1. Capturando página de Login...');
    await page.goto(`${BASE_URL}/auth/login`);
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '01-login.png'),
      fullPage: true 
    });
    console.log('   ✓ Login capturado\n');

    // 2. Login (con formulario lleno)
    console.log('2. Capturando formulario de login lleno...');
    await page.fill('input[placeholder*="Username"], input[type="text"]', USERNAME);
    await page.fill('input[type="password"]', PASSWORD);
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '02-login-filled.png'),
      fullPage: true 
    });
    console.log('   ✓ Formulario lleno capturado\n');

    // 3. Dashboard
    console.log('3. Capturando Dashboard...');
    await page.click('button[type="submit"], button:has-text("Login")');
    await page.waitForURL('**/');
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '03-dashboard.png'),
      fullPage: true 
    });
    console.log('   ✓ Dashboard capturado\n');

    // 4. Estadísticas - Sesiones
    console.log('4. Capturando Estadísticas - Sesiones...');
    await page.goto(`${BASE_URL}/stats/sessions`);
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '04-estadisticas-sesiones.png'),
      fullPage: true 
    });
    console.log('   ✓ Sesiones capturado\n');

    // 5. Estadísticas - Páginas
    console.log('5. Capturando Estadísticas - Páginas...');
    await page.goto(`${BASE_URL}/stats/pages`);
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '05-estadisticas-paginas.png'),
      fullPage: true 
    });
    console.log('   ✓ Páginas capturado\n');

    // 6. Estadísticas - Queries
    console.log('6. Capturando Estadísticas - Queries...');
    await page.goto(`${BASE_URL}/stats/queries`);
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '06-estadisticas-queries.png'),
      fullPage: true 
    });
    console.log('   ✓ Queries capturado\n');

    // 7. Estadísticas - Impresiones
    console.log('7. Capturando Estadísticas - Impresiones...');
    await page.goto(`${BASE_URL}/stats/prints`);
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '07-estadisticas-impresiones.png'),
      fullPage: true 
    });
    console.log('   ✓ Impresiones capturado\n');

    // 8. Usuarios
    console.log('8. Capturando Gestión de Usuarios...');
    await page.goto(`${BASE_URL}/users`);
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '08-usuarios.png'),
      fullPage: true 
    });
    console.log('   ✓ Usuarios capturado\n');

    // 9. Usuarios - Diálogo Nuevo
    console.log('9. Capturando Diálogo de Nuevo Usuario...');
    await page.click('button:has-text("Nuevo")');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '09-usuarios-nuevo.png'),
      fullPage: true 
    });
    await page.click('button:has-text("Cancelar"), button:has-text("Cerrar")');
    await page.waitForTimeout(1000);
    console.log('   ✓ Diálogo nuevo usuario capturado\n');

    // 10. Pregúntame (Listado)
    console.log('10. Capturando Pregúntame (Listado)...');
    await page.goto(`${BASE_URL}/chat/list`);
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '10-preguntame-listado.png'),
      fullPage: true 
    });
    console.log('   ✓ Pregúntame listado capturado\n');

    // 11. Repositorio
    console.log('11. Capturando Repositorio...');
    await page.goto(`${BASE_URL}/repositorio/`);
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '11-repositorio.png'),
      fullPage: true 
    });
    console.log('   ✓ Repositorio capturado\n');

    // 12. Portada
    console.log('12. Capturando Portada...');
    await page.goto(`${BASE_URL}/portada`);
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '12-portada.png'),
      fullPage: true 
    });
    console.log('   ✓ Portada capturado\n');

    // 13. Metas
    console.log('13. Capturando Metas...');
    await page.goto(`${BASE_URL}/metas`);
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, '13-metas.png'),
      fullPage: true 
    });
    console.log('   ✓ Metas capturado\n');

    console.log('✅ Todas las capturas completadas exitosamente!');
    console.log(`📁 Las capturas están en: ${SCREENSHOTS_DIR}`);

  } catch (error) {
    console.error('❌ Error durante la captura:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
EOF

# Ejecutar el script de captura
echo -e "${GREEN}Ejecutando capturas de pantalla...${NC}\n"
BASE_URL="$BASE_URL" USERNAME="$USERNAME" PASSWORD="$PASSWORD" SCREENSHOTS_DIR="$SCREENSHOTS_DIR" node /tmp/capture-screenshots.js

# Limpiar archivo temporal
rm /tmp/capture-screenshots.js

echo -e "\n${GREEN}✅ Proceso completado!${NC}"
