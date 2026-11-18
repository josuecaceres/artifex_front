import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppUser } from '@interfaces';
import { apiUrl } from './api';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista los usuarios con GET /api/users', () => {
    const users: AppUser[] = [
      {
        id: 1,
        name: 'M. Rojas',
        acronym: 'MROJAS',
        email: 'm.rojas@ejemplo.com',
        branch_id: 1,
        authorized: true,
        is_active: true,
      },
    ];
    let result: AppUser[] | undefined;

    service.list().subscribe((response) => (result = response));
    const request = http.expectOne(apiUrl('api/users'));
    expect(request.request.method).toBe('GET');
    request.flush(users);

    expect(result).toEqual(users);
  });

  it('crea un usuario con POST /api/crear-usuario', () => {
    const body = {
      name: 'Nuevo usuario',
      acronym: 'NUSR',
      email: 'nuevo@ejemplo.com',
      branch_id: 1,
    };

    service.create(body).subscribe();
    const request = http.expectOne(apiUrl('api/crear-usuario'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 2, ...body, authorized: false, is_active: true });
  });

  it('edita un usuario con PATCH /api/editar-usuario/{id}', () => {
    const body = {
      name: 'M. Rojas',
      acronym: 'MROJAS',
      email: 'm.rojas@ejemplo.com',
      branch_id: 1,
      authorized: true,
      is_active: true,
    };

    service.update(2, body).subscribe();
    const request = http.expectOne(apiUrl('api/editar-usuario/2'));
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(body);
    request.flush({ id: 2, ...body });
  });

  it('pide el cambio de contraseña con POST /api/change-password', () => {
    const body = {
      name: 'M. Rojas',
      acronym: 'MROJAS',
      email: 'm.rojas@ejemplo.com',
      password: 'nueva-contraseña',
    };
    let done = false;

    service.changePassword(body).subscribe(() => (done = true));
    const request = http.expectOne(apiUrl('api/change-password'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush({ message: 'Contraseña actualizada' });

    expect(done).toBeTrue();
  });
});
