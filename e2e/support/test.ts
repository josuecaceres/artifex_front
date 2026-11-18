import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';

/**
 * `test` de las pruebas e2e. Desactiva el acceso automático de desarrollo
 * (`src/environments/dev-login.ts`) para que cada prueba decida si hay sesión:
 * sin esto, la app iniciaría sesión sola y las pruebas "sin sesión" dependerían
 * de las credenciales locales y de que el backend responda.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => localStorage.setItem('app-dev-login', 'off'));
    await use(page);
  },
});
