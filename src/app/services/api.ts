import { environment } from '../../environments/environment';

/** Rutas de la API que no llevan el token (`Authorization`). */
export const PUBLIC_API_PATHS: readonly string[] = [
  '/api/login',
  '/api/change-password',
];

/** Dirección completa de un endpoint: `apiUrl('api/login')`. Tolera barras de más o de menos. */
export function apiUrl(path: string): string {
  return `${environment.apiUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}
