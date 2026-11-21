import { Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Categoria, SaveResult } from '@interfaces';
import { CategoriaService, apiErrorMessage } from '@services';
import {
  FaIconComponent,
  FIXED_SUBSCRIPT_PROVIDER,
  MaterialModule,
  SubmitLock,
  SubmitResult,
  faTriangleExclamation,
} from '@shared';
import { EMPTY, catchError, tap } from 'rxjs';

/** Datos del diálogo: sin `categoria`, crea; con `categoria`, edita esa categoría. */
export interface CategoriaDialogData {
  categoria?: Categoria;
}

/** Crear o editar una categoría (`POST /api/crear-categoria`, `PATCH /api/actualizar-categoria/{id}`). */
@Component({
  selector: 'app-categoria-dialog',
  imports: [ReactiveFormsModule, MaterialModule, FaIconComponent, SubmitLock],
  providers: [FIXED_SUBSCRIPT_PROVIDER],
  templateUrl: './categoria-dialog.html',
})
export class CategoriaDialog {
  private readonly dialogRef =
    inject<MatDialogRef<CategoriaDialog, SaveResult | undefined>>(MatDialogRef);
  private readonly categoriaService = inject(CategoriaService);

  protected readonly data = inject<CategoriaDialogData>(MAT_DIALOG_DATA);
  protected readonly isEdit = !!this.data.categoria;
  protected readonly icons = { warning: faTriangleExclamation };
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [this.data.categoria?.name ?? '', Validators.required],
    is_active: [this.data.categoria?.is_active ?? true],
  });

  protected readonly submit = (): SubmitResult => {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, is_active } = this.form.getRawValue();
    const request = this.isEdit
      ? this.categoriaService.update(this.data.categoria!.id, {
          name,
          is_active,
        })
      : this.categoriaService.create({ name });

    return request.pipe(
      tap((categoria) => this.dialogRef.close(categoria)),
      catchError((error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        return EMPTY;
      }),
    );
  };
}
