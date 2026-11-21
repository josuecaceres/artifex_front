import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import {
  BRAND,
  FaIconComponent,
  MENU_ITEMS,
  MaterialModule,
  MenuGroup,
  faArrowRightFromBracket,
  faCheck,
  faMoon,
  faSun,
  faUser,
  ConfirmService,
  copyrightText,
  isMenuGroup,
  ThemeMode,
  ThemeService,
} from '@shared';
import { AuthService } from '@auth/services';
import { filter, map } from 'rxjs';

/**
 * Layout privado: riel de navegación, barra superior (botón de tema) y el contenido de
 * cada pantalla en `<router-outlet>`. Es el componente de la ruta `''` dentro
 * de `/dashboard`; sus hijas son las pantallas reales. El menú del riel sale
 * de `MENU_ITEMS` (`@shared`): los grupos se muestran como acordeón (un único
 * `mat-accordion`, así que al abrir uno se cierra el que estuviera abierto) y
 * se abren solos si la ruta activa es uno de sus enlaces.
 */
@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MaterialModule,
    FaIconComponent,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);

  protected readonly theme = inject(ThemeService);
  protected readonly brand = BRAND;
  protected readonly copyright = copyrightText();
  /** El logo no cargó (archivo ausente): se oculta en vez de mostrar un icono roto. */
  protected readonly logoFailed = signal(false);
  protected readonly icons = {
    logout: faArrowRightFromBracket,
    check: faCheck,
    user: faUser,
  };
  /** Nombre del usuario con la sesión activa. */
  protected readonly userName = computed(
    () => this.auth.user()?.name || 'Usuario',
  );
  /** Roles separados por coma; vacío si la sesión no los trae. */
  protected readonly roleLabel = computed(() => this.auth.roles().join(', '));
  /** Sol o luna según el tema que se está viendo (en "Sistema", el del equipo). */
  protected readonly themeIcon = computed(() =>
    this.theme.resolved() === 'dark' ? faMoon : faSun,
  );
  protected readonly themeModes: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: 'Sistema' },
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
  ];

  protected readonly menuItems = MENU_ITEMS;
  protected readonly isMenuGroup = isMenuGroup;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected isGroupActive(group: MenuGroup): boolean {
    const url = this.currentUrl();
    return group.children.some((child) => url.startsWith(child.path));
  }

  /** Pide confirmación; solo si el usuario acepta cierra la sesión. */
  protected async logout(): Promise<void> {
    if (!(await this.confirm.ask('¿Seguro que quieres cerrar sesión?'))) {
      return;
    }
    this.auth
      .logout()
      .subscribe(() => void this.router.navigateByUrl('/auth/login'));
  }
}
