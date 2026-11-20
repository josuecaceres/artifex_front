import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppUser } from '@interfaces';
import { apiUrl } from '@services';
import { Usuarios } from './usuarios';

describe('Usuarios', () => {
  let fixture: ComponentFixture<Usuarios>;
  let http: HttpTestingController;

  const users: AppUser[] = [
    {
      id: 1,
      name: 'M. Rojas',
      acronym: 'MROJAS',
      email: 'm.rojas@ejemplo.com',
      roles: ['Company Admin'],
      branch: 'Sucursal Central',
      branch_id: 1,
      authorized: true,
      is_active: true,
    },
    {
      id: 2,
      name: 'system admin',
      acronym: 'SysAdmin',
      email: 'sys@ejemplo.com',
      roles: ['System Admin'],
      branch: null,
      branch_id: null,
      authorized: false,
      is_active: true,
    },
  ];

  async function createComponent(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Usuarios],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Usuarios);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  it('pide la lista de usuarios y la muestra en la tabla', async () => {
    await createComponent();
    http.expectOne(apiUrl('api/users')).flush(users);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('M. Rojas');
    expect(element.textContent).toContain('Company Admin');
    expect(element.textContent).toContain('Sucursal Central');
    expect(element.textContent).toContain('Pendiente');
  });

  it('muestra el mensaje de error si la lista falla', async () => {
    await createComponent();
    http
      .expectOne(apiUrl('api/users'))
      .flush(
        { message: 'Su IP no está autorizada.' },
        { status: 403, statusText: '' },
      );
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Su IP no está autorizada.');
  });
});
