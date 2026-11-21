import { Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Empresa, SaveResult } from '@interfaces';
import { apiErrorMessage, EmpresaService } from '@services';
import {
  FaIconComponent,
  FIXED_SUBSCRIPT_PROVIDER,
  MaterialModule,
  SubmitLock,
  SubmitResult,
  faTriangleExclamation,
} from '@shared';
import { EMPTY, catchError, tap } from 'rxjs';

/** Datos del diálogo: sin `empresa`, crea; con `empresa`, edita esa empresa. */
export interface EmpresaDialogData {
  empresa?: Empresa;
}

/**
 * Crear o editar una empresa (`POST /api/crear-empresa`,
 * `PUT /api/actualizar-empresa/{id}`). `api_key` y `private_password` solo
 * se piden al editar, y vacíos significan no cambiarlas.
 */
@Component({
  selector: 'app-empresa-dialog',
  imports: [ReactiveFormsModule, MaterialModule, FaIconComponent, SubmitLock],
  providers: [FIXED_SUBSCRIPT_PROVIDER],
  templateUrl: './empresa-dialog.html',
})
export class EmpresaDialog {
  private readonly dialogRef =
    inject<MatDialogRef<EmpresaDialog, SaveResult | undefined>>(MatDialogRef);
  private readonly empresaService = inject(EmpresaService);

  protected readonly data = inject<EmpresaDialogData>(MAT_DIALOG_DATA);
  protected readonly isEdit = !!this.data.empresa;
  protected readonly icons = { warning: faTriangleExclamation };
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [this.data.empresa?.name ?? '', Validators.required],
    comercial_name: [
      this.data.empresa?.comercial_name ?? '',
      Validators.required,
    ],
    nit: [this.data.empresa?.nit ?? '', Validators.required],
    nrc: [this.data.empresa?.nrc ?? '', Validators.required],
    activity_code: [
      this.data.empresa?.activity_code ?? '',
      Validators.required,
    ],
    activity_description: [
      this.data.empresa?.activity_description ?? '',
      Validators.required,
    ],
    email: [
      this.data.empresa?.email ?? '',
      [Validators.required, Validators.email],
    ],
    phone: [this.data.empresa?.phone ?? '', Validators.required],
    api_key: [''],
    private_password: [''],
  });

  protected readonly submit = (): SubmitResult => {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const {
      name,
      comercial_name,
      nit,
      nrc,
      activity_code,
      activity_description,
      email,
      phone,
      api_key,
      private_password,
    } = this.form.getRawValue();
    const body = {
      name,
      comercial_name,
      nit,
      nrc,
      activity_code,
      activity_description,
      email,
      phone,
    };
    const request = this.isEdit
      ? this.empresaService.update(this.data.empresa!.id, {
          ...body,
          ...(api_key ? { api_key } : {}),
          ...(private_password ? { private_password } : {}),
        })
      : this.empresaService.create(body);

    return request.pipe(
      tap((empresa) => this.dialogRef.close(empresa)),
      catchError((error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        return EMPTY;
      }),
    );
  };
}
