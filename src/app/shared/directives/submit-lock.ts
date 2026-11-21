import { DestroyRef, Directive, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize, from } from 'rxjs';

/** Lo que puede devolver la acción de un formulario; `undefined` si no se envió nada (p. ej. formulario inválido). */
export type SubmitResult = Observable<unknown> | Promise<unknown> | void;

/**
 * Protege un formulario contra el doble envío: mientras la acción está en curso
 * ignora cualquier otro submit (clic repetido, Enter) y expone `pending` para que
 * la plantilla bloquee el botón y muestre el estado de carga.
 *
 *   <form [formGroup]="form" [appSubmitLock]="guardar" #lock="appSubmitLock">
 *     <button mat-flat-button disabledInteractive [disabled]="lock.pending()">Guardar</button>
 *   </form>
 *
 * La acción (`guardar = () => ...`) valida el formulario y devuelve la llamada a
 * la API (Observable o Promise), o nada si no hay que enviar. Debe manejar sus
 * propios errores; el bloqueo se libera al terminar, haya salido bien o mal.
 *
 * Es una defensa del cliente: la idempotencia real de crear o editar la garantiza
 * el backend.
 */
@Directive({
  selector: 'form[appSubmitLock]',
  exportAs: 'appSubmitLock',
  host: {
    '(submit)': 'onSubmit($event)',
    '[attr.aria-busy]': 'pending()',
  },
})
export class SubmitLock {
  private readonly destroyRef = inject(DestroyRef);
  private readonly pendingState = signal(false);

  readonly action = input.required<() => SubmitResult>({
    alias: 'appSubmitLock',
  });
  readonly pending = this.pendingState.asReadonly();

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.pendingState()) {
      return;
    }

    const result = this.action()();
    if (!result) {
      return;
    }

    this.pendingState.set(true);
    from(result)
      .pipe(
        finalize(() => this.pendingState.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
