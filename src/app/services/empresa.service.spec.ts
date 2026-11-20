import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Empresa } from '@interfaces';
import { apiUrl } from './api';
import { EmpresaService } from './empresa.service';

describe('EmpresaService', () => {
  let service: EmpresaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(EmpresaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista las empresas con GET /api/info-empresa', () => {
    const empresas: Empresa[] = [
      {
        id: 1,
        name: 'Company 01',
        nit: '12365478912364',
        nrc: '1236589',
        activity_code: '75000',
        activity_description: 'Actividades de compra y venta',
        comercial_name: 'Tu empresa',
        email: 'contacto@empresa.com',
        phone: '1234567890',
        api_key: null,
        private_password: null,
      },
    ];
    let result: Empresa[] | undefined;

    service.list().subscribe((response) => (result = response));
    const request = http.expectOne(apiUrl('api/info-empresa'));
    expect(request.request.method).toBe('GET');
    request.flush(empresas);

    expect(result).toEqual(empresas);
  });

  it('crea una empresa con POST /api/crear-empresa', () => {
    const body = {
      name: 'Company 01',
      nit: '12365478912364',
      nrc: '1236589',
      activity_code: '75000',
      activity_description: 'Actividades de compra y venta',
      comercial_name: 'Tu empresa',
      email: 'contacto@empresa.com',
      phone: '1234567890',
    };

    service.create(body).subscribe();
    const request = http.expectOne(apiUrl('api/crear-empresa'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({ message: 'Company created successfully', data: { id: 2 } });
  });

  it('edita una empresa con PUT /api/actualizar-empresa/{id}', () => {
    const body = {
      name: 'Company 01',
      nit: '12365478912364',
      nrc: '1236589',
      activity_code: '75000',
      activity_description: 'Actividades de compra y venta',
      comercial_name: 'Tu empresa',
      email: 'contacto@empresa.com',
      phone: '1234567890',
    };

    service.update(1, body).subscribe();
    const request = http.expectOne(apiUrl('api/actualizar-empresa/1'));
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(body);
    request.flush({ message: 'Company updated successfully', data: { id: 1 } });
  });
});
