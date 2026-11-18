import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { apiUrl, PUBLIC_API_PATHS } from './api';
import { AuthService } from './auth.service';

/**
 * Para las peticiones a la API (y solo a ella):
 * - añade el tenant en `X-TENANT` a todas;
 * - añade `Authorization: Bearer <token>` salvo en las rutas públicas;
 * - si una ruta privada responde 401, la sesión venció: la cierra y lleva al login.
 *
 * El 403 no cierra la sesión: significa IP o permisos, y lo muestra quien llamó.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const base = apiUrl('');
  if (!req.url.startsWith(base)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);
  const path = `/${req.url.slice(base.length).split('?')[0]}`;
  const isPublic = PUBLIC_API_PATHS.includes(path);

  let headers = req.headers.set('X-TENANT', environment.tenant);
  const token = auth.token();
  if (token && !isPublic) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  return next(req.clone({ headers })).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isPublic &&
        auth.isAuthenticated()
      ) {
        auth.clearSession();
        void router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url },
        });
      }
      return throwError(() => error);
    }),
  );
};
