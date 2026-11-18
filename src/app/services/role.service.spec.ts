import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Permission, Role } from '@interfaces';
import { apiUrl } from './api';
import { RoleService } from './role.service';

describe('RoleService', () => {
  let service: RoleService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(RoleService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista los roles con GET /api/lista-roles', () => {
    const roles: Role[] = [
      { id: 1, name: 'Administrador', permissions: [{ permission_id: 1 }] },
    ];
    let result: Role[] | undefined;

    service.list().subscribe((response) => (result = response));
    const request = http.expectOne(apiUrl('api/lista-roles'));
    expect(request.request.method).toBe('GET');
    request.flush(roles);

    expect(result).toEqual(roles);
  });

  it('lista el catálogo de permisos con GET /api/lista-permisos', () => {
    const permissions: Permission[] = [{ id: 1, name: 'ver usuarios' }];
    let result: Permission[] | undefined;

    service.listPermissions().subscribe((response) => (result = response));
    const request = http.expectOne(apiUrl('api/lista-permisos'));
    expect(request.request.method).toBe('GET');
    request.flush(permissions);

    expect(result).toEqual(permissions);
  });

  it('lista los permisos de un rol con GET /api/permisos-del-rol/{id}', () => {
    const permissions: Permission[] = [{ id: 1, name: 'ver usuarios' }];
    let result: Permission[] | undefined;

    service.rolePermissions(1).subscribe((response) => (result = response));
    const request = http.expectOne(apiUrl('api/permisos-del-rol/1'));
    expect(request.request.method).toBe('GET');
    request.flush(permissions);

    expect(result).toEqual(permissions);
  });

  it('crea un rol con POST /api/crear-roles, permitiendo una lista vacía de permisos', () => {
    const body = { name: 'Cajero', permissions: [] };

    service.create(body).subscribe();
    const request = http.expectOne(apiUrl('api/crear-roles'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 3, ...body });
  });

  it('edita un rol con PATCH /api/actualizar-roles/{id}', () => {
    const body = { name: 'Cajero', permissions: [{ permission_id: 1 }] };

    service.update(3, body).subscribe();
    const request = http.expectOne(apiUrl('api/actualizar-roles/3'));
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 3, ...body });
  });
});
