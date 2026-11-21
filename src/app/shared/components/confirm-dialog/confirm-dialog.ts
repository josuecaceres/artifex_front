import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '@shared/material.module';

/**
 * Opciones de una confirmación (`ConfirmService.ask`). Solo `message` es
 * obligatorio; el resto tiene un valor por defecto.
 */
export interface ConfirmOptions {
  /** Pregunta que se muestra al usuario. */
  message: string;
  /** Título del diálogo. Por defecto "Confirmación". */
  title?: string;
  /** Texto del botón que acepta. Por defecto "Sí". */
  confirmLabel?: string;
  /** Texto del botón que rechaza. Por defecto "No". */
  cancelLabel?: string;
}

/** Opciones de `ConfirmOptions` con sus valores por defecto ya aplicados. */
export type ConfirmData = Required<ConfirmOptions>;

/** Aplica los valores por defecto de una confirmación. */
export function confirmData(options: string | ConfirmOptions): ConfirmData {
  const given = typeof options === 'string' ? { message: options } : options;
  return {
    title: 'Confirmación',
    confirmLabel: 'Sí',
    cancelLabel: 'No',
    ...given,
  };
}

/**
 * Diálogo de confirmación con dos opciones. Se abre con `ConfirmService.ask`
 * (`@shared`), no directamente: ahí se convierte la respuesta en una
 * promesa. Cierra con `true` ("Sí"); cualquier otra salida (el botón "No",
 * Esc o un clic fuera) cierra con `false`. El foco inicial queda en "No" para
 * que Enter no confirme por accidente.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [MaterialModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p class="app-confirm__message">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        mat-stroked-button
        type="button"
        [mat-dialog-close]="false"
        cdkFocusInitial
      >
        {{ data.cancelLabel }}
      </button>
      <button mat-flat-button type="button" [mat-dialog-close]="true">
        {{ data.confirmLabel }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .app-confirm__message {
      margin: 0;
    }
  `,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmData>(MAT_DIALOG_DATA);
}
