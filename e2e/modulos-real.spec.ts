import { Page } from '@playwright/test';
import { expect, test } from './support/test';

// Contra la API real (base de pruebas del backend: no hay endpoints para
// borrar, así que cada corrida deja registros "ZZ E2E …" que el backend puede
// limpiar). Las credenciales salen de E2E_USER y E2E_PASSWORD (.env.e2e); sin
// ellas se omiten. Las que crean o editan llevan @write.
const user = process.env['E2E_USER'];
const password = process.env['E2E_PASSWORD'];

const tag = Date.now().toString(36).toUpperCase();

async function signIn(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel('Usuario').fill(user!);
  await page.getByLabel('Contraseña', { exact: true }).fill(password!);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

const dialog = (page: Page) => page.getByRole('dialog');

/** Elige una opción de un `mat-select` por su etiqueta. */
async function pick(page: Page, label: string, option?: string): Promise<void> {
  // La etiqueta flotante del campo intercepta el clic del ratón, así que se abre
  // con el teclado. Se reintenta hasta que haya opciones: los catálogos llegan
  // de la API y el selector puede abrirse antes de que terminen de cargar.
  const select = page.getByRole('combobox', { name: label });
  const options = page.getByRole('option');
  await expect(async () => {
    await select.focus();
    if ((await select.getAttribute('aria-expanded')) !== 'true') {
      await page.keyboard.press('Enter');
    }
    await expect(select).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 });
    await expect(options.first()).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  await (option ? options.filter({ hasText: option }).first() : options.first()).click();
}

/** Cambia un interruptor y espera a que su estado cambie. */
async function setSwitch(page: Page, name: string, on: boolean): Promise<void> {
  const toggle = dialog(page).getByRole('switch', { name });
  if ((await toggle.getAttribute('aria-checked')) !== String(on)) {
    await toggle.click();
  }
  await expect(toggle).toHaveAttribute('aria-checked', String(on));
}

const row = (page: Page, text: string) => page.getByRole('row').filter({ hasText: text });

async function saveDialog(page: Page): Promise<void> {
  await dialog(page).getByRole('button', { name: 'Guardar' }).click();
  // La API de desarrollo a veces tarda más de 5 s en responder al guardar.
  await expect(dialog(page)).toBeHidden({ timeout: 20_000 });
  // Al guardar bien aparece el aviso global con el message de la API.
  await expect(page.locator('.app-toast')).toBeVisible();
}

test.describe('módulos contra la API real', () => {
  test.skip(!user || !password, 'Faltan E2E_USER y E2E_PASSWORD en .env.e2e');

  test('Impuestos @write: crea, muestra la tasa como número y edita (incluido el código)', async ({
    page,
  }) => {
    await signIn(page);
    await page.goto('/dashboard/impuestos');
    // Los impuestos precargados llegan con la tasa como texto "13.0000"
    await showRow(page, 'IVA 13%');
    await expect(row(page, 'IVA 13%')).toContainText('13%');
    await expect(page.getByRole('table')).not.toContainText('13.0000');

    await page.getByRole('button', { name: 'Nuevo impuesto' }).click();
    await dialog(page).getByLabel('Nombre').fill(`ZZ E2E IVA ${tag}`);
    await dialog(page).getByLabel('Código').fill(`E${tag}`);
    await dialog(page).getByLabel('Tasa').fill('7');
    await saveDialog(page);
    await showRow(page, `ZZ E2E IVA ${tag}`);
    await expect(row(page, `ZZ E2E IVA ${tag}`)).toContainText('7%');

    await page.getByRole('button', { name: `Editar ZZ E2E IVA ${tag}` }).click();
    await expect(dialog(page).getByLabel('Código')).toHaveValue(`E${tag}`);
    await expect(dialog(page).getByLabel('Código')).toBeEnabled();
    await dialog(page).getByLabel('Nombre').fill(`ZZ E2E IVA ${tag} ed`);
    await dialog(page).getByLabel('Tasa').fill('8.5');
    await saveDialog(page);
    await showRow(page, `ZZ E2E IVA ${tag} ed`);
    await expect(row(page, `ZZ E2E IVA ${tag} ed`)).toContainText('8.5%');
  });

  test('Impuestos @write: un código repetido muestra un texto entendible, no SQL', async ({
    page,
  }) => {
    await signIn(page);
    await page.goto('/dashboard/impuestos');
    await page.getByRole('button', { name: 'Nuevo impuesto' }).click();
    await dialog(page).getByLabel('Nombre').fill(`ZZ E2E dup ${tag}`);
    await dialog(page).getByLabel('Código').fill('20'); // el del IVA 13% precargado
    await dialog(page).getByLabel('Tasa').fill('1');
    await dialog(page).getByRole('button', { name: 'Guardar' }).click();

    await expect(dialog(page).getByRole('alert')).toContainText('Ya existe un registro');
    await expect(dialog(page)).not.toContainText('SQLSTATE');
  });

  test('Unidades @write: crea y edita', async ({ page }) => {
    await signIn(page);
    await page.goto('/dashboard/unidades');
    await page.getByRole('button', { name: 'Nueva unidad' }).click();
    await dialog(page).getByLabel('Nombre').fill(`ZZ E2E Unidad ${tag}`);
    await dialog(page).getByLabel('Código').fill(`e${tag}`.toLowerCase());
    await saveDialog(page);
    // La tabla es paginada: se busca la unidad en las páginas hasta hallarla.
    await showRow(page, `ZZ E2E Unidad ${tag}`);

    await page.getByRole('button', { name: `Editar ZZ E2E Unidad ${tag}` }).click();
    await dialog(page).getByLabel('Nombre').fill(`ZZ E2E Unidad ${tag} ed`);
    await setSwitch(page, 'Activa', false);
    await saveDialog(page);
    await showRow(page, `ZZ E2E Unidad ${tag} ed`);
    await expect(row(page, `ZZ E2E Unidad ${tag} ed`)).toContainText('No');
  });

  test('Roles @write: la tabla cuenta los permisos y el diálogo marca solo los concedidos', async ({
    page,
  }) => {
    await signIn(page);
    await page.goto('/dashboard/roles');
    await showRow(page, 'System Admin');
    await expect(row(page, 'System Admin')).toContainText('35');

    await page.getByRole('button', { name: 'Nuevo rol' }).click();
    await dialog(page).getByLabel('Nombre').fill(`ZZ E2E Rol ${tag}`);
    await dialog(page).getByRole('checkbox', { name: 'ver usuarios' }).check();
    await saveDialog(page);
    await showRow(page, `ZZ E2E Rol ${tag}`);
    await expect(row(page, `ZZ E2E Rol ${tag}`)).toContainText('1');

    await page.getByRole('button', { name: `Editar ZZ E2E Rol ${tag}` }).click();
    await expect(dialog(page).getByRole('checkbox', { name: 'ver usuarios' })).toBeChecked();
    await expect(dialog(page).getByRole('checkbox', { name: 'crear usuarios' })).not.toBeChecked();
    await dialog(page).getByRole('checkbox', { name: 'crear usuarios' }).check();
    await saveDialog(page);
    await showRow(page, `ZZ E2E Rol ${tag}`);
    await expect(row(page, `ZZ E2E Rol ${tag}`)).toContainText('2');
  });

  test('Sucursales @write: selectores de ubicación encadenados, tipo obligatorio al editar', async ({
    page,
  }) => {
    await signIn(page);
    await page.goto('/dashboard/sucursales');
    await page.getByRole('button', { name: 'Nueva sucursal' }).click();
    await dialog(page).getByLabel('Nombre').fill(`ZZ E2E Sucursal ${tag}`);
    await dialog(page).getByLabel('Teléfono').fill('22223333');
    await dialog(page).getByLabel('Correo electrónico').fill(`suc.${tag}@example.com`);
    await dialog(page).getByLabel('Dirección').fill('Calle principal 1');
    await pick(page, 'Departamento', 'San Salvador');
    await pick(page, 'Municipio');
    await pick(page, 'Tipo', 'Bodega');
    await saveDialog(page);

    await showRow(page, `ZZ E2E Sucursal ${tag}`);
    await expect(row(page, `ZZ E2E Sucursal ${tag}`)).toContainText('San Salvador');
    await expect(row(page, `ZZ E2E Sucursal ${tag}`)).toContainText('Bodega');

    await page.getByRole('button', { name: `Editar ZZ E2E Sucursal ${tag}` }).click();
    await expect(dialog(page).getByRole('combobox', { name: 'Tipo' })).toContainText('Bodega');
    await expect(dialog(page).getByRole('combobox', { name: 'Departamento' })).toContainText('San Salvador');
    await dialog(page).getByLabel('Nombre').fill(`ZZ E2E Sucursal ${tag} ed`);
    await dialog(page).getByLabel('UUID de impresora').fill('3f2504e0-4f89-11d3-9a0c-0305e82c3301');
    await saveDialog(page);
    await showRow(page, `ZZ E2E Sucursal ${tag} ed`);

    // Editar de nuevo sin tocar el UUID no debe fallar ni borrarlo (se omite del cuerpo).
    await page.getByRole('button', { name: `Editar ZZ E2E Sucursal ${tag} ed` }).click();
    await saveDialog(page);
  });

  test('Empresas @write: crea y edita sin mostrar las credenciales', async ({ page }) => {
    await signIn(page);
    await page.goto('/dashboard/empresas');
    await expect(page.getByRole('heading', { name: 'Empresas' })).toBeVisible();

    await page.getByRole('button', { name: 'Nueva empresa' }).click();
    await dialog(page).getByLabel('Nombre legal').fill(`ZZ E2E Legal ${tag}`);
    await dialog(page).getByLabel('Nombre comercial').fill(`ZZ E2E Comercial ${tag}`);
    await dialog(page).getByLabel('NIT').fill(`NIT${tag}`);
    await dialog(page).getByLabel('NRC').fill(`NRC${tag}`);
    await dialog(page).getByLabel('Código de actividad').fill('47190');
    await dialog(page).getByLabel('Descripción de actividad').fill('Venta al por menor');
    await dialog(page).getByLabel('Correo electrónico').fill(`emp.${tag}@example.com`);
    await dialog(page).getByLabel('Teléfono').fill('22223333');
    await dialog(page).getByRole('button', { name: 'Guardar' }).click();
    // Con una empresa ya registrada el backend responde 409 "Company already exists".
    await expect(dialog(page).or(row(page, `ZZ E2E Comercial ${tag}`))).toBeVisible();
    if (await dialog(page).isVisible()) {
      await expect(dialog(page).getByRole('alert')).toContainText('Company already exists');
      await dialog(page).getByRole('button', { name: 'Cancelar' }).click();
    }

    // Editar la empresa de pruebas existente: los campos de credenciales vienen vacíos
    await page.getByRole('button', { name: /^Editar / }).first().click();
    await expect(dialog(page).getByLabel('Llave de la API')).toHaveValue('');
    await expect(dialog(page).getByLabel('Contraseña privada')).toHaveValue('');
    await saveDialog(page);
  });

  test('Usuarios @write: ciclo completo — alta, contraseña propia, autorización e ingreso', async ({
    page,
    browser,
  }) => {
    const acronym = `E2E${tag}`;
    const email = `e2e.${tag.toLowerCase()}@example.com`;
    const name = `ZZ E2E Usuario ${tag}`;
    const newPassword = `Prueba-${tag}-1`;

    await signIn(page);
    await page.goto('/dashboard/usuarios');
    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    await dialog(page).getByLabel('Nombre').fill(name);
    await dialog(page).getByLabel('Siglas').fill(acronym);
    await dialog(page).getByLabel('Correo electrónico').fill(email);
    await pick(page, 'Sucursal');
    await pick(page, 'Rol', 'Company Admin');
    await saveDialog(page);
    await showRow(page, name);
    await expect(row(page, name)).toContainText('Company Admin');
    await expect(row(page, name)).toContainText('Pendiente');

    // El usuario nuevo intenta entrar: el backend responde 200 sin token y la app lo guía.
    const ctx = await browser.newContext();
    const userPage = await ctx.newPage();
    await userPage.addInitScript(() => localStorage.setItem('app-dev-login', 'off'));
    await userPage.goto('/auth/login');
    await userPage.getByLabel('Usuario').fill(acronym);
    await userPage.getByLabel('Contraseña', { exact: true }).fill('cualquiera');
    await userPage.getByRole('button', { name: 'Entrar' }).click();
    await expect(userPage.getByRole('status')).toContainText('Aún no creaste tu contraseña');
    await userPage.getByRole('link', { name: 'Créala aquí' }).click();

    await userPage.getByLabel('Nombre').fill(name);
    await userPage.getByLabel('Siglas').fill(acronym);
    await userPage.getByLabel('Correo electrónico').fill(email);
    await userPage.getByLabel('Contraseña nueva').fill(newPassword);
    await userPage.getByLabel('Confirmar contraseña').fill(newPassword);
    await userPage.getByRole('button', { name: 'Actualizar contraseña' }).click();
    await expect(userPage.getByRole('status')).toContainText('Solicitud recibida');

    // Con la contraseña creada pero sin autorizar, el backend rechaza el acceso.
    await userPage.goto('/auth/login');
    await userPage.getByLabel('Usuario').fill(acronym);
    await userPage.getByLabel('Contraseña', { exact: true }).fill(newPassword);
    await userPage.getByRole('button', { name: 'Entrar' }).click();
    await expect(userPage.getByRole('alert')).toContainText('pendiente de autorización');

    // El administrador lo autoriza.
    await page.reload();
    await showRow(page, name);
    await expect(row(page, name)).toContainText('Pendiente');
    await page.getByRole('button', { name: `Editar ${name}` }).click();
    await expect(dialog(page).getByRole('combobox', { name: 'Rol' })).toContainText('Company Admin');
    await setSwitch(page, 'Autorizado', true);
    await saveDialog(page);
    await showRow(page, name);
    await expect(row(page, name)).not.toContainText('Pendiente');

    // Ahora sí entra.
    await userPage.getByRole('button', { name: 'Entrar' }).click();
    await expect(userPage).toHaveURL(/\/dashboard$/);
    await ctx.close();
  });
});

test.describe('módulos de inventario sin plan contratado', () => {
  test.skip(!user || !password, 'Faltan E2E_USER y E2E_PASSWORD en .env.e2e');

  // Comprobado el 2026-11-19: el tenant de desarrollo responde 403 "Tu plan no
  // incluye módulo de inventario." en Proveedores, Marcas y Categorías. Si el
  // backend activa el módulo, esta prueba deja de aplicar: sustituirla por las
  // de crear y editar.
  for (const [ruta, titulo] of [
    ['proveedores', 'Proveedores'],
    ['marcas', 'Marcas'],
    ['categorias', 'Categorías'],
  ]) {
    test(`${titulo} muestra el aviso del plan en vez de fallar`, async ({ page }) => {
      await signIn(page);
      await page.goto(`/dashboard/${ruta}`);

      await expect(page.getByRole('heading', { name: titulo })).toBeVisible();
      await expect(page.getByRole('alert')).toContainText('Tu plan no incluye módulo de inventario');
      await expect(page).toHaveURL(new RegExp(`/dashboard/${ruta}$`)); // no cierra la sesión
    });
  }
});

/**
 * Busca una fila en la tabla paginada. El backend no ordena el listado y al
 * editar un registro este puede cambiar de posición, así que se espera a que
 * termine la recarga, se vuelve a la primera página y se avanza hasta hallarla.
 */
async function showRow(page: Page, text: string): Promise<void> {
  await expect(page.locator('mat-spinner')).toBeHidden();
  const previous = page.getByRole('button', { name: 'Página anterior' });
  const next = page.getByRole('button', { name: 'Página siguiente' });
  while (await previous.isEnabled()) {
    await previous.click();
  }
  const target = row(page, text).first();
  for (let i = 0; i < 20; i++) {
    if (await target.isVisible()) return;
    if (!(await next.isEnabled())) break;
    await next.click();
  }
  await expect(target).toBeVisible();
}
