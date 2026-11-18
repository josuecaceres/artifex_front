import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '@services';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let auth: AuthService;

  beforeEach(() => {
    localStorage.removeItem('app-token');
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.removeItem('app-token'));

  function run(url: string) {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );
  }

  it('deja pasar con sesión iniciada', () => {
    auth.setToken('abc');

    expect(run('/dashboard')).toBeTrue();
  });

  it('redirige al login con la dirección pedida si no hay sesión', () => {
    const result = run('/dashboard/usuarios') as UrlTree;

    expect(result instanceof UrlTree).toBeTrue();
    expect(result.toString()).toBe(
      '/auth/login?returnUrl=%2Fdashboard%2Fusuarios',
    );
  });
});
