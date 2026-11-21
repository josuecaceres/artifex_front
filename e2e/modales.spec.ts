import type { Page } from '@playwright/test';
import { takeScreenshot } from './support/screenshot';
import { expect, test } from './support/test';

// Diálogos de formulario del dashboard (columnas según los controles, espacio
// reservado para errores, interruptores al final, sin scroll innecesario),
// velo de "actualizando" y barra oculta cuando el módulo no está disponible.
// Todo con la API simulada (`page.route`) y una sesión falsa: no toca datos ni
// usa la cuenta compartida.

const sucursal = {
  id: 1,
  name: 'Sucursal Centro',
  phone: '22223333',
  email: 'centro@ejemplo.com',
  tipo_establecimiento: 1,
  tipo_establecimiento_name: 'Sucursal',
  departamento_id: 1,
  departamento_name: 'Francisco Morazán',
  municipio_id: 10,
  municipio_name: 'Distrito Central',
  complemento_direccion: 'Barrio El Centro',
  manager: null,
  manager_id: null,
  branch_code: 'S1',
  cod_estable_mh: '0001',
  cod_estable: '001',
  cod_pventa_mh: '0001',
  cod_pventa: '001',
  is_active: true,
};
const proveedor = {
  id: 1,
  name: 'Insumos S.A.',
  nit: '08011999123456',
  nrc: '123456',
  has_withholding: true,
  withholding_percent: 10,
  payment_name: 'Transferencia',
  departmento_id: 1,
  municipio_id: 10,
  address_complement: 'Col. Centro',
  phone: '22223333',
  email: 'p@ejemplo.com',
  contact_person: 'Juan',
  is_active: true,
};
const empresa = {
  id: 1,
  name: 'Empresa Legal S.A.',
  comercial_name: 'Empresa',
  nit: '08011999123456',
  nrc: '123456',
  activity_code: '47190',
  activity_description: 'Venta',
  email: 'e@ejemplo.com',
  phone: '22223333',
};
const usuario = {
  id: 1,
  name: 'M. Rojas',
  acronym: 'MROJAS',
  email: 'm@ejemplo.com',
  roles: ['Company Admin'],
  branch: 'Casa Matriz',
  branch_id: 1,
  authorized: true,
  is_active: true,
};
const unidad = { id: 1, name: 'Kilogramo', code: 'kg', is_active: true };

async function mockApi(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('app-token', 'token-falso');
    localStorage.setItem(
      'app-user',
      JSON.stringify({ id: 1, name: 'M. Rojas', email: 'm@ejemplo.com' }),
    );
    localStorage.setItem('app-roles', JSON.stringify(['System Admin']));
  });
  const json = (url: string, body: unknown) =>
    page.route(url, (route) => route.fulfill({ json: body }));
  await json('**/api/branches', [sucursal]);
  await json('**/api/lista-proveedores', [proveedor]);
  await json('**/api/info-empresa', [empresa]);
  await json('**/api/users', [usuario]);
  await json('**/api/lista-unidades', [unidad]);
  await json('**/api/lista-roles', [{ id: 1, name: 'Company Admin' }]);
  await json('**/api/roles-permisos', [
    { id: 1, name: 'Company Admin', permissions: [] },
  ]);
  await json('**/api/lista-permisos', [
    { id: 1, name: 'ver usuarios' },
    { id: 2, name: 'crear usuarios' },
  ]);
  await json('**/api/departamentos', [
    { id: 1, code: '01', name: 'Francisco Morazán' },
  ]);
  await json('**/api/departamentos/*/municipios', [
    { id: 10, name: 'Distrito Central' },
  ]);
  await json('**/api/tipo-establecimiento', [
    { id: 1, name: 'Sucursal' },
    { id: 2, name: 'Casa Matriz' },
  ]);
}

const dialog = (page: Page) => page.getByRole('dialog');

/** Columnas distintas que ocupan los campos del diálogo (por su posición horizontal). */
async function columnCount(page: Page): Promise<number> {
  const xs = await dialog(page)
    .locator('mat-form-field')
    .evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().left)),
    );
  return new Set(xs).size;
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockApi(page);
});

