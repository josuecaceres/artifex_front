import { Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SaveResult, Unidad } from '@interfaces';
import { UnidadService, apiErrorMessage } from '@services';
import {
  FaIconComponent,
  FIXED_SUBSCRIPT_PROVIDER,
  MaterialModule,
  SubmitLock,
  SubmitResult,
  faTriangleExclamation,
} from '@shared';
import { EMPTY, catchError, tap } from 'rxjs';

/** Datos del diálogo: sin `unidad`, crea; con `unidad`, edita esa unidad. */
export interface UnidadDialogData {
  unidad?: Unidad;
}

/** Crear o editar una unidad (`POST /api/crear-unidades`, `PATCH /api/actualizar-unidad/{id}`). */
@Component({
  selector: 'app-unidad-dialog',
  imports: [ReactiveFormsModule, MaterialModule, FaIconComponent, SubmitLock],
  providers: [FIXED_SUBSCRIPT_PROVIDER],
  templateUrl: './unidad-dialog.html',
})
export class UnidadDialog {
  private readonly dialogRef =
    inject<MatDialogRef<UnidadDialog, SaveResult | undefined>>(MatDialogRef);
  private readonly unidadService = inject(UnidadService);

  protected readonly data = inject<UnidadDialogData>(MAT_DIALOG_DATA);
  protected readonly isEdit = !!this.data.unidad;
  protected readonly icons = { warning: faTriangleExclamation };
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [this.data.unidad?.name ?? '', Validators.required],
    code: [this.data.unidad?.code ?? '', Validators.required],
    is_active: [this.data.unidad?.is_active ?? true],
  });

  protected readonly submit = (): SubmitResult => {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, code, is_active } = this.form.getRawValue();
    const request = this.isEdit
      ? this.unidadService.update(this.data.unidad!.id, {
          name,
          code,
          is_active,
        })
      : this.unidadService.create({ name, code });

    return request.pipe(
      tap((unidad) => this.dialogRef.close(unidad)),
      catchError((error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        return EMPTY;
      }),
    );
  };
}
