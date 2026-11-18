import { formatCurrency, registerLocaleData } from '@angular/common';
import localeEsHn from '@angular/common/locales/es-HN';
import { Pipe, PipeTransform } from '@angular/core';

// Datos de formato de Honduras: solo se usan para la moneda; el resto de la
// interfaz sigue con el idioma `es` (ver `app.config.ts`).
registerLocaleData(localeEsHn, 'es-HN');

const SYMBOL = 'L '; // "L" + espacio sin salto, para que el símbolo no quede solo en una línea.

/**
 * Da formato de lempiras: `1240.5 | lempira` → `L 1,240.50`.
 * Devuelve `null` si el valor está vacío o no es un número.
 */
@Pipe({ name: 'lempira' })
export class LempiraPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    digitsInfo = '1.2-2',
  ): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const amount = Number(value);
    return Number.isNaN(amount)
      ? null
      : formatCurrency(amount, 'es-HN', SYMBOL, 'HNL', digitsInfo);
  }
}
