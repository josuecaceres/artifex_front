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
 * Comprobado contra la API real: casi todos los módulos responden los errores
 * de validación con **500** y `{ message: "Error saving …", error: "The name
 * field is required." }`: el texto útil está en `error`, no en `message`. Los
 * de base de datos llegan como SQL crudo (con el host y la consulta), que no
 * debe mostrarse. Roles e Impuestos sí usan 422 con el texto en `message`.
 */
function readableDetail(detail: string): string | null {
  if (detail.includes('SQLSTATE')) {
    if (detail.includes('23505')) {
      return 'Ya existe un registro con ese valor. Revisa los datos únicos (nombre, código o correo).';
    }
    if (detail.includes('23503')) {
      return 'Alguno de los valores elegidos no es válido.';
    }
    return null;
  }
  return detail
    .replace(/^The (.+) field is required\./, 'Falta completar «$1».')
    .replace(
      /^The (.+) field must be a valid email address\./,
      '«$1» debe ser un correo válido.',
    )
    .replace(
      /^The (.+) field must be at least (\d+) characters\./,
      '«$1» debe tener al menos $2 caracteres.',
    )
    .replace(
      /^The (.+) field must not be greater than (\d+) characters\./,
      '«$1» no puede pasar de $2 caracteres.',
    )
    .replace(/^The (.+) field must be an integer\./, '«$1» debe ser un entero.')
    .replace(/^The (.+) field must be a number\./, '«$1» debe ser un número.')
    .replace(/^The (.+) field must be a string\./, '«$1» debe ser texto.')
    .replace(/^The selected (.+) is invalid\./, '«$1» no es válido.')
    .replace(/\(and (\d+) more errors?\)/, '(y $1 error(es) más)');
}

/**
 * Texto para mostrar al usuario cuando falla una llamada a la API. Prefiere el
 * detalle que devuelve el backend (por ejemplo "Su IP no está autorizada.") y,
 * si no lo hay o no es presentable, un texto genérico según el código de
 * estado.
 */
export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return DEFAULT_MESSAGE;
  }
  const body: unknown = error.error;
  if (body && typeof body === 'object') {
    const { message, error: detail } = body as {
      message?: unknown;
      error?: unknown;
    };
    const candidate =
      error.status >= 500 && typeof detail === 'string' && detail.trim()
        ? detail.trim()
        : typeof message === 'string' && message.trim()
          ? message.trim()
          : null;
    if (candidate) {
      const readable = readableDetail(candidate);
      if (readable) {
        return readable;
      }
    }
  }
  return FALLBACKS[error.status] ?? DEFAULT_MESSAGE;
}
