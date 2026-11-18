import { expect, test } from './support/test';

// Contra la API real. Las credenciales salen de E2E_USER y E2E_PASSWORD (en
// .env.e2e, ignorado por git); sin ellas estas pruebas se omiten. Iniciar sesión
// no crea ni modifica datos, así que no llevan @write.
const user = process.env['E2E_USER'];
const password = process.env['E2E_PASSWORD'];

test.describe('login contra la API real', () => {
  test.skip(!user || !password, 'Faltan E2E_USER y E2E_PASSWORD en .env.e2e');

  test('con credenciales válidas entra al dashboard', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByLabel('Usuario').fill(user!);
    await page.getByLabel('Contraseña', { exact: true }).fill(password!);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Panel operativo' })).toBeVisible();
  });

  test('vuelve a la dirección que se pidió antes de entrar', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login\?returnUrl=%2Fdashboard$/);

    await page.getByLabel('Usuario').fill(user!);
    await page.getByLabel('Contraseña', { exact: true }).fill(password!);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('con una contraseña incorrecta muestra el error del backend', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByLabel('Usuario').fill(user!);
    await page.getByLabel('Contraseña', { exact: true }).fill('contraseña-incorrecta');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByRole('alert')).toContainText('Credenciales inválidas');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
