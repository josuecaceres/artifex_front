import { expect, test } from './support/test';
import { takeScreenshot } from './support/screenshot';

test('sin sesión, /dashboard lleva al login y recuerda la dirección', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/auth\/login\?returnUrl=%2Fdashboard$/);
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
});

test('con sesión, /dashboard muestra el panel', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('app-token', 'prueba'));

  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Panel operativo' })).toBeVisible();
});

test('una dirección inexistente lleva a /not-found', async ({ page }, testInfo) => {
  await page.goto('/esto-no-existe');

  await expect(page).toHaveURL(/\/not-found$/);
  await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible();
  await takeScreenshot(page, testInfo, 'not-found');
});

test('/not-authorized es pública', async ({ page }) => {
  await page.goto('/not-authorized');

  await expect(page).toHaveURL(/\/not-authorized$/);
  await expect(page.getByRole('heading', { name: 'No tienes acceso' })).toBeVisible();
});
