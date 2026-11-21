import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Sucursal } from '@interfaces';
import { apiUrl } from '@services';
import { SucursalDialog } from './sucursal-dialog';
import { expectFormLayout } from '../form-dialog.testing.spec';

const sucursal: Sucursal = {
  id: 1,
  name: 'Sucursal Central',
  email: 'central@ejemplo.com',
  phone: '98765432',
  manager: null,
  manager_id: 2,
  branch_code: 'SPS001',
  tipo_establecimiento: 1,
  tipo_establecimiento_name: 'Sucursal',
  departamento_id: 8,
  departamento_name: 'Cuscatlán',
  municipio_id: 20,
  municipio_name: 'Cuscatlán Norte',
  complemento_direccion: 'Barrio El Centro',
  cod_estable_mh: '0001',
  cod_estable: '001',
  cod_pventa_mh: '0001',
  cod_pventa: '001',
  is_active: true,
};

const tipos = [
  { id: 1, name: 'Sucursal' },
  { id: 2, name: 'Casa Matriz' },
];
const departamentos = [
  { id: 3, code: '01', name: 'Ahuachapán' },
  { id: 8, code: '07', name: 'Cuscatlán' },
];
const usuarios = [{ id: 2, name: 'company admin' }];

describe('SucursalDialog', () => {
  let fixture: ComponentFixture<SucursalDialog>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let dialogRef: jasmine.SpyObj<MatDialogRef<SucursalDialog>>;

  const form = () => fixture.componentInstance['form'];

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

  /** Responde los catálogos que el diálogo pide al abrirse. */
  async function flushCatalogs(municipiosDe?: number): Promise<void> {
    http.expectOne(apiUrl('api/tipo-establecimiento')).flush(tipos);
    http.expectOne(apiUrl('api/users')).flush(usuarios);
    http.expectOne(apiUrl('api/departamentos')).flush(departamentos);
    if (municipiosDe !== undefined) {
      http
        .expectOne(apiUrl(`api/departamentos/${municipiosDe}/municipios`))
        .flush([{ id: 20, name: 'Cuscatlán Norte' }]);
    }
    await fixture.whenStable();
  }

  async function createComponent(
    data: { sucursal?: Sucursal } = {},
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
    await flushCatalogs();

    expect(element.querySelector('h2')?.textContent).toContain(
      'Nueva sucursal',
    );
  });

  it('no envía la petición si el formulario es inválido', async () => {
    await createComponent();
    await flushCatalogs();

    submit();

    http.expectNone(apiUrl('api/crear-sucursal'));
  });

  it('al crear, el municipio se pide según el departamento y los opcionales vacíos van como null', async () => {
    await createComponent();
    await flushCatalogs();
    setValue('name', 'Sucursal Siguatepeque');
    setValue('phone', '98761234');
    setValue('email', 'siguatepeque@ejemplo.com');
    setValue('complemento_direccion', 'Avenida principal');

    form().controls.departamento_id.setValue(3);
    http
      .expectOne(apiUrl('api/departamentos/3/municipios'))
      .flush([{ id: 1, name: 'Ahuachapán Norte' }]);
    form().controls.municipio_id.setValue(1);
    await fixture.whenStable();

    submit();

    const request = http.expectOne(apiUrl('api/crear-sucursal'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Sucursal Siguatepeque',
      phone: '98761234',
      email: 'siguatepeque@ejemplo.com',
      complemento_direccion: 'Avenida principal',
      departamento_id: 3,
      municipio_id: 1,
      tipo_establecimiento: null,
      manager_id: null,
      branch_code: null,
      cod_estable_mh: null,
      cod_estable: null,
      cod_pventa_mh: null,
      cod_pventa: null,
      printer_uuid: null,
    });
    const result = { message: 'Branch created successfully' };
    request.flush(result);

    expect(dialogRef.close).toHaveBeenCalledWith(result);
  });

  it('al cambiar el departamento se vacía el municipio elegido', async () => {
    await createComponent({ sucursal });
    await flushCatalogs(8);
    expect(form().controls.municipio_id.value).toBe(20);

    form().controls.departamento_id.setValue(3);
    http
      .expectOne(apiUrl('api/departamentos/3/municipios'))
      .flush([{ id: 1, name: 'Ahuachapán Norte' }]);

    expect(form().controls.municipio_id.value).toBeNull();
  });

  it('precarga los datos de la sucursal en modo edición', async () => {
    await createComponent({ sucursal });
    await flushCatalogs(8);

    expect(element.querySelector('h2')?.textContent).toContain(
      'Editar sucursal',
    );
    expect(
      element.querySelector<HTMLInputElement>('[formcontrolname="name"]')
        ?.value,
    ).toBe('Sucursal Central');
    expect(form().controls.tipo_establecimiento.value).toBe(1);
    expect(form().controls.manager_id.value).toBe(2);
  });

  it('al editar, no envía printer_uuid si se deja vacío (así la API conserva el actual)', async () => {
    await createComponent({ sucursal });
    await flushCatalogs(8);

    submit();

    const request = http.expectOne(apiUrl('api/actualizar-sucursal/1'));
    expect(request.request.method).toBe('PUT');
    expect(request.request.body.tipo_establecimiento).toBe(1);
    expect(request.request.body.is_active).toBe(true);
    expect('printer_uuid' in request.request.body).toBeFalse();
    request.flush({ message: 'Branch updated successfully' });
  });

  it('al editar, envía printer_uuid solo si el usuario escribe uno', async () => {
    await createComponent({ sucursal });
    await flushCatalogs(8);
    setValue('printer_uuid', '3f2504e0-4f89-11d3-9a0c-0305e82c3301');

    submit();

    const request = http.expectOne(apiUrl('api/actualizar-sucursal/1'));
    expect(request.request.body.printer_uuid).toBe(
      '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
    );
    request.flush({ message: 'Branch updated successfully' });
  });

  it('al editar, el tipo de establecimiento es obligatorio (la API lo exige)', async () => {
    await createComponent({ sucursal });
    await flushCatalogs(8);
    form().controls.tipo_establecimiento.setValue(null);

    submit();

    http.expectNone(apiUrl('api/actualizar-sucursal/1'));
  });

  it('muestra un mensaje entendible si la API rechaza un id con 500', async () => {
    await createComponent({ sucursal });
    await flushCatalogs(8);

    submit();
    http.expectOne(apiUrl('api/actualizar-sucursal/1')).flush(
      {
        message: 'Error updating branch',
        error: 'SQLSTATE[23503]: Foreign key violation: 7 ERROR: …',
      },
      { status: 500, statusText: 'Server Error' },
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.textContent).toContain('no es válido');
    expect(element.textContent).not.toContain('SQLSTATE');
  });
  it('al crear: distribución del formulario (3 columnas, interruptores al final)', async () => {
    await createComponent();
    await flushCatalogs();

    expectFormLayout(element, 3);
  });

  it('al editar: distribución del formulario (3 columnas, interruptores al final)', async () => {
    await createComponent({ sucursal });
    await flushCatalogs(8);

    expectFormLayout(element, 3);
  });
});
