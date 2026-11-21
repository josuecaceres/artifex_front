import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Impuesto } from '@inventario/interfaces';
import { apiUrl } from '@shared/utils/api';
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
        rate: '13.0000',
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

  it('crea un impuesto con POST /api/crear-impuesto', () => {
    const body = {
      name: 'Impuesto sobre ventas',
      code: 'A01',
      rate: 0.15,
      is_percentage: true,
    };

    service.create(body).subscribe();
    const request = http.expectOne(apiUrl('api/crear-impuesto'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({ message: 'Tax created successfully', data: { id: 2 } });
  });

  it('edita un impuesto con PATCH /api/actualizar-impuesto/{id}, enviando también el code', () => {
    const body = {
      name: 'Impuesto sobre ventas',
      code: 'A01',
      rate: 0.15,
      is_percentage: true,
      is_active: false,
    };

    service.update(1, body).subscribe();
    const request = http.expectOne(apiUrl('api/actualizar-impuesto/1'));
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(body);
    request.flush({ message: 'Tax updated successfully', data: { id: 1 } });
  });
});
