import { expect, test } from './support/test';
import { takeScreenshot } from './support/screenshot';

// Fondo de página de cada tema (ver src/styles/theme/_palette.scss).
const PAGE_BACKGROUND = {
  light: 'rgb(229, 233, 239)',
  dark: 'rgb(5, 15, 27)',
} as const;

for (const scheme of ['light', 'dark'] as const) {
  test(`el kit usa la paleta del tema ${scheme} @dev`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await page.goto('/kit', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: 'Estados' })).toBeVisible();
    await expect(page.locator('body')).toHaveCSS(
      'background-color',
      PAGE_BACKGROUND[scheme],
    );
    await takeScreenshot(page, testInfo, `kit-${scheme}`);
    expect(errors).toEqual([]);
  });
}

test('el selector cambia el tema y recuerda la elección @dev', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/kit', { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    PAGE_BACKGROUND.light,
  );

  await page.getByRole('button', { name: 'Tema' }).click();
  await page.getByRole('menuitemradio', { name: 'Oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    PAGE_BACKGROUND.dark,
  );

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    PAGE_BACKGROUND.dark,
  );
});
