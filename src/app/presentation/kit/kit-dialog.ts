import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '@shared';

@Component({
  selector: 'app-kit-dialog',
  imports: [MaterialModule],
  template: `
    <h2 mat-dialog-title>Cerrar la orden {{ data.code }}</h2>
    <mat-dialog-content>
      <p>
        La orden pasará a <strong>Completado</strong> y dejará de aparecer en
        los pendientes. Esta acción se puede revertir desde el historial.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button [mat-dialog-close]="true" cdkFocusInitial>
        Cerrar orden
      </button>
    </mat-dialog-actions>
  `,
})
export class KitDialog {
  protected readonly data = inject<{ code: string }>(MAT_DIALOG_DATA);
}
