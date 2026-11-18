import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage } from './api-error';

describe('apiErrorMessage', () => {
  function failure(status: number, error: unknown = null): HttpErrorResponse {
    return new HttpErrorResponse({ status, error });
  }

  it('usa el mensaje que devuelve el backend', () => {
    const error = failure(403, {
      message: 'Su IP no está autorizada.',
      ip: '190.0.0.1',
    });

    expect(apiErrorMessage(error)).toBe('Su IP no está autorizada.');
  });

  it('usa un texto según el código si el backend no trae mensaje', () => {
    expect(apiErrorMessage(failure(401))).toBe(
      'El usuario o la contraseña no coinciden.',
    );
    expect(apiErrorMessage(failure(0))).toContain('No hay conexión');
  });

  it('ignora un mensaje vacío o que no es texto', () => {
    expect(apiErrorMessage(failure(401, { message: '  ' }))).toContain(
      'no coinciden',
    );
    expect(apiErrorMessage(failure(401, { message: { a: 1 } }))).toContain(
      'no coinciden',
    );
  });

  it('usa un texto genérico para cualquier otro error', () => {
    expect(apiErrorMessage(failure(500))).toContain('No pudimos completar');
    expect(apiErrorMessage(new Error('x'))).toContain('No pudimos completar');
  });
});
