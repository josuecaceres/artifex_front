import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Impuesto } from '@interfaces';
import { apiUrl } from './api';
import { ImpuestoService } from './impuesto.service';

describe('ImpuestoService', () => {
  let service: ImpuestoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ImpuestoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista los impuestos con GET /api/lista-impuestos', () => {
    const impuestos: Impuesto[] = [
      {
        id: 1,
        name: 'Impuesto sobre ventas',
        code: 'A01',
        rate: 0.15,
        is_percentage: true,
        is_active: true,
      },
    ];
    let result: Impuesto[] | undefined;

    service.list().subscribe((response) => (result = response));
    const request = http.expectOne(apiUrl('api/lista-impuestos'));
    expect(request.request.method).toBe('GET');
    request.flush(impuestos);

    expect(result).toEqual(impuestos);
  });

  it('crea un impuesto con POST /api/crear-impuestos', () => {
    const body = {
      name: 'Impuesto sobre ventas',
      code: 'A01',
      rate: 0.15,
      is_percentage: true,
    };

    service.create(body).subscribe();
    const request = http.expectOne(apiUrl('api/crear-impuestos'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 2, ...body, is_active: true });
  });

  it('edita un impuesto con PATCH /api/actualizar-impuesto/{id} (sin code)', () => {
    const body = {
      name: 'Impuesto sobre ventas',
      rate: 0.15,
      is_percentage: true,
      is_active: false,
    };

    service.update(1, body).subscribe();
    const request = http.expectOne(apiUrl('api/actualizar-impuesto/1'));
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 1, code: 'A01', ...body });
  });
});
