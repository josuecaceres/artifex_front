import { expect, test } from './support/test';
import { takeScreenshot } from './support/screenshot';

// Estas pruebas no llaman a la API: cubren la pantalla y su validación. El
// inicio de sesión real contra el backend se agrega cuando la IP de desarrollo
// esté autorizada (ver CLAUDE.md).

test('el login muestra el formulario de acceso', async ({ page }, testInfo) => {
  await page.goto('/auth/login');

  await expect(
    page.getByRole('heading', { name: 'Iniciar sesión' }),
  ).toBeVisible();
  await expect(page.getByLabel('Usuario')).toBeVisible();
  await expect(page.getByLabel('Contraseña', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: '¿Olvidaste tu contraseña?' }),
  ).toBeVisible();
  await takeScreenshot(page, testInfo, 'login');
});

test('con los campos vacíos muestra los errores y no navega', async ({
  page,
}) => {
  await page.goto('/auth/login');

  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByText('Ingresa tu usuario.')).toBeVisible();
  await expect(page.getByText('Ingresa tu contraseña.')).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/login$/);
});

test('el botón del ojo muestra y oculta la contraseña', async ({ page }) => {
  await page.goto('/auth/login');
  const password = page.getByLabel('Contraseña', { exact: true });

  await page.getByRole('button', { name: 'Mostrar contraseña' }).click();
  await expect(password).toHaveAttribute('type', 'text');

  await page.getByRole('button', { name: 'Ocultar contraseña' }).click();
  await expect(password).toHaveAttribute('type', 'password');
});

test('"¿Olvidaste tu contraseña?" lleva a la recuperación', async ({
  page,
}) => {
  await page.goto('/auth/login');

  await page.getByRole('link', { name: '¿Olvidaste tu contraseña?' }).click();

  await expect(page).toHaveURL(/\/auth\/forgot-password$/);
});

test('el login se ve bien en tema oscuro y en pantalla angosta', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/auth/login');
  await takeScreenshot(page, testInfo, 'login-oscuro');

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  await takeScreenshot(page, testInfo, 'login-movil');
});
