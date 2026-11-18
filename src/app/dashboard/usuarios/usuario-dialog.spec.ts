import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { apiUrl } from '@services';
import { UsuarioDialog } from './usuario-dialog';

describe('UsuarioDialog', () => {
  let fixture: ComponentFixture<UsuarioDialog>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let dialogRef: jasmine.SpyObj<MatDialogRef<UsuarioDialog>>;

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

  async function createComponent(data: { user?: unknown } = {}): Promise<void> {
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
    element = fixture.nativeElement as HTMLElement;
  }

  afterEach(() => http.verify());

  it('muestra el título de creación sin usuario en los datos', async () => {
    await createComponent();

    expect(element.querySelector('h2')?.textContent).toContain('Nuevo usuario');
  });

  it('no envía la petición si el formulario es inválido', async () => {
    await createComponent();

    submit();

    http.expectNone(apiUrl('api/crear-usuario'));
  });

  it('crea el usuario y cierra el diálogo con el resultado', async () => {
    await createComponent();
    setValue('name', 'Nuevo usuario');
    setValue('acronym', 'NUSR');
    setValue('email', 'nuevo@ejemplo.com');
    setValue('branch_id', '1');
    await fixture.whenStable();

    submit();

    const request = http.expectOne(apiUrl('api/crear-usuario'));
    expect(request.request.body).toEqual({
      name: 'Nuevo usuario',
      acronym: 'NUSR',
      email: 'nuevo@ejemplo.com',
      branch_id: 1,
    });
    const created = { id: 2, ...request.request.body };
    request.flush(created);

    expect(dialogRef.close).toHaveBeenCalledWith(created);
  });

  it('precarga los datos del usuario en modo edición', async () => {
    await createComponent({
      user: {
        id: 2,
        name: 'M. Rojas',
        acronym: 'MROJAS',
        email: 'm.rojas@ejemplo.com',
        branch_id: 1,
        authorized: true,
        is_active: true,
      },
    });

    expect(element.querySelector('h2')?.textContent).toContain(
      'Editar usuario',
    );
    expect(
      element.querySelector<HTMLInputElement>('[formcontrolname="name"]')
        ?.value,
    ).toBe('M. Rojas');
  });
});
