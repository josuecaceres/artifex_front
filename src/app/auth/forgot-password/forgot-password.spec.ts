import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { apiUrl } from '@services';
import { ForgotPassword } from './forgot-password';

describe('ForgotPassword', () => {
  let fixture: ComponentFixture<ForgotPassword>;
  let element: HTMLElement;
  let http: HttpTestingController;

  function setValue(field: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(
      `[formcontrolname="${field}"]`,
    )!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submit(): void {
    element
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPassword],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ForgotPassword);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => http.verify());

  it('muestra el título y el enlace para volver al login', () => {
    expect(element.querySelector('h1')?.textContent).toContain(
      'Recuperar contraseña',
    );
    expect(element.querySelector('a')?.getAttribute('href')).toBe(
      '/auth/login',
    );
  });

  it('no envía la petición si las contraseñas no coinciden', async () => {
    setValue('name', 'M. Rojas');
    setValue('acronym', 'MROJAS');
    setValue('email', 'm.rojas@ejemplo.com');
    setValue('password', 'nueva-contraseña');
    setValue('confirmPassword', 'otra-distinta');
    await fixture.whenStable();

    submit();
    await fixture.whenStable();

    http.expectNone(apiUrl('api/change-password'));
    expect(element.textContent).toContain('Las contraseñas no coinciden');
  });

  it('pide el cambio de contraseña y muestra el mensaje de éxito', async () => {
    setValue('name', 'M. Rojas');
    setValue('acronym', 'MROJAS');
    setValue('email', 'm.rojas@ejemplo.com');
    setValue('password', 'nueva-contraseña');
    setValue('confirmPassword', 'nueva-contraseña');
    await fixture.whenStable();

    submit();

    const request = http.expectOne(apiUrl('api/change-password'));
    expect(request.request.body).toEqual({
      name: 'M. Rojas',
      acronym: 'MROJAS',
      email: 'm.rojas@ejemplo.com',
      password: 'nueva-contraseña',
    });
    request.flush({ message: 'Contraseña actualizada' });
    await fixture.whenStable();

    expect(element.textContent).toContain('Contraseña actualizada');
  });

  it('muestra el error del backend si el cambio falla', async () => {
    setValue('name', 'M. Rojas');
    setValue('acronym', 'MROJAS');
    setValue('email', 'm.rojas@ejemplo.com');
    setValue('password', 'nueva-contraseña');
    setValue('confirmPassword', 'nueva-contraseña');
    await fixture.whenStable();

    submit();

    http
      .expectOne(apiUrl('api/change-password'))
      .flush(
        { message: 'No encontramos ese usuario.' },
        { status: 422, statusText: '' },
      );
    await fixture.whenStable();

    expect(element.textContent).toContain('No encontramos ese usuario.');
  });
});
