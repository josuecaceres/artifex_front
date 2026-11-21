import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AppUser } from '@usuarios-sistema/interfaces';
import { apiUrl } from '@shared';
import { Usuarios } from './usuarios';
import { describeTableScreen } from '@shared/testing/table-screen.testing.spec';

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

  describe('búsqueda y columnas', () => {
    async function loadUsers(): Promise<HTMLElement> {
      await createComponent();
      http.expectOne(apiUrl('api/users')).flush(users);
      fixture.detectChanges();
      await fixture.whenStable();
      return fixture.nativeElement as HTMLElement;
    }

    const bodyRows = (element: HTMLElement) =>
      Array.from(element.querySelectorAll('tr.mat-mdc-row'));

    async function search(element: HTMLElement, text: string): Promise<void> {
      const input = element.querySelector<HTMLInputElement>(
        '.app-toolbar__search input',
      )!;
      input.value = text;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();
    }

    it('el buscador deja solo las filas que coinciden', async () => {
      const element = await loadUsers();
      expect(bodyRows(element).length).toBe(2);

      await search(element, 'sucursal central');

      expect(bodyRows(element).length).toBe(1);
      expect(bodyRows(element)[0].textContent).toContain('M. Rojas');
    });

    it('busca también por lo que muestra la celda ("Pendiente")', async () => {
      const element = await loadUsers();

      await search(element, 'pendiente');

      expect(bodyRows(element).length).toBe(1);
      expect(bodyRows(element)[0].textContent).toContain('system admin');
    });

    it('sin coincidencias avisa con el texto buscado', async () => {
      const element = await loadUsers();

      await search(element, 'zzz');

      expect(element.textContent).toContain('Sin resultados para «zzz».');
      expect(element.textContent).not.toContain('No hay usuarios todavía.');
    });

    it('ocultar una columna en el menú la quita de la tabla', async () => {
      const element = await loadUsers();
      const headers = () =>
        Array.from(element.querySelectorAll('th')).map((th) =>
          th.textContent?.trim(),
        );
      expect(headers()).toContain('Siglas');

      element
        .querySelector<HTMLButtonElement>('.app-toolbar__columns')!
        .click();
      await fixture.whenStable();
      const siglas = Array.from(
        document.querySelectorAll<HTMLButtonElement>(
          '[role="menuitemcheckbox"]',
        ),
      ).find((item) => item.textContent?.trim() === 'Siglas')!;
      siglas.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(headers()).not.toContain('Siglas');
      expect(headers()[0]).toBe('Acciones');
      document
        .querySelectorAll('.cdk-overlay-container')
        .forEach((container) => (container.innerHTML = ''));
    });
  });

  it('al recargar con datos, muestra el velo sobre la tabla y no el indicador suelto', async () => {
    await createComponent();
    http.expectOne(apiUrl('api/users')).flush(users);
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.page__reload')).toBeNull();

    spyOn(fixture.debugElement.injector.get(MatDialog), 'open').and.returnValue(
      {
        afterClosed: () => of({ message: 'User updated successfully' }),
      } as unknown as MatDialogRef<unknown, unknown>,
    );
    element
      .querySelector<HTMLButtonElement>(
        'app-table-toolbar .app-toolbar__start button',
      )!
      .click();
    fixture.detectChanges();
    await fixture.whenStable();

    // Recargando: la tabla sigue visible, con el velo encima; no hay un indicador que la empuje.
    expect(
      element.querySelector('.page__table-wrap .page__reload mat-spinner'),
    ).not.toBeNull();
    expect(element.querySelectorAll('tr.mat-mdc-row').length).toBe(2);
    expect(element.querySelector('.page > mat-spinner')).toBeNull();
    expect(
      element.querySelector('.page__table')?.getAttribute('aria-busy'),
    ).toBe('true');

    http.expectOne(apiUrl('api/users')).flush(users);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(element.querySelector('.page__reload')).toBeNull();
  });

  it('la primera carga (sin datos) usa el indicador centrado, no el velo', async () => {
    await createComponent();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.page > mat-spinner')).not.toBeNull();
    expect(element.querySelector('.page__reload')).toBeNull();

    http.expectOne(apiUrl('api/users')).flush(users);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(element.querySelector('.page > mat-spinner')).toBeNull();
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

describeTableScreen('Usuarios', Usuarios, 'Nuevo usuario');
