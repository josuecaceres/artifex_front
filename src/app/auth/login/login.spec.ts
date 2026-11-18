import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { apiUrl, AuthService } from '@services';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let element: HTMLElement;
  let http: HttpTestingController;
  let router: Router;
  let navigate: jasmine.Spy;

  beforeEach(async () => {
    localStorage.removeItem('app-token');
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    navigate = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture = TestBed.createComponent(Login);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('app-token');
  });

  function field(name: 'user_name' | 'password'): HTMLInputElement {
    return element.querySelector<HTMLInputElement>(
      `input[formcontrolname="${name}"]`,
    )!;
  }

  function type(name: 'user_name' | 'password', value: string): void {
    const input = field(name);
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function submit(): Promise<void> {
    element
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  it('muestra el título y el enlace para recuperar la contraseña', () => {
    expect(element.querySelector('h1')?.textContent).toContain(
      'Iniciar sesión',
    );
    expect(
      element.querySelector('a[href="/auth/forgot-password"]')?.textContent,
    ).toContain('¿Olvidaste tu contraseña?');
  });

  it('con campos vacíos no llama a la API y muestra los errores', async () => {
    await submit();

    http.expectNone(apiUrl('api/login'));
    expect(element.textContent).toContain('Ingresa tu usuario.');
    expect(element.textContent).toContain('Ingresa tu contraseña.');
  });

  it('envía las credenciales (con el usuario sin espacios) y navega al dashboard', async () => {
    type('user_name', '  usuario  ');
    type('password', 'secreta');

    await submit();

    const request = http.expectOne(apiUrl('api/login'));
    expect(request.request.body).toEqual({
      user_name: 'usuario',
      password: 'secreta',
    });
    request.flush({ token: 'abc' });
    await fixture.whenStable();

    expect(TestBed.inject(AuthService).isAuthenticated()).toBeTrue();
    expect(navigate).toHaveBeenCalledWith('/dashboard');
  });

  it('muestra el mensaje del backend cuando falla (IP no autorizada)', async () => {
    type('user_name', 'usuario');
    type('password', 'secreta');

    await submit();
    http
      .expectOne(apiUrl('api/login'))
      .flush(
        { message: 'Su IP no está autorizada.', ip: '190.0.0.1' },
        { status: 403, statusText: 'Prohibido' },
      );
    await fixture.whenStable();

    const alert = element.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('No pudimos iniciar sesión.');
    expect(alert?.textContent).toContain('Su IP no está autorizada.');
    expect(TestBed.inject(AuthService).isAuthenticated()).toBeFalse();
  });

  it('protege contra el doble envío mientras espera la respuesta', async () => {
    type('user_name', 'usuario');
    type('password', 'secreta');

    await submit();
    await submit();
    await submit();

    const requests = http.match(apiUrl('api/login'));
    expect(requests.length).toBe(1);
    expect(element.querySelector('form')?.getAttribute('aria-busy')).toBe(
      'true',
    );
    expect(
      element.querySelector('button[type="submit"]')?.textContent,
    ).toContain('Entrando');

    requests[0].flush({ token: 'abc' });
    await fixture.whenStable();
    expect(element.querySelector('form')?.getAttribute('aria-busy')).toBe(
      'false',
    );
  });

  it('alterna la visibilidad de la contraseña', async () => {
    const toggle = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Mostrar contraseña"]',
    )!;

    toggle.click();
    await fixture.whenStable();

    expect(field('password').type).toBe('text');
    expect(
      element
        .querySelector('button[aria-label="Ocultar contraseña"]')
        ?.getAttribute('aria-pressed'),
    ).toBe('true');
  });

  describe('dirección de regreso (returnUrl)', () => {
    async function loginWith(returnUrl: string): Promise<jasmine.Spy> {
      // Fija el returnUrl con la navegación real y vuelve a espiar el resto.
      navigate.and.callThrough();
      await router.navigate([], { queryParams: { returnUrl } });
      navigate.calls.reset();
      navigate.and.resolveTo(true);
      fixture = TestBed.createComponent(Login);
      element = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
      type('user_name', 'usuario');
      type('password', 'secreta');
      await submit();
      http.expectOne(apiUrl('api/login')).flush({ token: 'abc' });
      await fixture.whenStable();
      return navigate;
    }

    it('vuelve a la dirección interna que se pidió', async () => {
      await loginWith('/dashboard/reportes');

      expect(navigate).toHaveBeenCalledWith('/dashboard/reportes');
    });

    it('ignora direcciones hacia otros sitios', async () => {
      await loginWith('//otro-sitio.example/robo');

      expect(navigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
