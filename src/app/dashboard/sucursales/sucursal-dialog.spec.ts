import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { apiUrl } from '@services';
import { SucursalDialog } from './sucursal-dialog';

describe('SucursalDialog', () => {
  let fixture: ComponentFixture<SucursalDialog>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let dialogRef: jasmine.SpyObj<MatDialogRef<SucursalDialog>>;

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
    data: { sucursal?: unknown } = {},
  ): Promise<void> {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [SucursalDialog],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SucursalDialog);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  }

  afterEach(() => http.verify());

  it('muestra el título de creación sin sucursal en los datos', async () => {
    await createComponent();

    expect(element.querySelector('h2')?.textContent).toContain(
      'Nueva sucursal',
    );
  });

  it('no envía la petición si el formulario es inválido', async () => {
    await createComponent();

    submit();

    http.expectNone(apiUrl('api/crear-sucursal'));
  });

  it('crea la sucursal con los campos opcionales vacíos como null', async () => {
    await createComponent();
    setValue('name', 'Sucursal Siguatepeque');
    setValue('phone', '98761234');
    setValue('email', 'siguatepeque@ejemplo.com');
    setValue('complemento_direccion', 'Avenida principal');
    setValue('departamento_id', '3');
    setValue('municipio_id', '301');
    await fixture.whenStable();

    submit();

    const request = http.expectOne(apiUrl('api/crear-sucursal'));
    expect(request.request.body).toEqual({
      name: 'Sucursal Siguatepeque',
      phone: '98761234',
      email: 'siguatepeque@ejemplo.com',
      complemento_direccion: 'Avenida principal',
      departamento_id: 3,
      municipio_id: 301,
      tipo_establecimiento: null,
      manager_id: null,
      branch_code: null,
      cod_estable_mh: null,
      cod_estable: null,
      cod_pventa_mh: null,
      cod_pventa: null,
      printer_uuid: null,
    });
    const created = { id: 2, ...request.request.body, is_active: true };
    request.flush(created);

    expect(dialogRef.close).toHaveBeenCalledWith(created);
  });

  it('precarga los datos de la sucursal en modo edición', async () => {
    await createComponent({
      sucursal: {
        id: 1,
        name: 'Sucursal Central',
        phone: '98765432',
        email: 'central@ejemplo.com',
        tipo_establecimiento: 1,
        departamento_id: 8,
        municipio_id: 801,
        complemento_direccion: 'Barrio El Centro',
        manager_id: 5,
        branch_code: 'SPS001',
        cod_estable_mh: '0001',
        cod_estable: '001',
        cod_pventa_mh: '0001',
        cod_pventa: '001',
        printer_uuid: null,
        is_active: true,
      },
    });

    expect(element.querySelector('h2')?.textContent).toContain(
      'Editar sucursal',
    );
    expect(
      element.querySelector<HTMLInputElement>('[formcontrolname="name"]')
        ?.value,
    ).toBe('Sucursal Central');
  });
});
