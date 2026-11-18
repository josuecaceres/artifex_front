import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { devLogin } from '../../environments/dev-login';
import { apiUrl } from './api';
import { AuthService } from './auth.service';
import { DEV_LOGIN_OFF_KEY, devLoginInitializer } from './dev-login';

describe('devLoginInitializer', () => {
  let http: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.removeItem('app-token');
    localStorage.removeItem(DEV_LOGIN_OFF_KEY);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('app-token');
    localStorage.removeItem(DEV_LOGIN_OFF_KEY);
  });

  function run(): Promise<void> {
    return TestBed.runInInjectionContext(() => devLoginInitializer());
  }

  // `dev-login.ts` es local y puede no tener credenciales: sin ellas no hay nada que probar.
  const withCredentials = devLogin ? it : xit;

  withCredentials(
    'inicia sesión con las credenciales de desarrollo si no hay sesión',
    async () => {
      const done = run();

      const request = http.expectOne(apiUrl('api/login'));
      expect(request.request.body).toEqual(devLogin);
      request.flush({ token: 'dev-token' });
      await done;

      expect(auth.token()).toBe('dev-token');
    },
  );

  withCredentials('no llama a la API si ya hay sesión', async () => {
    auth.setToken('existente');

    await run();

    http.expectNone(apiUrl('api/login'));
    expect(auth.token()).toBe('existente');
  });

  withCredentials(
    'no llama a la API si el acceso automático está desactivado',
    async () => {
      localStorage.setItem(DEV_LOGIN_OFF_KEY, 'off');

      await run();

      http.expectNone(apiUrl('api/login'));
      expect(auth.isAuthenticated()).toBeFalse();
    },
  );

  withCredentials(
    'si el login falla, la app arranca igual sin sesión',
    async () => {
      const warn = spyOn(console, 'warn');
      const done = run();

      http
        .expectOne(apiUrl('api/login'))
        .flush(
          { message: 'Su IP no está autorizada.' },
          { status: 403, statusText: 'Prohibido' },
        );
      await done;

      expect(auth.isAuthenticated()).toBeFalse();
      expect(warn).toHaveBeenCalledWith(
        jasmine.stringContaining('Su IP no está autorizada.'),
      );
    },
  );
});