test('Sucursales: más de 10 controles van en tres columnas y no necesitan scroll', async ({
  page,
}, testInfo) => {
  await page.goto('/dashboard/sucursales');
  await page.getByRole('button', { name: 'Nueva sucursal' }).click();
  await expect(
    dialog(page).getByLabel('Nombre', { exact: true }),
  ).toBeVisible();

  expect(await columnCount(page)).toBe(3);
  const content = dialog(page).locator('mat-dialog-content');
  expect(
    await content.evaluate((el) => el.scrollHeight <= el.clientHeight),
  ).toBe(true);
  // El título va capitalizado.
  await expect(dialog(page).locator('h2')).toHaveCSS('text-transform', 'none');
  await expect(dialog(page).locator('h2')).toHaveText('Nueva sucursal');
  await takeScreenshot(page, testInfo, 'modal-sucursal');
});

test('Proveedores: tres columnas y todos los interruptores juntos al final', async ({
  page,
}, testInfo) => {
  await page.goto('/dashboard/proveedores');
  await page.getByRole('button', { name: 'Editar Insumos S.A.' }).click();
  await expect(
    dialog(page).getByLabel('Nombre', { exact: true }),
  ).toBeVisible();

  expect(await columnCount(page)).toBe(3);
  const switches = dialog(page).getByRole('switch');
  await expect(switches).toHaveCount(2);
  // Van después de todos los campos (más abajo que el último) y centrados entre sí en vertical.
  const lastField = await dialog(page)
    .locator('mat-form-field')
    .last()
    .boundingBox();
  const boxes = await switches.evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect().top),
  );
  expect(Math.min(...boxes)).toBeGreaterThan(
    lastField!.y + lastField!.height - 2,
  );
  expect(Math.abs(boxes[0] - boxes[1])).toBeLessThan(2);
  await takeScreenshot(page, testInfo, 'modal-proveedor');
});

test('Empresas: de 6 a 10 controles van en dos columnas, con aire entre filas', async ({
  page,
}, testInfo) => {
  await page.goto('/dashboard/empresas');
  await page.getByRole('button', { name: 'Editar Empresa' }).click();
  await expect(dialog(page).getByLabel('Nombre legal')).toBeVisible();

  expect(await columnCount(page)).toBe(2);
  // Entre un campo y el de abajo: la línea reservada para error/aviso más 10 px de respiro.
  const tops = await dialog(page)
    .locator('mat-form-field')
    .evaluateAll((els) =>
      els
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.left < 500)
        .map((r) => ({ top: r.top, bottom: r.bottom })),
    );
  expect(tops[1].top - tops[0].bottom).toBeGreaterThan(9.5); // el campo ya incluye su línea reservada
  expect(tops[1].top - tops[0].top).toBeGreaterThanOrEqual(76);
  await takeScreenshot(page, testInfo, 'modal-empresa');
  const content = dialog(page).locator('mat-dialog-content');
  expect(
    await content.evaluate((el) => el.scrollHeight <= el.clientHeight),
  ).toBe(true);
});

test('Usuarios: una columna al crear (5 controles) y dos al editar (7)', async ({
  page,
}) => {
  await page.goto('/dashboard/usuarios');
  await page.getByRole('button', { name: 'Nuevo usuario' }).click();
  await expect(dialog(page).getByLabel('Siglas')).toBeVisible();
  expect(await columnCount(page)).toBe(1);
  const createWidth = (await dialog(page).boundingBox())!.width;
  await dialog(page).getByRole('button', { name: 'Cancelar' }).click();
  await expect(dialog(page)).toHaveCount(0);

  await page.getByRole('button', { name: 'Editar M. Rojas' }).click();
  await expect(dialog(page).getByLabel('Siglas')).toBeVisible();
  expect(await columnCount(page)).toBe(2);
  expect((await dialog(page).boundingBox())!.width).toBeGreaterThan(
    createWidth + 150,
  );
  await expect(dialog(page).getByRole('switch')).toHaveCount(2);
});

