import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppUser, Role } from '@usuarios-sistema/interfaces';
import { Sucursal } from '@empresa/interfaces';
import { apiUrl } from '@shared';
import { UsuarioDialog } from './usuario-dialog';
import { expectFormLayout } from '@shared/testing/form-dialog.testing.spec';

describe('UsuarioDialog', () => {
  let fixture: ComponentFixture<UsuarioDialog>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let dialogRef: jasmine.SpyObj<MatDialogRef<UsuarioDialog>>;

  const sucursales = [{ id: 1, name: 'Sucursal Central' }] as Sucursal[];
  const roles: Role[] = [
    { id: 1, name: 'System Admin', guard_name: 'api' },
    { id: 2, name: 'Company Admin', guard_name: 'api' },
  ];
  const user: AppUser = {
    id: 3,
    name: 'M. Rojas',
    acronym: 'MROJAS',
    email: 'm.rojas@ejemplo.com',
    roles: ['Company Admin'],
    branch: 'Sucursal Central',
    branch_id: 1,
    authorized: true,
    is_active: true,
  };

  const form = () => fixture.componentInstance['form'];

  function setValue(field: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(
      `[formcontrolname="${field}"]`,
    )!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function select(field: string, label: string): Promise<void> {
    element.querySelector<HTMLElement>(`[formcontrolname="${field}"]`)!.click();
    await fixture.whenStable();

    const option = Array.from(
      document.querySelectorAll<HTMLElement>('mat-option'),
    ).find((candidate) => candidate.textContent?.trim() === label)!;
    option.click();
    await fixture.whenStable();
  }

  function submit(): void {
    element
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));
  }

  async function createComponent(data: { user?: AppUser } = {}): Promise<void> {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [UsuarioDialog],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UsuarioDialog);
    await fixture.whenStable();
    http.expectOne(apiUrl('api/branches')).flush(sucursales);
    http.expectOne(apiUrl('api/lista-roles')).flush(roles);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  }

  afterEach(() => http.verify());

  it('muestra el título de creación sin usuario en los datos', async () => {
    await createComponent();

    expect(element.querySelector('h2')?.textContent).toContain('Nuevo usuario');
    expect(element.textContent).toContain('crea su contraseña');
  });

  it('no envía la petición si falta sucursal o rol', async () => {
    await createComponent();
    setValue('name', 'Nuevo usuario');
    setValue('acronym', 'NUSR');
    setValue('email', 'nuevo@ejemplo.com');

    submit();

    http.expectNone(apiUrl('api/crear-usuario'));
  });

  it('crea el usuario con rol_id y authorized: false, y cierra el diálogo con el resultado', async () => {
    await createComponent();
    setValue('name', 'Nuevo usuario');
    setValue('acronym', 'NUSR');
    setValue('email', 'nuevo@ejemplo.com');
    await select('branch_id', 'Sucursal Central');
    await select('rol_id', 'Company Admin');

    submit();

    const request = http.expectOne(apiUrl('api/crear-usuario'));
    expect(request.request.body).toEqual({
      name: 'Nuevo usuario',
      acronym: 'NUSR',
      email: 'nuevo@ejemplo.com',
      branch_id: 1,
      rol_id: 2,
      authorized: false,
    });
    const result = { message: 'User Nuevo usuario created successfully' };
    request.flush(result);

    expect(dialogRef.close).toHaveBeenCalledWith(result);
  });

  it('en edición precarga los datos y busca el id del rol por su nombre', async () => {
    await createComponent({ user });

    expect(element.querySelector('h2')?.textContent).toContain(
      'Editar usuario',
    );
    expect(
      element.querySelector<HTMLInputElement>('[formcontrolname="name"]')
        ?.value,
    ).toBe('M. Rojas');
    expect(form().controls.rol_id.value).toBe(2);
    expect(form().controls.branch_id.value).toBe(1);
  });

  it('al editar envía todos los campos, incluido rol_id', async () => {
    await createComponent({ user });

    submit();

    const request = http.expectOne(apiUrl('api/editar-usuario/3'));
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      name: 'M. Rojas',
      acronym: 'MROJAS',
      email: 'm.rojas@ejemplo.com',
      branch_id: 1,
      rol_id: 2,
      authorized: true,
      is_active: true,
    });
    request.flush({ message: 'User updated successfully' });
  });

  it('un usuario de sistema sin sucursal no recibe una sucursal inventada: obliga a elegir una', async () => {
    await createComponent({
      user: { ...user, branch: null, branch_id: null, roles: ['System Admin'] },
    });

    expect(form().controls.branch_id.value).toBeNull();
    expect(form().controls.rol_id.value).toBe(1);

    submit();

    http.expectNone(apiUrl('api/editar-usuario/3'));
  });

  it('muestra un texto entendible cuando el nombre ya existe', async () => {
    await createComponent({ user });

    submit();
    http.expectOne(apiUrl('api/editar-usuario/3')).flush(
      {
        message: 'Error updating user',
        error:
          'SQLSTATE[23505]: Unique violation: 7 ERROR: duplicate key value violates unique constraint "users_name_unique"',
      },
      { status: 500, statusText: 'Server Error' },
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.textContent).toContain('Ya existe un registro');
    expect(element.textContent).not.toContain('SQLSTATE');
  });
  it('al crear: distribución del formulario (1 columna, interruptores al final)', async () => {
    await createComponent();

    expectFormLayout(element, 1);
  });

  it('al editar: distribución del formulario (2 columnas, interruptores al final)', async () => {
    await createComponent({ user });

    expectFormLayout(element, 2);
  });
});
