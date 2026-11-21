import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { apiUrl } from '@shared';
import { ImpuestoDialog } from './impuesto-dialog';
import { expectFormLayout } from '@shared/testing/form-dialog.testing.spec';

describe('ImpuestoDialog', () => {
  let fixture: ComponentFixture<ImpuestoDialog>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ImpuestoDialog>>;

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
    data: { impuesto?: unknown } = {},
  ): Promise<void> {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ImpuestoDialog],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ImpuestoDialog);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  }

  afterEach(() => http.verify());

  it('muestra el título de creación sin impuesto en los datos', async () => {
    await createComponent();

    expect(element.querySelector('h2')?.textContent).toContain(
      'Nuevo impuesto',
    );
  });

  it('no envía la petición si el formulario es inválido', async () => {
    await createComponent();

    submit();

    http.expectNone(apiUrl('api/crear-impuesto'));
  });

  it('crea el impuesto con el code incluido', async () => {
    await createComponent();
    setValue('name', 'Impuesto sobre ventas');
    setValue('code', 'A01');
    setValue('rate', '0.15');
    await fixture.whenStable();

    submit();

    const request = http.expectOne(apiUrl('api/crear-impuesto'));
    expect(request.request.body).toEqual({
      name: 'Impuesto sobre ventas',
      code: 'A01',
      rate: 0.15,
      is_percentage: true,
    });
    request.flush({ message: 'Tax created successfully', data: { id: 2 } });
  });

  it('al editar, convierte la tasa de texto a número y envía el code (el backend lo exige)', async () => {
    await createComponent({
      impuesto: {
        id: 1,
        name: 'Impuesto sobre ventas',
        code: 'A01',
        rate: '13.0000',
        is_percentage: true,
        is_active: true,
      },
    });

    expect(
      element.querySelector<HTMLInputElement>('[formcontrolname="code"]')
        ?.disabled,
    ).toBeFalse();
    expect(
      element.querySelector<HTMLInputElement>('[formcontrolname="rate"]')
        ?.value,
    ).toBe('13');

    submit();

    const request = http.expectOne(apiUrl('api/actualizar-impuesto/1'));
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      name: 'Impuesto sobre ventas',
      code: 'A01',
      rate: 13,
      is_percentage: true,
      is_active: true,
    });
    request.flush({ message: 'Tax updated successfully', data: { id: 1 } });
  });

  it('permite cambiar el code al editar', async () => {
    await createComponent({
      impuesto: {
        id: 1,
        name: 'IVA',
        code: 'A01',
        rate: '13.0000',
        is_percentage: true,
        is_active: true,
      },
    });
    setValue('code', 'A02');

    submit();

    const request = http.expectOne(apiUrl('api/actualizar-impuesto/1'));
    expect(request.request.body.code).toBe('A02');
    request.flush({ message: 'Tax updated successfully' });
  });
  it('al crear: distribución del formulario (1 columna, interruptores al final)', async () => {
    await createComponent();

    expectFormLayout(element, 1);
  });
});
