import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { apiUrl } from '@services';
import { UnidadDialog } from './unidad-dialog';

describe('UnidadDialog', () => {
  let fixture: ComponentFixture<UnidadDialog>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let dialogRef: jasmine.SpyObj<MatDialogRef<UnidadDialog>>;

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
    data: { unidad?: unknown } = {},
  ): Promise<void> {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [UnidadDialog],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UnidadDialog);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  }

  afterEach(() => http.verify());

  it('muestra el título de creación sin unidad en los datos', async () => {
    await createComponent();

    expect(element.querySelector('h2')?.textContent).toContain('Nueva unidad');
  });

  it('no envía la petición si el formulario es inválido', async () => {
    await createComponent();

    submit();

    http.expectNone(apiUrl('api/crear-unidades'));
  });

  it('crea la unidad y cierra el diálogo con el resultado', async () => {
    await createComponent();
    setValue('name', 'Año Luz');
    setValue('code', '5520');
    await fixture.whenStable();

    submit();

    const request = http.expectOne(apiUrl('api/crear-unidades'));
    expect(request.request.body).toEqual({ name: 'Año Luz', code: '5520' });
    const created = { id: 2, ...request.request.body, is_active: true };
    request.flush(created);

    expect(dialogRef.close).toHaveBeenCalledWith(created);
  });

  it('precarga los datos de la unidad en modo edición', async () => {
    await createComponent({
      unidad: { id: 1, name: 'Año Luz', code: '5520', is_active: true },
    });

    expect(element.querySelector('h2')?.textContent).toContain('Editar unidad');
    expect(
      element.querySelector<HTMLInputElement>('[formcontrolname="name"]')
        ?.value,
    ).toBe('Año Luz');
  });
});
