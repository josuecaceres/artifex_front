import { formColumns } from '@shared';

/**
 * Comprueba la distribución de un diálogo de formulario: las columnas deben ser
 * las que da la regla por número de controles (campos e interruptores; los dos
 * selectores de ubicación cuentan como dos) y todos los interruptores deben ir
 * juntos y al final.
 */
export function expectFormLayout(
  element: HTMLElement,
  columns: 1 | 2 | 3,
): void {
  const content = element.querySelector('mat-dialog-content')!;
  const controls = content.querySelectorAll(
    'mat-form-field, mat-slide-toggle',
  ).length;

  expect(content.classList).toContain('app-form');
  expect(content.classList.contains('app-form--2')).toBe(columns === 2);
  expect(content.classList.contains('app-form--3')).toBe(columns === 3);
  expect(formColumns(controls))
    .withContext(`${controls} controles`)
    .toBe(columns);

  const toggles = Array.from(content.querySelectorAll('mat-slide-toggle'));
  if (toggles.length > 0) {
    const row = content.querySelector('.app-form__switches')!;
    expect(row).not.toBeNull();
    expect(toggles.every((toggle) => row.contains(toggle))).toBe(true);
    expect(content.lastElementChild).toBe(row);
  }
}
