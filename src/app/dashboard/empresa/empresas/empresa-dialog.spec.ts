import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { apiUrl } from '@shared';
import { EmpresaDialog } from './empresa-dialog';
import { expectFormLayout } from '@shared/testing/form-dialog.testing.spec';

describe('EmpresaDialog', () => {
  let fixture: ComponentFixture<EmpresaDialog>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EmpresaDialog>>;

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

  async function createComponent(
    data: { empresa?: unknown } = {},
  ): Promise<void> {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [EmpresaDialog],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(EmpresaDialog);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  }

  afterEach(() => http.verify());

  it('muestra el título de creación sin empresa en los datos', async () => {
    await createComponent();

    expect(element.querySelector('h2')?.textContent).toContain('Nueva empresa');
  });

  it('no envía la petición si el formulario es inválido', async () => {
    await createComponent();

    submit();

    http.expectNone(apiUrl('api/crear-empresa'));
  });

  it('crea la empresa y cierra el diálogo con el resultado', async () => {
    await createComponent();
    setValue('name', 'Company 01');
    setValue('comercial_name', 'Tu empresa');
    setValue('nit', '12365478912364');
    setValue('nrc', '1236589');
    setValue('activity_code', '75000');
    setValue('activity_description', 'Actividades de compra y venta');
    setValue('email', 'contacto@empresa.com');
    setValue('phone', '1234567890');
    await fixture.whenStable();

    submit();

    const request = http.expectOne(apiUrl('api/crear-empresa'));
    expect(request.request.body).toEqual({
      name: 'Company 01',
      comercial_name: 'Tu empresa',
      nit: '12365478912364',
      nrc: '1236589',
      activity_code: '75000',
      activity_description: 'Actividades de compra y venta',
      email: 'contacto@empresa.com',
      phone: '1234567890',
    });
    const result = { message: 'Company created successfully' };
    request.flush(result);

    expect(dialogRef.close).toHaveBeenCalledWith(result);
  });

  it('no precarga ni envía api_key ni private_password si se dejan vacíos al editar (el listado las trae en claro)', async () => {
    await createComponent({
      empresa: {
        id: 1,
        name: 'Company 01',
        nit: '12365478912364',
        nrc: '1236589',
        activity_code: '75000',
        activity_description: 'Actividades de compra y venta',
        comercial_name: 'Tu empresa',
        email: 'contacto@empresa.com',
        phone: '1234567890',
        api_key: 'clave-en-claro-del-listado',
        private_password: 'pass-en-claro-del-listado',
      },
    });

    expect(
      element.querySelector<HTMLInputElement>('[formcontrolname="api_key"]')
        ?.value,
    ).toBe('');

    submit();

    const request = http.expectOne(apiUrl('api/actualizar-empresa/1'));
    expect(request.request.body).toEqual({
      name: 'Company 01',
      comercial_name: 'Tu empresa',
      nit: '12365478912364',
      nrc: '1236589',
      activity_code: '75000',
      activity_description: 'Actividades de compra y venta',
      email: 'contacto@empresa.com',
      phone: '1234567890',
    });
    request.flush({ message: 'Company updated successfully' });
  });
  it('al crear: distribución del formulario (2 columnas, interruptores al final)', async () => {
    await createComponent();

    expectFormLayout(element, 2);
  });
});
