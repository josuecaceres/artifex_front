import { Routes } from '@angular/router';

/**
 * Rutas que solo existen en desarrollo. El build de producción reemplaza este
 * archivo por `dev.routes.prod.ts` (ver `fileReplacements` en `angular.json`),
 * así que nada de lo que se importe aquí entra al bundle final.
 */
export const devRoutes: Routes = [
  {
    path: 'kit',
    title: 'Kit de componentes',
    loadComponent: () => import('./presentation/kit/kit').then((m) => m.Kit),
  },
];
