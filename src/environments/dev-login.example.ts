import type { LoginRequest } from '@auth/interfaces';

/**
 * Plantilla de `dev-login.ts` (ese archivo NO se versiona: está en .gitignore).
 * `scripts/ensure-dev-login.mjs` lo crea a partir de esta plantilla si falta.
 *
 * Para trabajar en el dashboard sin pasar por el login a mano, en `dev-login.ts`
 * reemplaza `null` por las credenciales de una cuenta de desarrollo:
 *
 *   export const devLogin: LoginRequest | null = { user_name: '...', password: '...' };
 *
 * Solo se usa en desarrollo; el build de producción lo reemplaza por `dev-login.prod.ts`.
 */
export const devLogin: LoginRequest | null = null;
