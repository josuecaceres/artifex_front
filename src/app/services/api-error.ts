import { HttpErrorResponse } from '@angular/common/http';

const FALLBACKS: Record<number, string> = {
  0: 'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.',
  401: 'El usuario o la contraseña no coinciden.',
  403: 'No tienes permiso para realizar esta acción.',
  422: 'Revisa los datos ingresados.',
};

const DEFAULT_MESSAGE =
  'No pudimos completar la solicitud. Inténtalo de nuevo.';

/**
 * Texto para mostrar al usuario cuando falla una llamada a la API. Usa el
 * `message` que devuelve el backend (por ejemplo "Su IP no está autorizada.") y,
 * si no lo hay, un texto genérico según el código de estado.
 */
export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return DEFAULT_MESSAGE;
  }
  const body: unknown = error.error;
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }
  return FALLBACKS[error.status] ?? DEFAULT_MESSAGE;
}
