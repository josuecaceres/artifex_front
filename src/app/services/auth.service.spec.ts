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

  beforeEach(() => {
    localStorage.removeItem('app-token');
    localStorage.removeItem('app-user');
  });
  afterEach(() => {
    http.verify();
    localStorage.removeItem('app-token');
    localStorage.removeItem('app-user');
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

  describe('login', () => {
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
