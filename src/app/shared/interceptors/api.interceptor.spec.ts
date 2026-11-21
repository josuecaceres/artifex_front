import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { apiUrl } from '@shared/utils/api';
import { apiInterceptor } from './api.interceptor';
import { AuthService } from '@auth/services/auth.service';

describe('apiInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.removeItem('app-token');
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('app-token');
  });

  it('añade el tenant a todas las peticiones de la API, también a las públicas', () => {
    client.post(apiUrl('api/login'), {}).subscribe();

    const request = http.expectOne(apiUrl('api/login'));
    expect(request.request.headers.get('X-TENANT')).toBe(environment.tenant);
    request.flush({});
  });

  it('no envía el token a las rutas públicas', () => {
    auth.setToken('abc');

    client.post(apiUrl('api/login'), {}).subscribe();
    client.post(apiUrl('api/change-password'), {}).subscribe();

    for (const request of http.match(() => true)) {
      expect(request.request.headers.has('Authorization')).toBeFalse();
      request.flush({});
    }
  });

  it('envía el token como Bearer en las rutas privadas', () => {
    auth.setToken('abc');

    client.get(apiUrl('api/usuarios?pagina=2')).subscribe();

    const request = http.expectOne(apiUrl('api/usuarios?pagina=2'));
    expect(request.request.headers.get('Authorization')).toBe('Bearer abc');
    request.flush({});
  });

  it('no envía el token si no hay sesión', () => {
    client.get(apiUrl('api/usuarios')).subscribe();

    const request = http.expectOne(apiUrl('api/usuarios'));
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({});
  });

  it('no toca las peticiones a otros sitios', () => {
    auth.setToken('abc');

    client.get('https://otro-sitio.example/datos').subscribe();

    const request = http.expectOne('https://otro-sitio.example/datos');
    expect(request.request.headers.has('X-TENANT')).toBeFalse();
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({});
  });

  it('ante un 401 en una ruta privada cierra la sesión y lleva al login', async () => {
    auth.setToken('vencido');
    await router.navigateByUrl('/');
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);

    client.get(apiUrl('api/usuarios')).subscribe({ error: () => undefined });
    http
      .expectOne(apiUrl('api/usuarios'))
      .flush({}, { status: 401, statusText: 'No autorizado' });

    expect(auth.isAuthenticated()).toBeFalse();
    expect(navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/' },
    });
  });

  it('un 401 en el login no cierra nada: es una credencial incorrecta', () => {
    const navigate = spyOn(router, 'navigate');
    let status = 0;

    client
      .post(apiUrl('api/login'), {})
      .subscribe({ error: (e: { status: number }) => (status = e.status) });
    http
      .expectOne(apiUrl('api/login'))
      .flush({}, { status: 401, statusText: 'No autorizado' });

    expect(status).toBe(401);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('un 403 no cierra la sesión', () => {
    auth.setToken('abc');
    const navigate = spyOn(router, 'navigate');

    client.get(apiUrl('api/usuarios')).subscribe({ error: () => undefined });
    http
      .expectOne(apiUrl('api/usuarios'))
      .flush(
        { message: 'Su IP no está autorizada.' },
        { status: 403, statusText: 'Prohibido' },
      );

    expect(auth.isAuthenticated()).toBeTrue();
    expect(navigate).not.toHaveBeenCalled();
  });
});
