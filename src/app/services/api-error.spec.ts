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

  describe('errores reales del backend', () => {
    it('en un 500 usa el detalle de "error" y no el título de "message"', () => {
      const error = failure(500, {
        message: 'Error saving company',
        error: 'The name field is required. (and 7 more errors)',
      });

      expect(apiErrorMessage(error)).toBe(
        'Falta completar «name». (y 7 error(es) más)',
      );
    });

    it('traduce los mensajes de validación más comunes', () => {
      const check = (detail: string, expected: string) =>
        expect(
          apiErrorMessage(failure(500, { message: 'x', error: detail })),
        ).toBe(expected);

      check(
        'The email field must be a valid email address.',
        '«email» debe ser un correo válido.',
      );
      check(
        'The password field must be at least 8 characters.',
        '«password» debe tener al menos 8 caracteres.',
      );
      check(
        'The name field must not be greater than 255 characters.',
        '«name» no puede pasar de 255 caracteres.',
      );
      check('The nit field must be a string.', '«nit» debe ser texto.');
      check(
        'The selected rol id is invalid. (and 1 more error)',
        '«rol id» no es válido. (y 1 error(es) más)',
      );
    });

    it('nunca muestra el SQL crudo: lo cambia por un texto entendible', () => {
      const duplicate = failure(500, {
        message: 'Error creating user',
        error:
          'SQLSTATE[23505]: Unique violation: 7 ERROR: duplicate key value violates unique constraint "users_name_unique" (Host: db.ejemplo.co)',
      });
      const foreignKey = failure(500, {
        message: 'Error updating branch',
        error: 'SQLSTATE[23503]: Foreign key violation: 7 ERROR: …',
      });
      const other = failure(500, {
        message: 'Error',
        error: 'SQLSTATE[HY000]: algo raro',
      });

      expect(apiErrorMessage(duplicate)).toContain('Ya existe un registro');
      expect(apiErrorMessage(duplicate)).not.toContain('SQLSTATE');
      expect(apiErrorMessage(foreignKey)).toContain('no es válido');
      expect(apiErrorMessage(other)).toContain('No pudimos completar');
    });

    it('en un 422 usa "message" aunque "error" sea genérico (Roles)', () => {
      const error = failure(422, {
        error: 'An unexpected error occurred',
        message: 'A role `X` already exists for guard `api`.',
      });

      expect(apiErrorMessage(error)).toBe(
        'A role `X` already exists for guard `api`.',
      );
    });

    it('explica el 403 de plan sin módulo con el mensaje del backend', () => {
      const error = failure(403, {
        message: 'Tu plan no incluye módulo de inventario.',
      });

      expect(apiErrorMessage(error)).toBe(
        'Tu plan no incluye módulo de inventario.',
      );
    });
  });
});