test('el alto del diálogo no cambia cuando aparecen los errores de validación', async ({
  page,
}, testInfo) => {
  await page.goto('/dashboard/usuarios');
  await page.getByRole('button', { name: 'Nuevo usuario' }).click();
  await expect(dialog(page).getByLabel('Siglas')).toBeVisible();
  const before = (await dialog(page).boundingBox())!.height;

  await dialog(page).getByRole('button', { name: 'Guardar' }).click();
  await expect(dialog(page).getByText('Ingresa el nombre.')).toBeVisible();
  const after = (await dialog(page).boundingBox())!.height;

  expect(after).toBeCloseTo(before, 0);
  await takeScreenshot(page, testInfo, 'modal-usuario-errores');
});

test('Unidades: una columna, interruptor al final, sin scroll', async ({
  page,
}) => {
  await page.goto('/dashboard/unidades');
  await page.getByRole('button', { name: 'Editar Kilogramo' }).click();
  await expect(dialog(page).getByLabel('Código')).toBeVisible();

  expect(await columnCount(page)).toBe(1);
  const content = dialog(page).locator('mat-dialog-content');
  expect(
    await content.evaluate((el) => el.scrollHeight <= el.clientHeight),
  ).toBe(true);
  await expect(
    dialog(page).getByRole('switch', { name: 'Activa' }),
  ).toBeVisible();
});

test('en una ventana baja el diálogo hace scroll solo cuando no cabe', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 420 });
  await page.goto('/dashboard/sucursales');
  await page.getByRole('button', { name: 'Nueva sucursal' }).click();
  await expect(
    dialog(page).getByLabel('Nombre', { exact: true }),
  ).toBeVisible();

  const content = dialog(page).locator('mat-dialog-content');
  expect(
    await content.evaluate((el) => el.scrollHeight > el.clientHeight),
  ).toBe(true);
  const panel = await dialog(page).boundingBox();
  expect(panel!.height).toBeLessThanOrEqual(420);
});

test('Roles y permisos: nombre centrado, permisos en 3 columnas y solo la lista hace scroll', async ({
  page,
}, testInfo) => {
  const names = [
    'autorizar usuarios',
    'crear usuarios',
    'ver usuarios',
    'actualizar usuarios',
    ...Array.from({ length: 31 }, (_, i) => `ver módulo ${i + 1}`),
  ];
  await page.route('**/api/lista-permisos', (route) =>
    route.fulfill({
      json: names.map((name, i) => ({ id: i + 1, name })),
    }),
  );
  await page.goto('/dashboard/roles');
  await page.getByRole('button', { name: 'Nuevo rol' }).click();
  await expect(dialog(page).getByLabel('Nombre')).toBeVisible();
  const cards = dialog(page).locator('.rol-perm');
  await expect(cards).toHaveCount(35);

  // Título capitalizado, diálogo de 800 px y "Permisos Asignados" con su buscador.
  await expect(dialog(page).locator('h2')).toHaveCSS('text-transform', 'none');
  expect((await dialog(page).boundingBox())!.width).toBe(800);
  await expect(dialog(page).getByText('Permisos Asignados')).toBeVisible();
  const search = dialog(page).getByRole('textbox', { name: 'Buscar permiso' });
  await expect(search).toBeVisible();

  // Nombres con cada palabra en mayúscula.
  await expect(cards.first()).toContainText('Autorizar Usuarios');

  // Nombre centrado y más angosto que el diálogo.
  const box = (await dialog(page).boundingBox())!;
  const field = (await dialog(page).locator('.rol-name').boundingBox())!;
  expect(field.width).toBeLessThan(box.width - 200);
  expect(
    Math.abs(field.x + field.width / 2 - (box.x + box.width / 2)),
  ).toBeLessThan(4);

  // Tres columnas de tarjetas, centradas en el diálogo.
  const lefts = await cards.evaluateAll((els) =>
    els.map((el) => Math.round(el.getBoundingClientRect().left)),
  );
  expect(new Set(lefts).size).toBe(3);
  const rights = await cards.evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect().right),
  );
  const margenIzq = Math.min(...lefts) - box.x;
  const margenDer = box.x + box.width - Math.max(...rights);
  expect(Math.abs(margenIzq - margenDer)).toBeLessThan(20);

  // Solo la lista hace scroll (340 px); el contenido del diálogo no.
  const list = dialog(page).locator('.rol-list');
  expect((await list.boundingBox())!.height).toBe(340);
  expect(await list.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
    true,
  );
  const content = dialog(page).locator('mat-dialog-content');
  expect(
    await content.evaluate((el) => el.scrollHeight <= el.clientHeight),
  ).toBe(true);
  await takeScreenshot(page, testInfo, 'modal-roles');

  // Un clic en la tarjeta activa el permiso y cuenta en el total.
  const totals = dialog(page).locator('.rol-totals');
  await expect(totals).toContainText('Total permisos: 35');
  await cards.first().getByText('Autorizar Usuarios').click();
  await expect(
    dialog(page).getByRole('switch', { name: 'Autorizar Usuarios' }),
  ).toBeChecked();
  await expect(totals).toContainText('Total seleccionados: 1');

  // La búsqueda filtra sin cambiar el alto de la lista ni los totales.
  await search.fill('usuarios');
  await expect(cards).toHaveCount(4);
  expect((await list.boundingBox())!.height).toBe(340);
  await expect(totals).toContainText('Total permisos: 35');
  await takeScreenshot(page, testInfo, 'modal-roles-busqueda');
});

