import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Permission, Role } from '@interfaces';
import { apiUrl } from '@services';
import { RolDialog } from './rol-dialog';

describe('RolDialog', () => {
  let fixture: ComponentFixture<RolDialog>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let dialogRef: jasmine.SpyObj<MatDialogRef<RolDialog>>;

  const catalog: Permission[] = [
    { id: 1, name: 'ver usuarios' },
    { id: 2, name: 'editar usuarios' },
  ];

  function setValue(field: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(
      `[formcontrolname="${field}"]`,
    )!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submit(): void {
    element
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));
  }

  async function createComponent(data: { role?: Role } = {}): Promise<void> {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [RolDialog],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RolDialog);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;

    http.expectOne(apiUrl('api/lista-permisos')).flush(catalog);
    if (data.role) {
      http.expectOne(apiUrl(`api/permisos-del-rol/${data.role.id}`)).flush([
        {
          id: data.role.id,
          name: data.role.name,
          permissions: [
            { id: 1, name: 'ver usuarios', granted: true },
            { id: 2, name: 'editar usuarios', granted: false },
          ],
        },
      ]);
    }
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  it('carga el catálogo de permisos al abrir', async () => {
    await createComponent();

    const labels = Array.from(element.querySelectorAll('mat-checkbox')).map(
      (el) => el.textContent?.trim(),
    );
    expect(labels).toEqual(['ver usuarios', 'editar usuarios']);
  });

  it('precarga los permisos ya asignados en modo edición', async () => {
    await createComponent({
      role: { id: 1, name: 'Administrador', guard_name: 'api' },
    });

    const checked = Array.from(
      element.querySelectorAll<HTMLInputElement>('mat-checkbox input'),
    ).map((checkbox) => checkbox.checked);
    // Solo el permiso concedido queda marcado: el id del rol (1) no debe
    // confundirse con el de un permiso.
    expect(checked).toEqual([true, false]);
  });

  it('crea el rol con los permisos marcados', async () => {
    await createComponent();
    setValue('name', 'Cajero');
    (element.querySelector('mat-checkbox input') as HTMLInputElement).click();
    await fixture.whenStable();

    submit();

    const request = http.expectOne(apiUrl('api/crear-roles'));
    expect(request.request.body).toEqual({
      name: 'Cajero',
      permissions: [{ permission_id: 1 }],
    });
    const result = {
      message: 'Rol creado con permisos asignados',
      role: { id: 3, name: 'Cajero', permissions: ['ver usuarios'] },
    };
    request.flush(result);

    expect(dialogRef.close).toHaveBeenCalledWith(result);
  });

  it('permite guardar sin ningún permiso marcado', async () => {
    await createComponent();
    setValue('name', 'Solo lectura');

    submit();

    const request = http.expectOne(apiUrl('api/crear-roles'));
    expect(request.request.body).toEqual({
      name: 'Solo lectura',
      permissions: [],
    });
    request.flush({
      message: 'Rol creado con permisos asignados',
      role: { id: 4, name: 'Solo lectura', permissions: [] },
    });
  });
});
