import { Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Impuesto } from '@interfaces';
import { ImpuestoService, apiErrorMessage } from '@services';
import {
  FaIconComponent,
  MaterialModule,
  SubmitLock,
  SubmitResult,
  faTriangleExclamation,
} from '@shared';
import { EMPTY, catchError, tap } from 'rxjs';

/** Datos del diálogo: sin `impuesto`, crea; con `impuesto`, edita ese impuesto. */
export interface ImpuestoDialogData {
  impuesto?: Impuesto;
}

/**
 * Crear o editar un impuesto (`POST /api/crear-impuestos`, `PATCH
 * /api/actualizar-impuesto/{id}`). `code` solo se puede fijar al crear: el
 * body de editar de Postman no lo trae, así que al editar el campo se
 * muestra deshabilitado y no se envía.
 */
@Component({
  selector: 'app-impuesto-dialog',
  imports: [ReactiveFormsModule, MaterialModule, FaIconComponent, SubmitLock],
  templateUrl: './impuesto-dialog.html',
  styleUrl: './impuesto-dialog.scss',
})
export class ImpuestoDialog {
  private readonly dialogRef =
    inject<MatDialogRef<ImpuestoDialog, Impuesto | undefined>>(MatDialogRef);
  private readonly impuestoService = inject(ImpuestoService);

  protected readonly data = inject<ImpuestoDialogData>(MAT_DIALOG_DATA);
  protected readonly isEdit = !!this.data.impuesto;
  protected readonly icons = { warning: faTriangleExclamation };
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [this.data.impuesto?.name ?? '', Validators.required],
    code: [
      { value: this.data.impuesto?.code ?? '', disabled: this.isEdit },
      Validators.required,
    ],
    rate: [
      this.data.impuesto?.rate ?? 0,
      [Validators.required, Validators.min(0)],
    ],
    is_percentage: [this.data.impuesto?.is_percentage ?? true],
    is_active: [this.data.impuesto?.is_active ?? true],
  });

  protected readonly submit = (): SubmitResult => {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, code, rate, is_percentage, is_active } =
      this.form.getRawValue();
    const request = this.isEdit
      ? this.impuestoService.update(this.data.impuesto!.id, {
          name,
          rate,
          is_percentage,
          is_active,
        })
      : this.impuestoService.create({ name, code, rate, is_percentage });

    return request.pipe(
      tap((impuesto) => this.dialogRef.close(impuesto)),
      catchError((error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        return EMPTY;
      }),
    );
  };
}
