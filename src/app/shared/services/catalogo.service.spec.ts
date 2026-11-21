import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { apiUrl } from '@shared/utils/api';
import { CatalogoService } from './catalogo.service';

describe('CatalogoService', () => {
  let service: CatalogoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CatalogoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista los departamentos con GET /api/departamentos', () => {
    const departamentos = [{ id: 1, code: '08', name: 'La Paz' }];
    let result: unknown;

    service.departamentos().subscribe((response) => (result = response));
    const request = http.expectOne(apiUrl('api/departamentos'));
    expect(request.request.method).toBe('GET');
    request.flush(departamentos);

    expect(result).toEqual(departamentos);
  });

  it('pide los departamentos una sola vez aunque se consulten varias', () => {
    service.departamentos().subscribe();
    service.departamentos().subscribe();

    http.expectOne(apiUrl('api/departamentos')).flush([]);
    service.departamentos().subscribe();
    http.expectNone(apiUrl('api/departamentos'));
  });

  it('lista los municipios de un departamento con GET /api/departamentos/{id}/municipios', () => {
    const municipios = [{ id: 28, name: 'La Paz Oeste' }];
    let result: unknown;

    service.municipios(1).subscribe((response) => (result = response));
    const request = http.expectOne(apiUrl('api/departamentos/1/municipios'));
    expect(request.request.method).toBe('GET');
    request.flush(municipios);

    expect(result).toEqual(municipios);
  });

  it('lista los tipos de establecimiento con GET /api/tipo-establecimiento (una sola vez)', () => {
    const tipos = [
      { id: 1, name: 'Sucursal' },
      { id: 2, name: 'Casa Matriz' },
    ];
    let result: unknown;

    service.tiposEstablecimiento().subscribe((response) => (result = response));
    service.tiposEstablecimiento().subscribe();
    http.expectOne(apiUrl('api/tipo-establecimiento')).flush(tipos);

    expect(result).toEqual(tipos);
  });
});
