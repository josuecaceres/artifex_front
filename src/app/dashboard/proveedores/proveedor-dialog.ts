import { Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Proveedor, SaveResult } from '@interfaces';
import { ProveedorService, apiErrorMessage } from '@services';
import {
  FaIconComponent,
  FIXED_SUBSCRIPT_PROVIDER,
  MaterialModule,
  SubmitLock,
  SubmitResult,
  UbicacionFields,
  faTriangleExclamation,
} from '@shared';
import { EMPTY, catchError, tap } from 'rxjs';

/** Datos del diálogo: sin `proveedor`, crea; con `proveedor`, edita ese proveedor. */
export interface ProveedorDialogData {
  proveedor?: Proveedor;
}

/**
 * Crear o editar un proveedor (`POST /api/crear-proveedor`, `PATCH
 * /api/actualizar-proveedor/{id}`). Departamento y municipio salen de los
 * catálogos de la API (`UbicacionFields`), igual que en Sucursales.
 */
@Component({
  selector: 'app-proveedor-dialog',
  imports: [
    ReactiveFormsModule,
    MaterialModule,
    FaIconComponent,
    SubmitLock,
    UbicacionFields,
  ],
  providers: [FIXED_SUBSCRIPT_PROVIDER],
  templateUrl: './proveedor-dialog.html',
})
export class ProveedorDialog {
  private readonly dialogRef =
    inject<MatDialogRef<ProveedorDialog, SaveResult | undefined>>(MatDialogRef);
  private readonly proveedorService = inject(ProveedorService);

  protected readonly data = inject<ProveedorDialogData>(MAT_DIALOG_DATA);
  protected readonly isEdit = !!this.data.proveedor;
  protected readonly icons = { warning: faTriangleExclamation };
  protected readonly errorMessage = signal<string | null>(null);

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    name: [this.data.proveedor?.name ?? '', Validators.required],
    nit: [this.data.proveedor?.nit ?? '', Validators.required],
    nrc: [this.data.proveedor?.nrc ?? '', Validators.required],
    phone: [this.data.proveedor?.phone ?? '', Validators.required],
    email: [
      this.data.proveedor?.email ?? '',
      [Validators.required, Validators.email],
    ],
    contact_person: [
      this.data.proveedor?.contact_person ?? '',
      Validators.required,
    ],
    payment_name: [
      this.data.proveedor?.payment_name ?? '',
      Validators.required,
    ],
    address_complement: [
      this.data.proveedor?.address_complement ?? '',
      Validators.required,
    ],
    departmento_id: this.fb.control<number | null>(
      this.data.proveedor?.departmento_id ?? null,
      Validators.required,
    ),
    municipio_id: this.fb.control<number | null>(
      this.data.proveedor?.municipio_id ?? null,
      Validators.required,
    ),
    has_withholding: [this.data.proveedor?.has_withholding ?? false],
    withholding_percent: [
      this.data.proveedor?.withholding_percent ?? 0,
      [Validators.required, Validators.min(0)],
    ],
    is_active: [this.data.proveedor?.is_active ?? true],
  });

  protected readonly submit = (): SubmitResult => {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const {
      name,
      nit,
      nrc,
      phone,
      email,
      contact_person,
      payment_name,
      address_complement,
      departmento_id,
      municipio_id,
      has_withholding,
      withholding_percent,
      is_active,
    } = this.form.getRawValue();
    const body = {
      name,
      nit,
      nrc,
      phone,
      email,
      contact_person,
      payment_name,
      address_complement,
      departmento_id: departmento_id!,
      municipio_id: municipio_id!,
      has_withholding,
      withholding_percent,
    };
    const request = this.isEdit
      ? this.proveedorService.update(this.data.proveedor!.id, {
          ...body,
          is_active,
        })
      : this.proveedorService.create(body);

    return request.pipe(
      tap((proveedor) => this.dialogRef.close(proveedor)),
      catchError((error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        return EMPTY;
      }),
    );
  };
}
