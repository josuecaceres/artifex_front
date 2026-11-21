import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Marca } from '@inventario/interfaces';
import { apiUrl } from '@shared/utils/api';
import { MarcaService } from './marca.service';

describe('MarcaService', () => {
  let service: MarcaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(MarcaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista las marcas con GET /api/lista-marcas', () => {
    const marcas: Marca[] = [{ id: 1, name: 'La Guangara', is_active: true }];
    let result: Marca[] | undefined;

    service.list().subscribe((response) => (result = response));
    const request = http.expectOne(apiUrl('api/lista-marcas'));
    expect(request.request.method).toBe('GET');
    request.flush(marcas);

    expect(result).toEqual(marcas);
  });

  it('crea una marca con POST /api/crear-marca', () => {
    const body = { name: 'La Guangara' };

    service.create(body).subscribe();
    const request = http.expectOne(apiUrl('api/crear-marca'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 2, ...body, is_active: true });
  });

  it('edita una marca con PATCH /api/actualizar-marca/{id}', () => {
    const body = { name: 'La Guangara', is_active: false };

    service.update(1, body).subscribe();
    const request = http.expectOne(apiUrl('api/actualizar-marca/1'));
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 1, ...body });
  });
});
