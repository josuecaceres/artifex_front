import { Routes } from '@angular/router';

/**
 * Rutas privadas, bajo `/dashboard`. `authGuard` ya las protege desde
 * `app.routes.ts`; aquí se agregan los guards de roles y permisos de cada una.
 *
 * Todas cuelgan de `Layout` (riel + barra superior), que es el componente de
 * la ruta `''`.
 */
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then((m) => m.Layout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Inicio',
        loadComponent: () => import('./home/home').then((m) => m.Home),
      },
      {
        path: 'usuarios',
        title: 'Usuarios',
        loadComponent: () =>
          import('./usuarios/usuarios').then((m) => m.Usuarios),
      },
      {
        path: 'roles',
        title: 'Roles y permisos',
        loadComponent: () => import('./roles/roles').then((m) => m.Roles),
      },
      {
        path: 'empresas',
        title: 'Empresas',
        loadComponent: () =>
          import('./empresas/empresas').then((m) => m.Empresas),
      },
      {
        path: 'sucursales',
        title: 'Sucursales',
        loadComponent: () =>
          import('./sucursales/sucursales').then((m) => m.Sucursales),
      },
    ],
  },
];
