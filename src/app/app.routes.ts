import { Routes } from '@angular/router';
import { authGuard } from '@guards';
import { devRoutes } from './dev.routes';

/**
 * Rutas base. Hay dos grupos:
 *  - Públicas: `/auth/*` (login y recuperar contraseña), `/not-found` y `/not-authorized`.
 *  - Privadas: todo lo que cuelga de `/dashboard`, protegido por `authGuard`.
 *
 * Los guards de roles y permisos se agregan en las rutas de `dashboard` (o de
 * sus hijas) según se vayan necesitando.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    canActivateChild: [authGuard],
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'not-found',
    title: 'Página no encontrada',
    loadComponent: () =>
      import('./presentation/not-found/not-found').then((m) => m.NotFound),
  },
  {
    path: 'not-authorized',
    title: 'Sin acceso',
    loadComponent: () =>
      import('./presentation/not-authorized/not-authorized').then(
        (m) => m.NotAuthorized,
      ),
  },
  ...devRoutes,
  { path: '**', redirectTo: 'not-found' },
];
