import { SpanishPaginatorIntl } from './spanish-paginator-intl';

describe('SpanishPaginatorIntl', () => {
  const intl = new SpanishPaginatorIntl();

  it('traduce las etiquetas', () => {
    expect(intl.itemsPerPageLabel).toBe('Filas por página');
    expect(intl.nextPageLabel).toBe('Página siguiente');
  });

  it('describe el rango visible', () => {
    expect(intl.getRangeLabel(0, 10, 25)).toBe('1 – 10 de 25');
    expect(intl.getRangeLabel(2, 10, 25)).toBe('21 – 25 de 25');
  });

  it('maneja una lista vacía', () => {
    expect(intl.getRangeLabel(0, 10, 0)).toBe('0 de 0');
  });
});
