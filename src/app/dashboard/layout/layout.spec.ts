import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService, ThemeService } from '@services';
import { ConfirmService } from '@shared';
import { of } from 'rxjs';
import { version } from '../../../../package.json';
import { Layout } from './layout';

describe('Layout', () => {
  let fixture: ComponentFixture<Layout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: '**', component: Layout }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Layout);
    await fixture.whenStable();
  });

  it('muestra el riel con los enlaces de navegación', () => {
    const element = fixture.nativeElement as HTMLElement;
    const links = Array.from(element.querySelectorAll('.app-rail__nav a')).map(
      (a) => a.textContent?.trim(),
    );

    expect(links).toEqual([
      'Inicio',
      'Usuarios',
      'Roles y permisos',
      'Empresas',
      'Sucursales',
      'Proveedores',
      'Marcas',
      'Impuestos',
      'Categorías',
      'Unidades de medida',
    ]);
  });

  it('marca el riel con el nombre de la app', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.app-rail__brand')?.textContent).toContain(
      'Artifex',
    );
  });

  it('pone el logo al lado del nombre y la versión de package.json', () => {
    const element = fixture.nativeElement as HTMLElement;
    const logo = element.querySelector<HTMLImageElement>('.app-rail__logo');

    expect(logo?.getAttribute('src')).toBe('images/thumbnail.png');
    expect(element.querySelector('.app-rail__name')?.textContent).toBe(
      'Artifex',
    );
    expect(element.querySelector('.app-rail__version')?.textContent).toBe(
      `V${version}`,
    );
  });

  it('si el logo no carga, lo oculta y deja el nombre', async () => {
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector('.app-rail__logo')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(element.querySelector('.app-rail__logo')).toBeNull();
    expect(element.querySelector('.app-rail__name')?.textContent).toBe(
      'Artifex',
    );
  });

  it('muestra el aviso de derechos con el año actual bajo el botón de cerrar sesión', () => {
    const footer = (fixture.nativeElement as HTMLElement).querySelector(
      '.app-rail__footer',
    )!;
    const children = Array.from(footer.children);
    const logoutIndex = children.findIndex((child) =>
      child.classList.contains('app-rail__logout'),
    );

    expect(children[logoutIndex + 1].textContent).toContain(
      `© ${new Date().getFullYear()} Artifex`,
    );
  });

  describe('usuario y cierre de sesión', () => {
    let auth: AuthService;
    let confirm: jasmine.SpyObj<ConfirmService>;

    function footer(): HTMLElement {
      return (fixture.nativeElement as HTMLElement).querySelector(
        '.app-rail__footer',
      ) as HTMLElement;
    }

    function logoutButton(): HTMLButtonElement {
      return footer().querySelector('.app-rail__logout') as HTMLButtonElement;
    }

    beforeEach(async () => {
      confirm = jasmine.createSpyObj('ConfirmService', ['ask']);
      // El Layout ya se creó en el beforeEach general: se vuelve a crear con el
      // servicio de confirmación simulado.
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [Layout],
        providers: [
          provideZonelessChangeDetection(),
          provideRouter([{ path: '**', component: Layout }]),
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: ConfirmService, useValue: confirm },
        ],
      }).compileComponents();
      auth = TestBed.inject(AuthService);
      auth.setUser({ id: 1, name: 'M. Rojas', email: 'm.rojas@ejemplo.com' });
      auth.setRoles(['System Admin']);
      fixture = TestBed.createComponent(Layout);
      await fixture.whenStable();
    });

    afterEach(() => auth.clearSession());

    it('muestra el avatar, el nombre y el rol del usuario en lugar de "Sesión"', () => {
      expect(footer().textContent).not.toContain('Sesión');
      expect(footer().querySelector('.app-rail__avatar svg')).not.toBeNull();
      expect(footer().querySelector('.app-rail__user-name')?.textContent).toBe(
        'M. Rojas',
      );
      expect(footer().querySelector('.app-rail__user-role')?.textContent).toBe(
        'System Admin',
      );
    });

    it('separa varios roles con coma', async () => {
      auth.setRoles(['System Admin', 'Cajero']);
      await fixture.whenStable();

      expect(footer().querySelector('.app-rail__user-role')?.textContent).toBe(
        'System Admin, Cajero',
      );
    });

    it('sin roles guardados muestra solo el nombre', async () => {
      auth.setRoles([]);
      await fixture.whenStable();

      expect(footer().querySelector('.app-rail__user-name')).not.toBeNull();
      expect(footer().querySelector('.app-rail__user-role')).toBeNull();
    });

    it('pregunta antes de cerrar sesión y no la cierra si responde "No"', async () => {
      confirm.ask.and.resolveTo(false);
      const logout = spyOn(auth, 'logout').and.callThrough();

      logoutButton().click();
      await fixture.whenStable();

      expect(confirm.ask).toHaveBeenCalledOnceWith(
        '¿Seguro que quieres cerrar sesión?',
      );
      expect(logout).not.toHaveBeenCalled();
    });

    it('cierra la sesión y va al login si responde "Sí"', async () => {
      confirm.ask.and.resolveTo(true);
      const logout = spyOn(auth, 'logout').and.returnValue(of(undefined));
      const navigate = spyOn(
        TestBed.inject(Router),
        'navigateByUrl',
      ).and.resolveTo(true);

      logoutButton().click();
      await fixture.whenStable();

      expect(logout).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('agrupa Usuarios y Roles y permisos en un acordeón, cerrado por defecto', () => {
    const element = fixture.nativeElement as HTMLElement;
    const header = element.querySelector('.app-rail__group mat-panel-title');

    expect(header?.textContent?.trim()).toBe('Usuarios del sistema');
    expect(
      element
        .querySelector('.app-rail__group')
        ?.classList.contains('mat-expanded'),
    ).toBe(false);
  });

  it('abre el grupo del menú cuando la ruta activa es uno de sus enlaces', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/dashboard/usuarios');
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(
      element
        .querySelector('.app-rail__group')
        ?.classList.contains('mat-expanded'),
    ).toBe(true);
  });

  describe('selector de tema', () => {
    afterEach(() => TestBed.inject(ThemeService).setMode('system'));

    function themeButton(): HTMLButtonElement {
      return (fixture.nativeElement as HTMLElement).querySelector(
        '.app-topbar__theme',
      ) as HTMLButtonElement;
    }

    async function openMenu(): Promise<HTMLButtonElement[]> {
      themeButton().click();
      await fixture.whenStable();
      return Array.from(
        document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'),
      );
    }

    it('es un botón con el texto "Tema" y un icono de sol o luna', () => {
      expect(themeButton().textContent).toContain('Tema');
      expect(themeButton().querySelector('fa-icon svg')).not.toBeNull();
      expect(
        (fixture.nativeElement as HTMLElement).querySelector(
          'mat-button-toggle-group',
        ),
      ).toBeNull();
    });

    it('el icono cambia de sol a luna según el tema que se ve', async () => {
      const theme = TestBed.inject(ThemeService);
      const iconName = () =>
        themeButton().querySelector('svg')?.getAttribute('data-icon');

      theme.setMode('light');
      await fixture.whenStable();
      expect(iconName()).toBe('sun');

      theme.setMode('dark');
      await fixture.whenStable();
      expect(iconName()).toBe('moon');
    });

    it('despliega Sistema, Claro y Oscuro y marca el modo activo', async () => {
      TestBed.inject(ThemeService).setMode('light');
      const options = await openMenu();

      expect(options.map((option) => option.textContent?.trim())).toEqual([
        'Sistema',
        'Claro',
        'Oscuro',
      ]);
      expect(options.map((o) => o.getAttribute('aria-checked'))).toEqual([
        'false',
        'true',
        'false',
      ]);
    });

    it('elegir una opción cambia el tema', async () => {
      const options = await openMenu();

      options[2].click();
      await fixture.whenStable();

      expect(TestBed.inject(ThemeService).mode()).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
