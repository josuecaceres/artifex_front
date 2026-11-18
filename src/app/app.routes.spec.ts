import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AuthService } from '@services';
import { routes } from './app.routes';

describe('rutas base', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    localStorage.removeItem('app-token');
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.removeItem('app-token'));

  function signIn(): void {
    TestBed.inject(AuthService).setToken('abc');
  }

  function heading(): string | undefined {
    return harness.routeNativeElement?.querySelector('h1')?.textContent?.trim();
  }

  describe('privadas (/dashboard)', () => {
    it('sin sesión redirige al login con la dirección pedida', async () => {
      await harness.navigateByUrl('/dashboard');

      expect(router.url).toBe('/auth/login?returnUrl=%2Fdashboard');
      expect(heading()).toBe('Iniciar sesión');
    });

    it('con sesión muestra el panel', async () => {
      signIn();

      await harness.navigateByUrl('/dashboard');

      expect(router.url).toBe('/dashboard');
      expect(heading()).toBe('Panel operativo');
    });

    it('la raíz lleva al panel (y al login si no hay sesión)', async () => {
      await harness.navigateByUrl('/');
      expect(router.url).toBe('/auth/login?returnUrl=%2Fdashboard');

      signIn();
      await harness.navigateByUrl('/');
      expect(router.url).toBe('/dashboard');
    });
  });

  describe('públicas', () => {
    it('/auth lleva al login', async () => {
      await harness.navigateByUrl('/auth');

      expect(router.url).toBe('/auth/login');
      expect(heading()).toBe('Iniciar sesión');
    });

    it('/auth/forgot-password es accesible sin sesión', async () => {
      await harness.navigateByUrl('/auth/forgot-password');

      expect(router.url).toBe('/auth/forgot-password');
      expect(heading()).toBe('Recuperar contraseña');
    });

    it('/not-found y /not-authorized están en la raíz y son accesibles sin sesión', async () => {
      await harness.navigateByUrl('/not-found');
      expect(router.url).toBe('/not-found');
      expect(heading()).toContain('No encontramos');

      await harness.navigateByUrl('/not-authorized');
      expect(router.url).toBe('/not-authorized');
      expect(heading()).toContain('No tienes acceso');
    });
  });

  describe('direcciones que no existen', () => {
    it('llevan a /not-found', async () => {
      await harness.navigateByUrl('/no-existe');
      expect(router.url).toBe('/not-found');

      await harness.navigateByUrl('/auth/no-existe');
      expect(router.url).toBe('/not-found');
    });

    it('dentro del dashboard también, con sesión', async () => {
      signIn();

      await harness.navigateByUrl('/dashboard/no-existe');

      expect(router.url).toBe('/not-found');
    });
  });
});
