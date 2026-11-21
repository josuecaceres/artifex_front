import { Component, Injectable, inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBar,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { FaIconComponent, faCircleCheck, faXmark } from './icons';
import { MaterialModule } from './material.module';

interface ToastData {
  message: string;
}

/** Contenido del aviso (`ToastService`): icono, mensaje y botón para cerrar. */
@Component({
  selector: 'app-toast',
  imports: [MaterialModule, FaIconComponent],
  template: `
    <fa-icon class="app-toast__icon" [icon]="icons.success" />
    <span class="app-toast__message">{{ data.message }}</span>
    <button
      mat-icon-button
      type="button"
      class="app-toast__close"
      aria-label="Cerrar aviso"
      (click)="ref.dismiss()"
    >
      <fa-icon [icon]="icons.close" />
    </button>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .app-toast__icon {
      color: var(--app-ok);
      font-size: 20px;
    }

    .app-toast__message {
      flex: 1;
    }

    .app-toast__close {
      --mat-icon-button-state-layer-size: 36px;
      width: 36px;
      height: 36px;
      padding: 0;
      font-size: 14px;
      color: var(--app-muted);
    }
  `,
})
export class ToastComponent {
  protected readonly data = inject<ToastData>(MAT_SNACK_BAR_DATA);
  protected readonly ref =
    inject<MatSnackBarRef<ToastComponent>>(MatSnackBarRef);
  protected readonly icons = { success: faCircleCheck, close: faXmark };
}

/**
 * Avisos globales del proyecto (toast). Hoy solo de éxito: las pantallas lo
 * usan cuando un diálogo de crear o editar se cierra bien, con el `message`
 * que devuelve la API tal cual (sin traducir). Los errores no van aquí: se
 * muestran dentro del diálogo o de la pantalla.
 *
 *   this.toast.success(result.message);
 *
 * Aparece arriba a la derecha, se cierra solo a los 5 s o con su botón, y se
 * anuncia a lectores de pantalla como aviso cortés (`aria-live="polite"`).
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  /** Muestra un aviso de éxito. Sin texto usa uno genérico. */
  success(message: string | null | undefined): void {
    this.snackBar.openFromComponent(ToastComponent, {
      data: { message: message?.trim() || 'Cambios guardados.' },
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      politeness: 'polite',
      panelClass: 'app-toast',
    });
  }
}