test('Roles y permisos: el icono de la columna Acciones es la lista', async ({
  page,
}) => {
  await page.goto('/dashboard/roles');
  const button = page.getByRole('button', { name: 'Editar Company Admin' });
  await expect(button).toBeVisible();
  await expect(button.locator('svg')).toHaveAttribute(
    'data-icon',
    'list-check',
  );
});

test('al recargar con datos, el velo va sobre la tabla y esta no se mueve', async ({
  page,
}, testInfo) => {
  let slow = false;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/api/lista-unidades', async (route) => {
    if (slow) {
      await gate;
    }
    await route.fulfill({ json: [unidad] });
  });
  await page.route('**/api/crear-unidades', (route) =>
    route.fulfill({
      status: 201,
      json: { message: 'Unit created successfully' },
    }),
  );
  await page.goto('/dashboard/unidades');
  const row = page.getByRole('row', { name: /Kilogramo/ });
  await expect(row).toBeVisible();
  const before = (await row.boundingBox())!;

  slow = true;
  await page.getByRole('button', { name: 'Nueva unidad' }).click();
  await dialog(page).getByLabel('Nombre').fill('Caja');
  await dialog(page).getByLabel('Código').fill('cj');
  await dialog(page).getByRole('button', { name: 'Guardar' }).click();

  const overlay = page.locator('.page__reload');
  await expect(overlay).toBeVisible();
  // La tabla sigue en su lugar y no hay un indicador suelto empujándola.
  const during = (await row.boundingBox())!;
  expect(during.y).toBeCloseTo(before.y, 0);
  await expect(page.locator('.page > mat-spinner')).toHaveCount(0);
  const table = (await page.locator('.page__table').boundingBox())!;
  const velo = (await overlay.boundingBox())!;
  expect(velo.x).toBeCloseTo(table.x, 0);
  expect(velo.width).toBeCloseTo(table.width, 0);
  await takeScreenshot(page, testInfo, 'tabla-actualizando');

  release();
  await expect(overlay).toHaveCount(0);
  await expect(row).toBeVisible();
});

test('si el módulo no está disponible (403) no hay barra de tabla ni botón de crear', async ({
  page,
}, testInfo) => {
  await page.route('**/api/lista-marcas', (route) =>
    route.fulfill({
      status: 403,
      json: { message: 'Tu plan no incluye módulo de inventario.' },
    }),
  );
  await page.goto('/dashboard/marcas');

  await expect(
    page.getByText('Tu plan no incluye módulo de inventario.'),
  ).toBeVisible();
  await expect(page.locator('app-table-toolbar')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Nueva marca' })).toHaveCount(
    0,
  );
  await expect(page.getByRole('heading', { name: 'Marcas' })).toBeVisible();
  await takeScreenshot(page, testInfo, 'marcas-no-disponible');
});
