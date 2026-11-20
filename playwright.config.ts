import { defineConfig, devices } from '@playwright/test';

try {
  process.loadEnvFile('.env.e2e');
} catch {
  // El archivo es opcional: sin él se usan los valores por defecto.
}

const testUrl = process.env['E2E_TEST_BASE_URL'] ?? 'http://localhost:4200';
const prodUrl = process.env['E2E_PROD_BASE_URL'];
const isLocal = new URL(testUrl).hostname === 'localhost';

// El project `prod` falla con un mensaje claro si falta su URL, en vez de
// navegar a una dirección vacía.
const runsProd = process.argv.some((arg) => arg === 'prod' || arg === '--project=prod');
if (runsProd && !prodUrl) {
  throw new Error('Falta E2E_PROD_BASE_URL (defínela en .env.e2e) para ejecutar el project "prod".');
}

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'tmp/playwright/results',
  // El backend permite una sola sesión por usuario (un login nuevo invalida el token anterior con
  // 401 "Sesión inválida") y las pruebas contra la API real comparten la cuenta E2E_USER: en paralelo
  // se invalidarían entre sí.
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'tmp/playwright/report', open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    headless: true,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'test', use: { baseURL: testUrl } },
    // Solo lectura y navegación: las que escriben datos llevan @write y las de desarrollo (/kit), @dev.
    { name: 'prod', use: { baseURL: prodUrl }, grepInvert: /@write|@dev/ },
  ],
  webServer: isLocal
    ? { command: 'npm start', url: testUrl, reuseExistingServer: true, timeout: 120_000 }
    : undefined,
});
