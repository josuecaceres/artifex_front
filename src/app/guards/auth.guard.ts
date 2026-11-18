import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services';

/**
 * Deja pasar solo con sesión iniciada. Sin sesión, redirige al login y guarda
 * la dirección pedida en `returnUrl` para volver después de entrar.
 *
 * Los guards de roles y permisos se agregan en esta carpeta como fábricas, por
 * ejemplo `permissionGuard('usuarios.ver')`, y se combinan con este en las rutas.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url },
      });
};
