import { expect, test } from './support/test';
import { takeScreenshot } from './support/screenshot';

test('la app carga sin errores en consola', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page.locator('app-root')).toBeAttached();
  await takeScreenshot(page, testInfo, 'home');
  expect(errors).toEqual([]);
});
