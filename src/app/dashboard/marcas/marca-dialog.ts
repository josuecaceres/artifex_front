import { Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Marca, SaveResult } from '@interfaces';
import { MarcaService, apiErrorMessage } from '@services';
import {
  FaIconComponent,
  FIXED_SUBSCRIPT_PROVIDER,
  MaterialModule,
  SubmitLock,
  SubmitResult,
  faTriangleExclamation,
} from '@shared';
import { EMPTY, catchError, tap } from 'rxjs';

/** Datos del diálogo: sin `marca`, crea; con `marca`, edita esa marca. */
export interface MarcaDialogData {
  marca?: Marca;
}

/** Crear o editar una marca (`POST /api/crear-marca`, `PATCH /api/actualizar-marca/{id}`). */
@Component({
  selector: 'app-marca-dialog',
  imports: [ReactiveFormsModule, MaterialModule, FaIconComponent, SubmitLock],
  providers: [FIXED_SUBSCRIPT_PROVIDER],
  templateUrl: './marca-dialog.html',
})
export class MarcaDialog {
  private readonly dialogRef =
    inject<MatDialogRef<MarcaDialog, SaveResult | undefined>>(MatDialogRef);
  private readonly marcaService = inject(MarcaService);

  protected readonly data = inject<MarcaDialogData>(MAT_DIALOG_DATA);
  protected readonly isEdit = !!this.data.marca;
  protected readonly icons = { warning: faTriangleExclamation };
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [this.data.marca?.name ?? '', Validators.required],
    is_active: [this.data.marca?.is_active ?? true],
  });

  protected readonly submit = (): SubmitResult => {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, is_active } = this.form.getRawValue();
    const request = this.isEdit
      ? this.marcaService.update(this.data.marca!.id, { name, is_active })
      : this.marcaService.create({ name });

    return request.pipe(
      tap((marca) => this.dialogRef.close(marca)),
      catchError((error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        return EMPTY;
      }),
    );
  };
}
