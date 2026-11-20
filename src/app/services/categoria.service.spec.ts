import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Categoria } from '@interfaces';
import { apiUrl } from './api';
import { CategoriaService } from './categoria.service';

describe('CategoriaService', () => {
  let service: CategoriaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CategoriaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista las categorías con GET /api/lista-categorias', () => {
    const categorias: Categoria[] = [
      { id: 1, name: 'Productos Varios', is_active: true },
    ];
    let result: Categoria[] | undefined;

    service.list().subscribe((response) => (result = response));
    const request = http.expectOne(apiUrl('api/lista-categorias'));
    expect(request.request.method).toBe('GET');
    request.flush(categorias);

    expect(result).toEqual(categorias);
  });

  it('crea una categoría con POST /api/crear-categoria', () => {
    const body = { name: 'Productos Varios' };

    service.create(body).subscribe();
    const request = http.expectOne(apiUrl('api/crear-categoria'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 2, ...body, is_active: true });
  });

  it('edita una categoría con PATCH /api/actualizar-categoria/{id}', () => {
    const body = { name: 'Productos Varios', is_active: false };

    service.update(1, body).subscribe();
    const request = http.expectOne(apiUrl('api/actualizar-categoria/1'));
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 1, ...body });
  });
});
