import type { Page } from '@playwright/test';
import { takeScreenshot } from './support/screenshot';
import { expect, test } from './support/test';

// Las tablas del dashboard (barra con buscador, columnas y exportar; acciones
// primero y fijas; títulos y encabezados; aviso de éxito). Se prueban con la
// API simulada (`page.route`) y una sesión falsa: no tocan datos ni usan la
// cuenta compartida (el backend permite una sola sesión por usuario).

const units = [
  { id: 1, name: 'Kilogramo', code: 'kg', is_active: true },
  { id: 2, name: 'Litro', code: 'l', is_active: true },
  { id: 3, name: 'Metro cúbico', code: 'm3', is_active: false },
];

async function openUnits(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('app-token', 'token-falso');
    localStorage.setItem(
      'app-user',
      JSON.stringify({ id: 1, name: 'M. Rojas', email: 'm@ejemplo.com' }),
    );
    localStorage.setItem('app-roles', JSON.stringify(['System Admin']));
  });
  await page.route('**/api/lista-unidades', (route) =>
    route.fulfill({ json: units }),
  );
  await page.route('**/api/crear-unidades', (route) =>
    route.fulfill({
      status: 201,
      json: { message: 'Unit created successfully' },
    }),
  );
  await page.goto('/dashboard/unidades');
  await expect(page.getByRole('row', { name: /Kilogramo/ })).toBeVisible();
}

test('la tabla tiene el buscador, "Columnas" y "Exportar", con el botón de crear junto al buscador', async ({
  page,
}, testInfo) => {
  await openUnits(page);

  const toolbar = page.locator('app-table-toolbar');
  await expect(
    toolbar.getByRole('button', { name: 'Nueva unidad' }),
  ).toBeVisible();
  await expect(
    toolbar.getByRole('textbox', { name: 'Buscar en la tabla' }),
  ).toBeVisible();
  await expect(toolbar.getByRole('button', { name: 'Columnas' })).toBeVisible();
  await expect(toolbar.getByRole('button', { name: 'Exportar' })).toBeEnabled();

  const create = await toolbar
    .getByRole('button', { name: 'Nueva unidad' })
    .boundingBox();
  const search = await toolbar.getByRole('textbox').boundingBox();
  const columns = await toolbar
    .getByRole('button', { name: 'Columnas' })
    .boundingBox();
  expect(create!.x).toBeLessThan(search!.x);
  expect(search!.x).toBeLessThan(columns!.x);
  await takeScreenshot(page, testInfo, 'tabla-barra');
});

test('el título y los encabezados van capitalizados y en negrita (no en mayúsculas)', async ({
  page,
}) => {
  await openUnits(page);

  const title = page.getByRole('heading', { name: 'Unidades de medida' });
  await expect(title).toHaveCSS('text-transform', 'none');
  const header = page.getByRole('columnheader', { name: 'Nombre' });
  await expect(header).toHaveCSS('text-transform', 'none');
  await expect(header).toHaveCSS('font-weight', '700');
});

test('el riel muestra los textos del menú tal cual, sin mayúsculas forzadas (la marca sí)', async ({
  page,
}, testInfo) => {
  await openUnits(page);

  // El grupo abierto es el de la pantalla activa (Inventario).
  const group = page.getByText('Inventario', { exact: true });
  await expect(group).toBeVisible();
  await expect(group).toHaveCSS('text-transform', 'none');
  await expect(group).toHaveCSS('font-size', '16px');
  const link = page.getByRole('link', { name: 'Unidades de medida' });
  await expect(link).toBeVisible();
  await expect(link).toHaveText('Unidades de medida');
  await expect(link.locator('.mdc-list-item__primary-text')).toHaveCSS(
    'text-transform',
    'none',
  );
  await expect(
    page.getByText('Usuarios del sistema', { exact: true }),
  ).toHaveCSS('text-transform', 'none');
  // La marca conserva las mayúsculas.
  await expect(page.getByText('Artifex', { exact: true }).first()).toHaveCSS(
    'text-transform',
    'uppercase',
  );
  await takeScreenshot(page, testInfo, 'riel-textos');
});

test('la columna "Acciones" es la primera y no tiene línea divisoria', async ({
  page,
}) => {
  await openUnits(page);

  const headers = page.getByRole('columnheader');
  await expect(headers.first()).toHaveText('Acciones');
  await expect(headers.first()).toHaveCSS('border-right-width', '0px');
  await expect(
    page.getByRole('button', { name: 'Editar Kilogramo' }),
  ).toBeVisible();
});

