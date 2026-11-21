import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { apiUrl } from '@shared/utils/api';
import { UbicacionFields } from './ubicacion-fields';

describe('UbicacionFields', () => {
  let fixture: ComponentFixture<UbicacionFields>;
  let http: HttpTestingController;
  let departamento: FormControl<number | null>;
  let municipio: FormControl<number | null>;

  const departamentos = [
    { id: 1, code: '08', name: 'La Paz' },
    { id: 3, code: '01', name: 'Ahuachapán' },
  ];

  async function createComponent(
    dep: number | null,
    mun: number | null,
  ): Promise<void> {
    departamento = new FormControl<number | null>(dep, Validators.required);
    municipio = new FormControl<number | null>(mun, Validators.required);

    await TestBed.configureTestingModule({
      imports: [UbicacionFields],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UbicacionFields);
    fixture.componentRef.setInput('departamento', departamento);
    fixture.componentRef.setInput('municipio', municipio);
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  it('sin departamento elegido solo pide los departamentos', async () => {
    await createComponent(null, null);

    http.expectOne(apiUrl('api/departamentos')).flush(departamentos);
    await fixture.whenStable();

    http.expectNone((request) => request.url.includes('/municipios'));
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Elige primero el departamento',
    );
  });

  it('con departamento precargado pide sus municipios y conserva el municipio', async () => {
    await createComponent(1, 28);

    http.expectOne(apiUrl('api/departamentos')).flush(departamentos);
    http
      .expectOne(apiUrl('api/departamentos/1/municipios'))
      .flush([{ id: 28, name: 'La Paz Oeste' }]);
    await fixture.whenStable();

    expect(municipio.value).toBe(28);
  });

  it('al cambiar el departamento vacía el municipio y pide los del nuevo', async () => {
    await createComponent(1, 28);
    http.expectOne(apiUrl('api/departamentos')).flush(departamentos);
    http
      .expectOne(apiUrl('api/departamentos/1/municipios'))
      .flush([{ id: 28, name: 'La Paz Oeste' }]);

    departamento.setValue(3);
    http
      .expectOne(apiUrl('api/departamentos/3/municipios'))
      .flush([{ id: 1, name: 'Ahuachapán Norte' }]);
    await fixture.whenStable();

    expect(municipio.value).toBeNull();
  });

  it('ignora la respuesta vieja si el departamento cambia antes de que llegue', async () => {
    await createComponent(null, null);
    http.expectOne(apiUrl('api/departamentos')).flush(departamentos);

    departamento.setValue(1);
    const viejo = http.expectOne(apiUrl('api/departamentos/1/municipios'));
    departamento.setValue(3);
    const nuevo = http.expectOne(apiUrl('api/departamentos/3/municipios'));
    nuevo.flush([{ id: 1, name: 'Ahuachapán Norte' }]);
    await fixture.whenStable();

    expect(viejo.cancelled).toBeTrue();
    expect(fixture.componentInstance['municipios']().map((m) => m.id)).toEqual([
      1,
    ]);
  });

  it('avisa si no se pueden cargar los catálogos', async () => {
    await createComponent(null, null);

    http
      .expectOne(apiUrl('api/departamentos'))
      .flush({}, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No pudimos cargar',
    );
  });
});
