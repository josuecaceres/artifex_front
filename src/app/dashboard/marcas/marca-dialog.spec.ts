import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { apiUrl } from '@services';
import { MarcaDialog } from './marca-dialog';

describe('MarcaDialog', () => {
  let fixture: ComponentFixture<MarcaDialog>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let dialogRef: jasmine.SpyObj<MatDialogRef<MarcaDialog>>;

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
    data: { marca?: unknown } = {},
  ): Promise<void> {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [MarcaDialog],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MarcaDialog);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  }

  afterEach(() => http.verify());

  it('muestra el título de creación sin marca en los datos', async () => {
    await createComponent();

    expect(element.querySelector('h2')?.textContent).toContain('Nueva marca');
  });

  it('no envía la petición si el formulario es inválido', async () => {
    await createComponent();

    submit();

    http.expectNone(apiUrl('api/crear-marca'));
  });

  it('crea la marca y cierra el diálogo con el resultado', async () => {
    await createComponent();
    setValue('name', 'La Guangara');
    await fixture.whenStable();

    submit();

    const request = http.expectOne(apiUrl('api/crear-marca'));
    expect(request.request.body).toEqual({ name: 'La Guangara' });
    const created = { id: 2, ...request.request.body, is_active: true };
    request.flush(created);

    expect(dialogRef.close).toHaveBeenCalledWith(created);
  });

  it('precarga los datos de la marca en modo edición', async () => {
    await createComponent({
      marca: { id: 1, name: 'La Guangara', is_active: true },
    });

    expect(element.querySelector('h2')?.textContent).toContain('Editar marca');
    expect(
      element.querySelector<HTMLInputElement>('[formcontrolname="name"]')
        ?.value,
    ).toBe('La Guangara');
  });
});
