import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { apiUrl } from './api';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let http: HttpTestingController;

  function createService(): AuthService {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthService);
  }

  function clearStorage(): void {
    ['app-token', 'app-user', 'app-roles'].forEach((key) =>
      localStorage.removeItem(key),
    );
  }

  beforeEach(clearStorage);
  afterEach(() => {
    http.verify();
    clearStorage();
  });

  it('empieza sin sesión', () => {
    const service = createService();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.token()).toBeNull();
  });

  it('guarda el token y marca la sesión como iniciada', () => {
    const service = createService();

    service.setToken('abc');

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.token()).toBe('abc');
    expect(localStorage.getItem('app-token')).toBe('abc');
  });

  it('cierra la sesión local y borra el token y el usuario', () => {
    const service = createService();
    service.setToken('abc');
    service.setUser({ id: 1, name: 'M. Rojas', email: 'm.rojas@ejemplo.com' });

    service.clearSession();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.user()).toBeNull();
    expect(localStorage.getItem('app-token')).toBeNull();
    expect(localStorage.getItem('app-user')).toBeNull();
  });

  it('restaura la sesión guardada al iniciar', () => {
    localStorage.setItem('app-token', 'guardado');

    const service = createService();

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.token()).toBe('guardado');
  });

  it('guarda y restaura el usuario de la sesión', () => {
    const service = createService();

    service.setUser({ id: 1, name: 'M. Rojas', email: 'm.rojas@ejemplo.com' });
    expect(service.user()?.name).toBe('M. Rojas');

    TestBed.resetTestingModule();
    const restored = createService();
    expect(restored.user()?.name).toBe('M. Rojas');
  });

  it('guarda y restaura los roles de la sesión, y los borra al cerrarla', () => {
    const service = createService();
    expect(service.roles()).toEqual([]);

    service.setRoles(['System Admin']);
    expect(service.roles()).toEqual(['System Admin']);

    TestBed.resetTestingModule();
    const restored = createService();
    expect(restored.roles()).toEqual(['System Admin']);

    restored.clearSession();
    expect(restored.roles()).toEqual([]);
    expect(localStorage.getItem('app-roles')).toBeNull();
  });

  it('ignora roles guardados que no son una lista de textos', () => {
    localStorage.setItem('app-roles', '{"x":1}');
    expect(createService().roles()).toEqual([]);

    TestBed.resetTestingModule();
    localStorage.setItem('app-roles', '["Cajero", 3]');
    expect(createService().roles()).toEqual(['Cajero']);
  });

  describe('login', () => {
    it('guarda los roles que trae el login', () => {
      const service = createService();

      service.login({ user_name: 'usuario', password: 'secreta' }).subscribe();
      http.expectOne(apiUrl('api/login')).flush({
        token: 't',
        user: { id: 1, name: 'M. Rojas', email: 'm.rojas@ejemplo.com' },
        roles: ['System Admin', 'Cajero'],
      });

      expect(service.roles()).toEqual(['System Admin', 'Cajero']);
    });

    it('envía las credenciales a /api/login y deja la sesión iniciada', () => {
      const service = createService();
      const credentials = { user_name: 'usuario', password: 'secreta' };

      service.login(credentials).subscribe();

      const request = http.expectOne(apiUrl('api/login'));
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(credentials);
      request.flush({
        token: 'nuevo-token',
        user: { id: 1, name: 'M. Rojas', email: 'm.rojas@ejemplo.com' },
      });

      expect(service.isAuthenticated()).toBeTrue();
      expect(service.token()).toBe('nuevo-token');
      expect(localStorage.getItem('app-token')).toBe('nuevo-token');
      expect(service.user()?.name).toBe('M. Rojas');
    });

    it('un usuario sin contraseña recibe 200 sin token: no inicia sesión y no es un error', () => {
      const service = createService();
      let result: unknown;
      let failed = false;

      service.login({ user_name: 'nuevo', password: 'x' }).subscribe({
        next: (response) => (result = response),
        error: () => (failed = true),
      });
      http.expectOne(apiUrl('api/login')).flush({
        require_password_setup: true,
        user_id: 9,
        message: 'Debe crear su contraseña',
      });

      expect(failed).toBeFalse();
      expect(result).toEqual(
        jasmine.objectContaining({ require_password_setup: true }),
      );
      expect(service.isAuthenticated()).toBeFalse();
      expect(localStorage.getItem('app-token')).toBeNull();
    });

    it('falla y no inicia sesión si la respuesta no trae token', () => {
      const service = createService();
      let failed = false;

      service
        .login({ user_name: 'usuario', password: 'secreta' })
        .subscribe({ error: () => (failed = true) });
      http.expectOne(apiUrl('api/login')).flush({});

      expect(failed).toBeTrue();
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('no inicia sesión si el backend rechaza las credenciales', () => {
      const service = createService();
      let failed = false;

      service
        .login({ user_name: 'usuario', password: 'mala' })
        .subscribe({ error: () => (failed = true) });
      http
        .expectOne(apiUrl('api/login'))
        .flush({ message: 'No autorizado' }, { status: 401, statusText: '' });

      expect(failed).toBeTrue();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('logout', () => {
    it('avisa al backend y cierra la sesión local', () => {
      const service = createService();
      service.setToken('abc');
      let done = false;

      service.logout().subscribe(() => (done = true));
      const request = http.expectOne(apiUrl('api/logout'));
      expect(request.request.method).toBe('POST');
      request.flush({});

      expect(done).toBeTrue();
      expect(service.isAuthenticated()).toBeFalse();
      expect(localStorage.getItem('app-token')).toBeNull();
    });

    it('cierra la sesión local aunque la llamada falle', () => {
      const service = createService();
      service.setToken('abc');
      let done = false;

      service.logout().subscribe(() => (done = true));
      http
        .expectOne(apiUrl('api/logout'))
        .flush(null, { status: 500, statusText: 'Error' });

      expect(done).toBeTrue();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });
});
