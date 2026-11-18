import { DOCUMENT, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { devLogin } from '../../environments/dev-login';
import { environment } from '../../environments/environment';
import { apiErrorMessage } from './api-error';
import { AuthService } from './auth.service';

/** Clave de `localStorage` que desactiva el acceso automático: `localStorage.setItem('app-dev-login', 'off')`. */
export const DEV_LOGIN_OFF_KEY = 'app-dev-login';

/**
 * Solo en desarrollo: inicia sesión de verdad con las credenciales de
 * `src/environments/dev-login.ts` (ignorado por git) si aún no hay sesión, para
 * trabajar en el dashboard sin simular el login. Si falla, la app arranca igual
 * y se queda en la pantalla de login. En producción ese archivo se reemplaza por
 * uno vacío y esta función no hace nada.
 */
export async function devLoginInitializer(): Promise<void> {
  const auth = inject(AuthService);
  const document = inject(DOCUMENT);

  if (environment.production || !devLogin || auth.isAuthenticated()) {
    return;
  }
  try {
    if (
      document.defaultView?.localStorage.getItem(DEV_LOGIN_OFF_KEY) === 'off'
    ) {
      return;
    }
  } catch {
    // Sin acceso al almacenamiento: se intenta igual.
  }

  try {
    await firstValueFrom(auth.login(devLogin));
  } catch (error) {
    console.warn(
      `[dev-login] No se pudo iniciar sesión automáticamente: ${apiErrorMessage(error)}`,
    );
  }
}
