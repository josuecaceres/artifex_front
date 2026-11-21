import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialog, ConfirmOptions, confirmData } from './confirm-dialog';

/**
 * Confirmación global del proyecto: pregunta algo al usuario y devuelve una
 * promesa con su respuesta. Sirve para cualquier acción que convenga
 * confirmar (cerrar sesión hoy, borrados o cambios delicados después).
 *
 *   if (await this.confirm.ask('¿Seguro que quieres cerrar sesión?')) { … }
 *
 *   await this.confirm.ask({
 *     title: 'Desactivar usuario',
 *     message: '¿Desactivar a M. Rojas?',
 *     confirmLabel: 'Desactivar',
 *     cancelLabel: 'Cancelar',
 *   });
 *
 * La promesa **nunca se rechaza**: resuelve `true` con "Sí" y `false` con "No",
 * Esc o un clic fuera del diálogo.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialog = inject(MatDialog);

  /** Abre el diálogo; resuelve `true` solo si el usuario acepta. */
  async ask(options: string | ConfirmOptions): Promise<boolean> {
    const ref = this.dialog.open<ConfirmDialog, unknown, boolean>(
      ConfirmDialog,
      {
        data: confirmData(options),
        width: '440px',
        panelClass: 'app-confirm-dialog',
      },
    );
    return (
      (await firstValueFrom(ref.afterClosed(), { defaultValue: false })) ===
      true
    );
  }
}
