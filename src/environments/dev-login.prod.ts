import type { LoginRequest } from '@interfaces';

/** Reemplaza a `dev-login.ts` en el build de producción: nunca hay acceso automático. */
export const devLogin: LoginRequest | null = null;
