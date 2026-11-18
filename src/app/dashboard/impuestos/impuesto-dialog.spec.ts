import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { apiUrl } from '@services';
import { ImpuestoDialog } from './impuesto-dialog';

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

    http.expectNone(apiUrl('api/crear-impuestos'));
  });

  it('crea el impuesto con el code incluido', async () => {
    await createComponent();
    setValue('name', 'Impuesto sobre ventas');
    setValue('code', 'A01');
    setValue('rate', '0.15');
    await fixture.whenStable();

    submit();

    const request = http.expectOne(apiUrl('api/crear-impuestos'));
    expect(request.request.body).toEqual({
      name: 'Impuesto sobre ventas',
      code: 'A01',
      rate: 0.15,
      is_percentage: true,
    });
    request.flush({ id: 2, ...request.request.body, is_active: true });
  });

  it('edita el impuesto sin enviar el code (deshabilitado)', async () => {
    await createComponent({
      impuesto: {
        id: 1,
        name: 'Impuesto sobre ventas',
        code: 'A01',
        rate: 0.15,
        is_percentage: true,
        is_active: true,
      },
    });

    expect(
      element.querySelector<HTMLInputElement>('[formcontrolname="code"]')
        ?.disabled,
    ).toBeTrue();

    submit();

    const request = http.expectOne(apiUrl('api/actualizar-impuesto/1'));
    expect(request.request.body).toEqual({
      name: 'Impuesto sobre ventas',
      rate: 0.15,
      is_percentage: true,
      is_active: true,
    });
    request.flush({ id: 1, code: 'A01', ...request.request.body });
  });
});
