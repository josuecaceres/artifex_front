import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Unidad } from '@interfaces';
import { apiUrl } from './api';
import { UnidadService } from './unidad.service';

describe('UnidadService', () => {
  let service: UnidadService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UnidadService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista las unidades con GET /api/lista-unidades', () => {
    const unidades: Unidad[] = [
      { id: 1, name: 'Año Luz', code: '5520', is_active: true },
    ];
    let result: Unidad[] | undefined;

    service.list().subscribe((response) => (result = response));
    const request = http.expectOne(apiUrl('api/lista-unidades'));
    expect(request.request.method).toBe('GET');
    request.flush(unidades);

    expect(result).toEqual(unidades);
  });

  it('crea una unidad con POST /api/crear-unidades', () => {
    const body = { name: 'Año Luz', code: '5520' };

    service.create(body).subscribe();
    const request = http.expectOne(apiUrl('api/crear-unidades'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 2, ...body, is_active: true });
  });

  it('edita una unidad con PATCH /api/actualizar-unidad/{id}', () => {
    const body = { name: 'Año Luz', code: '5520', is_active: false };

    service.update(1, body).subscribe();
    const request = http.expectOne(apiUrl('api/actualizar-unidad/1'));
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 1, ...body });
  });
});
