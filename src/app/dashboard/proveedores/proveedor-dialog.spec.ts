import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { apiUrl } from '@services';
import { ProveedorDialog } from './proveedor-dialog';

describe('ProveedorDialog', () => {
  let fixture: ComponentFixture<ProveedorDialog>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ProveedorDialog>>;

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
    data: { proveedor?: unknown } = {},
  ): Promise<void> {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ProveedorDialog],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProveedorDialog);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  }

  afterEach(() => http.verify());

  it('muestra el título de creación sin proveedor en los datos', async () => {
    await createComponent();

    expect(element.querySelector('h2')?.textContent).toContain(
      'Nuevo proveedor',
    );
  });

  it('no envía la petición si el formulario es inválido', async () => {
    await createComponent();

    submit();

    http.expectNone(apiUrl('api/crear-proveedor'));
  });

  it('crea el proveedor y cierra el diálogo con el resultado', async () => {
    await createComponent();
    setValue('name', 'Proveedor de Insumos S.A.');
    setValue('nit', '08011999123456');
    setValue('nrc', '123456-7');
    setValue('phone', '98765432');
    setValue('email', 'contacto@proveedor.com');
    setValue('contact_person', 'Juan Pérez');
    setValue('address_complement', 'Col. Centro, 2da avenida, bloque A');
    setValue('departmento_id', '1');
    setValue('municipio_id', '5');
    setValue('payment_name', 'Transferencia Bancaria');
    setValue('withholding_percent', '10');
    await fixture.whenStable();

    submit();

    const request = http.expectOne(apiUrl('api/crear-proveedor'));
    expect(request.request.body).toEqual({
      name: 'Proveedor de Insumos S.A.',
      nit: '08011999123456',
      nrc: '123456-7',
      phone: '98765432',
      email: 'contacto@proveedor.com',
      contact_person: 'Juan Pérez',
      address_complement: 'Col. Centro, 2da avenida, bloque A',
      departmento_id: 1,
      municipio_id: 5,
      payment_name: 'Transferencia Bancaria',
      has_withholding: false,
      withholding_percent: 10,
    });
    const created = { id: 2, ...request.request.body, is_active: true };
    request.flush(created);

    expect(dialogRef.close).toHaveBeenCalledWith(created);
  });

  it('precarga los datos del proveedor en modo edición', async () => {
    await createComponent({
      proveedor: {
        id: 1,
        name: 'Proveedor de Insumos S.A.',
        nit: '08011999123456',
        nrc: '123456-7',
        has_withholding: true,
        withholding_percent: 10,
        payment_name: 'Transferencia Bancaria',
        departmento_id: 1,
        municipio_id: 5,
        address_complement: 'Col. Centro, 2da avenida, bloque A',
        phone: '98765432',
        email: 'contacto@proveedor.com',
        contact_person: 'Juan Pérez',
        is_active: true,
      },
    });

    expect(element.querySelector('h2')?.textContent).toContain(
      'Editar proveedor',
    );
    expect(
      element.querySelector<HTMLInputElement>('[formcontrolname="name"]')
        ?.value,
    ).toBe('Proveedor de Insumos S.A.');
  });
});
