import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RoleWithPermissions } from '@interfaces';
import { apiUrl } from '@services';
import { Roles } from './roles';
import { describeTableScreen } from '../table-screen.testing.spec';

describe('Roles', () => {
  let fixture: ComponentFixture<Roles>;
  let http: HttpTestingController;

  const roles: RoleWithPermissions[] = [
    {
      id: 1,
      name: 'Administrador',
      guard_name: 'api',
      permissions: [
        { id: 1, name: 'ver usuarios' },
        { id: 2, name: 'crear usuarios' },
      ],
    },
    { id: 2, name: 'Vacío', guard_name: 'api', permissions: [] },
  ];

  async function createComponent(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Roles],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Roles);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  it('pide la lista de roles y la muestra en la tabla', async () => {
    await createComponent();
    http.expectOne(apiUrl('api/roles-permisos')).flush(roles);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Administrador');
    const rows = Array.from(element.querySelectorAll('tr.mat-mdc-row'));
    expect(rows[0].textContent).toContain('2');
    expect(rows[1].textContent).toContain('0');
  });

  it('muestra el mensaje de error si la lista falla', async () => {
    await createComponent();
    http
      .expectOne(apiUrl('api/roles-permisos'))
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

describeTableScreen('Roles', Roles, 'Nuevo rol');
