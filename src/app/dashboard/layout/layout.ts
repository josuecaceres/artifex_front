import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import {
  FaIconComponent,
  MENU_ITEMS,
  MaterialModule,
  MenuGroup,
  faArrowRightFromBracket,
  isMenuGroup,
} from '@shared';
import { AuthService, ThemeMode, ThemeService } from '@services';
import { filter, map } from 'rxjs';

/**
 * Layout privado: riel de navegación, barra superior (tema) y el contenido de
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

  protected readonly theme = inject(ThemeService);
  protected readonly icons = {
    logout: faArrowRightFromBracket,
  };
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

  protected logout(): void {
    this.auth
      .logout()
      .subscribe(() => void this.router.navigateByUrl('/auth/login'));
  }
}