test('el buscador filtra, avisa si no hay resultados y se puede limpiar', async ({
  page,
}) => {
  await openUnits(page);
  const search = page.getByRole('textbox', { name: 'Buscar en la tabla' });

  await search.fill('LITRO');
  await expect(page.getByRole('row', { name: /Litro/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Kilogramo/ })).toHaveCount(0);

  // Sin distinguir tildes ni mayúsculas: "metro cubico" encuentra "Metro cúbico".
  await search.fill('metro cubico');
  await expect(page.getByRole('row', { name: /Metro cúbico/ })).toBeVisible();

  await search.fill('zzz');
  await expect(page.getByText('Sin resultados para «zzz».')).toBeVisible();

  await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
  await expect(search).toHaveValue('');
  await expect(page.getByRole('row', { name: /Kilogramo/ })).toBeVisible();
});

test('"Columnas" oculta y muestra columnas, y siempre deja una visible', async ({
  page,
}) => {
  await openUnits(page);

  await page.getByRole('button', { name: 'Columnas' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Código' }).click();
  // El menú sigue abierto tras marcar una.
  await expect(
    page.getByRole('menuitemcheckbox', { name: 'Activa' }),
  ).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Código' })).toHaveCount(
    0,
  );

  await page.getByRole('menuitemcheckbox', { name: 'Activa' }).click();
  await expect(
    page.getByRole('menuitemcheckbox', { name: 'Nombre' }),
  ).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('columnheader', { name: 'Nombre' }),
  ).toBeVisible();

  // Recargar vuelve a mostrar todas (no se guarda la elección).
  await page.reload();
  await expect(
    page.getByRole('columnheader', { name: 'Código' }),
  ).toBeVisible();
});

test('con poco ancho la tabla hace scroll horizontal y "Acciones" se queda fija', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 640, height: 800 });
  await openUnits(page);

  const container = page.locator('.page__table');
  const scrollable = await container.evaluate(
    (el) => el.scrollWidth > el.clientWidth,
  );
  expect(scrollable).toBe(true);

  const actions = page.getByRole('button', { name: 'Editar Kilogramo' });
  const before = await actions.boundingBox();
  await container.evaluate((el) => (el.scrollLeft = el.scrollWidth));
  const after = await actions.boundingBox();
  expect(after!.x).toBeCloseTo(before!.x, 0);
  await takeScreenshot(page, testInfo, 'tabla-scroll');
});

test('en pantallas anchas las tablas ocupan todo el ancho (sin margen lateral)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 900 });
  await openUnits(page);

  const table = await page.locator('.page__table').boundingBox();
  // Antes el contenido se limitaba a 1320 px y se centraba, dejando franjas a los lados.
  expect(table!.width).toBeGreaterThan(1500);
});

test('al crear muestra el aviso de éxito con el message de la API', async ({
  page,
}, testInfo) => {
  await openUnits(page);

  await page.getByRole('button', { name: 'Nueva unidad' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nombre').fill('Caja');
  await dialog.getByLabel('Código').fill('cj');
  await dialog.getByRole('button', { name: 'Guardar' }).click();

  const toast = page.locator('.app-toast');
  await expect(toast).toContainText('Unit created successfully');
  await takeScreenshot(page, testInfo, 'tabla-toast');

  await toast.getByRole('button', { name: 'Cerrar aviso' }).click();
  await expect(toast).toHaveCount(0);
});

test('mientras carga, el indicador queda centrado en el espacio de la tabla', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.addInitScript(() => {
    localStorage.setItem('app-token', 'token-falso');
    localStorage.setItem(
      'app-user',
      JSON.stringify({ id: 1, name: 'M. Rojas', email: 'm@ejemplo.com' }),
    );
  });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/api/lista-unidades', async (route) => {
    await gate;
    await route.fulfill({ json: units });
  });
  await page.goto('/dashboard/unidades');

  const spinner = page.locator('.page > mat-spinner');
  await expect(spinner).toBeVisible();
  const spinnerBox = (await spinner.boundingBox())!;
  const pageBox = (await page.locator('.page').boundingBox())!;
  const toolbarBox = (await page.locator('app-table-toolbar').boundingBox())!;

  // Más grande que antes (48 px) y centrado en horizontal respecto a su contenedor.
  expect(spinnerBox.width).toBeGreaterThanOrEqual(48);
  expect(spinnerBox.x + spinnerBox.width / 2).toBeCloseTo(
    pageBox.x + pageBox.width / 2,
    0,
  );
  // En vertical, en medio del espacio libre entre la barra de la tabla y el fondo de la página.
  const freeTop = toolbarBox.y + toolbarBox.height;
  const freeBottom = pageBox.y + pageBox.height;
  expect(spinnerBox.y + spinnerBox.height / 2).toBeGreaterThan(
    (freeTop + freeBottom) / 2 - 24,
  );
  expect(spinnerBox.y + spinnerBox.height / 2).toBeLessThan(
    (freeTop + freeBottom) / 2 + 24,
  );
  // La página llega hasta el fondo de la ventana (menos el padding de 32 px).
  expect(freeBottom).toBeGreaterThan(800 - 40);
  await takeScreenshot(page, testInfo, 'tabla-cargando');

  release();
  await expect(page.getByRole('row', { name: /Kilogramo/ })).toBeVisible();
  await expect(spinner).toHaveCount(0);
});
