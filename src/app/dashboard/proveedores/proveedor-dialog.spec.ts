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
import { expectFormLayout } from '../form-dialog.testing.spec';

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

  const form = () => fixture.componentInstance['form'];

  /** Responde los catálogos de ubicación que el diálogo pide al abrirse. */
  async function flushCatalogs(municipiosDe?: number): Promise<void> {
    http
      .expectOne(apiUrl('api/departamentos'))
      .flush([{ id: 1, code: '08', name: 'La Paz' }]);
    if (municipiosDe !== undefined) {
      http
        .expectOne(apiUrl(`api/departamentos/${municipiosDe}/municipios`))
        .flush([{ id: 5, name: 'La Paz Oeste' }]);
    }
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  it('muestra el título de creación sin proveedor en los datos', async () => {
    await createComponent();
    await flushCatalogs();

    expect(element.querySelector('h2')?.textContent).toContain(
      'Nuevo proveedor',
    );
  });

  it('no envía la petición si el formulario es inválido', async () => {
    await createComponent();
    await flushCatalogs();

    submit();

    http.expectNone(apiUrl('api/crear-proveedor'));
  });

  it('crea el proveedor y cierra el diálogo con el resultado', async () => {
    await createComponent();
    await flushCatalogs();
    setValue('name', 'Proveedor de Insumos S.A.');
    setValue('nit', '08011999123456');
    setValue('nrc', '123456-7');
    setValue('phone', '98765432');
    setValue('email', 'contacto@proveedor.com');
    setValue('contact_person', 'Juan Pérez');
    setValue('address_complement', 'Col. Centro, 2da avenida, bloque A');
    form().controls.departmento_id.setValue(1);
    http
      .expectOne(apiUrl('api/departamentos/1/municipios'))
      .flush([{ id: 5, name: 'La Paz Oeste' }]);
    form().controls.municipio_id.setValue(5);
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
    const result = { message: 'Provider created successfully' };
    request.flush(result);

    expect(dialogRef.close).toHaveBeenCalledWith(result);
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

    await flushCatalogs(1);

    expect(element.querySelector('h2')?.textContent).toContain(
      'Editar proveedor',
    );
    expect(form().controls.departmento_id.value).toBe(1);
    expect(form().controls.municipio_id.value).toBe(5);
    expect(
      element.querySelector<HTMLInputElement>('[formcontrolname="name"]')
        ?.value,
    ).toBe('Proveedor de Insumos S.A.');
  });
  it('al crear: distribución del formulario (3 columnas, interruptores al final)', async () => {
    await createComponent();
    await flushCatalogs();

    expectFormLayout(element, 3);
  });
});
