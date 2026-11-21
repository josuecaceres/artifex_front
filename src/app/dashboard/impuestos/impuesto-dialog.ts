import { Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Impuesto, SaveResult } from '@interfaces';
import { ImpuestoService, apiErrorMessage } from '@services';
import {
  FaIconComponent,
  FIXED_SUBSCRIPT_PROVIDER,
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
 * Crear o editar un impuesto (`POST /api/crear-impuesto`, `PATCH
 * /api/actualizar-impuesto/{id}`), comprobados contra la API real. Al editar,
 * `code` también se envía (el backend lo exige) y se puede cambiar, pero es
 * único. `rate` llega del listado como texto con decimales: se convierte a
 * número para el formulario.
 */
@Component({
  selector: 'app-impuesto-dialog',
  imports: [ReactiveFormsModule, MaterialModule, FaIconComponent, SubmitLock],
  providers: [FIXED_SUBSCRIPT_PROVIDER],
  templateUrl: './impuesto-dialog.html',
})
export class ImpuestoDialog {
  private readonly dialogRef =
    inject<MatDialogRef<ImpuestoDialog, SaveResult | undefined>>(MatDialogRef);
  private readonly impuestoService = inject(ImpuestoService);

  protected readonly data = inject<ImpuestoDialogData>(MAT_DIALOG_DATA);
  protected readonly isEdit = !!this.data.impuesto;
  protected readonly icons = { warning: faTriangleExclamation };
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [this.data.impuesto?.name ?? '', Validators.required],
    code: [this.data.impuesto?.code ?? '', Validators.required],
    rate: [
      this.data.impuesto ? Number(this.data.impuesto.rate) : 0,
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
          code,
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
