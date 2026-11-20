import { Routes } from '@angular/router';

/** Rutas públicas de autenticación, bajo `/auth`. */
export const AUTH_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    title: 'Iniciar sesión',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'forgot-password',
    title: 'Crear o recuperar contraseña',
    loadComponent: () =>
      import('./forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
];
