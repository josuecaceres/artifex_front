import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Sucursal } from '@interfaces';
import { apiUrl } from './api';
import { SucursalService } from './sucursal.service';

describe('SucursalService', () => {
  let service: SucursalService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(SucursalService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista las sucursales con GET /api/branches', () => {
    const sucursales: Sucursal[] = [
      {
        id: 1,
        name: 'Sucursal Central',
        email: 'central@ejemplo.com',
        phone: '98765432',
        manager: null,
        manager_id: null,
        branch_code: 'SPS001',
        tipo_establecimiento: 1,
        tipo_establecimiento_name: 'Sucursal',
        departamento_id: 8,
        departamento_name: 'Cuscatlán',
        municipio_id: 20,
        municipio_name: 'Cuscatlán Norte',
        complemento_direccion: 'Barrio El Centro',
        cod_estable_mh: '0001',
        cod_estable: '001',
        cod_pventa_mh: '0001',
        cod_pventa: '001',
        is_active: true,
      },
    ];
    let result: Sucursal[] | undefined;

    service.list().subscribe((response) => (result = response));
    const request = http.expectOne(apiUrl('api/branches'));
    expect(request.request.method).toBe('GET');
    request.flush(sucursales);

    expect(result).toEqual(sucursales);
  });

  it('crea una sucursal con POST /api/crear-sucursal', () => {
    const body = {
      name: 'Sucursal Siguatepeque',
      phone: '98761234',
      email: 'siguatepeque@ejemplo.com',
      tipo_establecimiento: null,
      departamento_id: 3,
      municipio_id: 301,
      complemento_direccion: 'Avenida principal',
      manager_id: null,
      branch_code: null,
      cod_estable_mh: null,
      cod_estable: null,
      cod_pventa_mh: null,
      cod_pventa: null,
      printer_uuid: null,
    };

    service.create(body).subscribe();
    const request = http.expectOne(apiUrl('api/crear-sucursal'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({
      message: 'Branch created successfully',
      data: { id: 2, ...body },
    });
  });

  it('edita una sucursal con PUT /api/actualizar-sucursal/{id}', () => {
    const body = {
      name: 'Sucursal Central',
      phone: '98765432',
      email: 'central@ejemplo.com',
      tipo_establecimiento: 1,
      departamento_id: 8,
      municipio_id: 801,
      complemento_direccion: 'Barrio El Centro',
      manager_id: 5,
      branch_code: 'SPS001',
      cod_estable_mh: '0001',
      cod_estable: '001',
      cod_pventa_mh: '0001',
      cod_pventa: '001',
      is_active: false,
    };

    service.update(1, body).subscribe();
    const request = http.expectOne(apiUrl('api/actualizar-sucursal/1'));
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(body);
    request.flush({
      message: 'Branch updated successfully',
      data: { id: 1, ...body },
    });
  });
});
