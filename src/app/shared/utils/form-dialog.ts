import { Provider } from '@angular/core';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
} from '@angular/material/form-field';

/**
 * Estilo de los diálogos de formulario (crear y editar) de las pantallas del
 * dashboard. Es **opt-in**: la pantalla lo pide al abrir su diálogo, así los
 * diálogos que no lo piden (hoy el de Roles y permisos) no cambian.
 *
 *   this.dialog.open(UsuarioDialog, {
 *     ...FORM_DIALOG_CONFIG,
 *     data,
 *     width: formDialogWidth(columns),
 *   });
 *
 * Qué activa (los estilos están en `styles/components/_dialogs.scss`):
 * título capitalizado, ancho de hasta 92 % de la ventana, alto del contenido
 * sin tope propio (solo hay scroll si no cabe en la ventana) y el contenido
 * como cuadrícula (`app-form`, ver más abajo).
 */
export const FORM_DIALOG_CONFIG = {
  panelClass: 'app-form-dialog',
  maxWidth: '92vw',
  maxHeight: 'calc(100vh - 48px)',
} as const;

/** Columnas de un formulario según su número de controles. */
export type FormColumns = 1 | 2 | 3;

/**
 * Columnas según los controles que muestra el diálogo (campos, interruptores
 * y casillas; los dos selectores de ubicación cuentan como dos): hasta 5, una;
 * de 6 a 10, dos; más de 10, tres. Se cuentan los del modo en que se abre
 * (crear o editar).
 */
export function formColumns(controls: number): FormColumns {
  return controls > 10 ? 3 : controls > 5 ? 2 : 1;
}

/** Ancho del diálogo: una columna conserva el que pida cada diálogo (`oneColumn`). */
export function formDialogWidth(
  columns: FormColumns,
  oneColumn = '420px',
): string {
  return columns === 3 ? '960px' : columns === 2 ? '720px' : oneColumn;
}

/**
 * En los diálogos cada campo reserva siempre el espacio de su error o aviso
 * ("Ingresa el nombre.", "Cargando…"), así el diálogo no crece al validar. Se
 * agrega en los `providers` del componente del diálogo: el valor global de la
 * aplicación es `dynamic` (el espacio aparece solo cuando hay texto).
 */
export const FIXED_SUBSCRIPT_PROVIDER: Provider = {
  provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
  useValue: {
    appearance: 'outline',
    subscriptSizing: 'fixed',
  } satisfies MatFormFieldDefaultOptions,
};
