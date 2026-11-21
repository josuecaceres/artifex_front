import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Proveedor } from '@inventario/interfaces';
import { apiUrl } from '@shared/utils/api';
import { ProveedorService } from './proveedor.service';

describe('ProveedorService', () => {
  let service: ProveedorService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ProveedorService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista los proveedores con GET /api/lista-proveedores', () => {
    const proveedores: Proveedor[] = [
      {
        id: 1,
        name: 'Proveedor de Insumos S.A.',
        nit: '08011999123456',
        nrc: '123456-7',
        has_withholding: true,
        withholding_percent: 10,
        payment_name: 'Transferencia Bancaria',
        departmento_id: 1,
        municipio_id: 5,
        address_complement: 'Col. Centro, 2da avenida, bloque A',
        phone: '98765432',
        email: 'contacto@proveedor.com',
        contact_person: 'Juan Pérez',
        is_active: true,
      },
    ];
    let result: Proveedor[] | undefined;

    service.list().subscribe((response) => (result = response));
    const request = http.expectOne(apiUrl('api/lista-proveedores'));
    expect(request.request.method).toBe('GET');
    request.flush(proveedores);

    expect(result).toEqual(proveedores);
  });

  it('crea un proveedor con POST /api/crear-proveedor', () => {
    const body = {
      name: 'Proveedor de Insumos S.A.',
      nit: '08011999123456',
      nrc: '123456-7',
      has_withholding: true,
      withholding_percent: 10,
      payment_name: 'Transferencia Bancaria',
      departmento_id: 1,
      municipio_id: 5,
      address_complement: 'Col. Centro, 2da avenida, bloque A',
      phone: '98765432',
      email: 'contacto@proveedor.com',
      contact_person: 'Juan Pérez',
    };

    service.create(body).subscribe();
    const request = http.expectOne(apiUrl('api/crear-proveedor'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 2, ...body, is_active: true });
  });

  it('edita un proveedor con PATCH /api/actualizar-proveedor/{id}', () => {
    const body = {
      name: 'Proveedor de Insumos S.A.',
      nit: '08011999123456',
      nrc: '123456-7',
      has_withholding: false,
      withholding_percent: 10,
      payment_name: 'Transferencia Bancaria',
      departmento_id: 1,
      municipio_id: 5,
      address_complement: 'Col. Centro, 2da avenida, bloque A',
      phone: '98765432',
      email: 'contacto@proveedor.com',
      contact_person: 'Juan Pérez',
      is_active: false,
    };

    service.update(1, body).subscribe();
    const request = http.expectOne(apiUrl('api/actualizar-proveedor/1'));
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 1, ...body });
  });
});
