#!/usr/bin/env node
/**
 * Toma capturas de pantalla de las rutas de la app para revisión visual. No
 * hace aserciones: solo guarda PNGs en tmp/visual-checks (ignorada por git)
 * para poder inspeccionarlos sin abrir un navegador.
 *
 * Requiere la app corriendo (`npm start`, puerto 4200 por defecto) y
 * Playwright instalado como dependencia de desarrollo.
 *
 * Uso:
 *   node scripts/visual-check.mjs [nombreRuta...]   # por defecto, todas las rutas de abajo
 *
 * Variables de entorno:
 *   APP_URL   por defecto http://localhost:4200
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const baseUrl = process.env.APP_URL ?? 'http://localhost:4200';
const outDir = join(import.meta.dirname, '..', 'tmp', 'visual-checks');

// Agregar una ruta aquí cada vez que se agregue una pantalla nueva.
// `name`: nombre del archivo de salida (<name>.png).
// `path`: ruta de la app, relativa a baseUrl.
// `steps` (opcional): selectores en los que se hace clic, en orden, antes de la captura
//   (por ejemplo, para abrir un modal o cambiar de pestaña).
// `viewportHeight` (opcional): alto del viewport, para páginas largas
//   (si el layout hace scroll dentro de su propio contenedor, `fullPage` no ayudaría).
const routes = [{ name: 'home', path: '/' }];

const requested = process.argv.slice(2);
const targets = requested.length
  ? routes.filter((r) => requested.includes(r.name))
  : routes;

if (requested.length && targets.length !== requested.length) {
  console.error(
    `Rutas desconocidas. Disponibles: ${routes.map((r) => r.name).join(', ')}`,
  );
  process.exit(1);
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.emulateMedia({ reducedMotion: 'reduce' });

for (const route of targets) {
  await page.setViewportSize({
    width: 1440,
    height: route.viewportHeight ?? 900,
  });
  await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  for (const selector of route.steps ?? []) {
    await page.click(selector);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  }

  const file = join(outDir, `${route.name}.png`);
  await page.screenshot({ path: file });
  console.log('guardado', file);
}

await browser.close();
