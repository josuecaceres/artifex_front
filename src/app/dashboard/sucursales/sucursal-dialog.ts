import { Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Sucursal } from '@interfaces';
import { apiErrorMessage, SucursalService } from '@services';
import {
  FaIconComponent,
  MaterialModule,
  SubmitLock,
  SubmitResult,
  faTriangleExclamation,
} from '@shared';
import { EMPTY, catchError, tap } from 'rxjs';

/** Datos del diálogo: sin `sucursal`, crea; con `sucursal`, edita esa sucursal. */
export interface SucursalDialogData {
  sucursal?: Sucursal;
}

/**
 * Crear o editar una sucursal (`POST /api/crear-sucursal`,
 * `PUT /api/actualizar-sucursal/{id}`). `departamento_id`, `municipio_id` y
 * `manager_id` quedan como campos numéricos simples por ahora: los módulos
 * de catálogos geográficos y el de usuarios como gerentes todavía no están
 * conectados aquí.
 */
@Component({
  selector: 'app-sucursal-dialog',
  imports: [ReactiveFormsModule, MaterialModule, FaIconComponent, SubmitLock],
  templateUrl: './sucursal-dialog.html',
  styleUrl: './sucursal-dialog.scss',
})
export class SucursalDialog {
  private readonly dialogRef =
    inject<MatDialogRef<SucursalDialog, Sucursal | undefined>>(MatDialogRef);
  private readonly sucursalService = inject(SucursalService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly data = inject<SucursalDialogData>(MAT_DIALOG_DATA);
  protected readonly isEdit = !!this.data.sucursal;
  protected readonly icons = { warning: faTriangleExclamation };
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: [this.data.sucursal?.name ?? '', Validators.required],
    phone: [this.data.sucursal?.phone ?? '', Validators.required],
    email: [
      this.data.sucursal?.email ?? '',
      [Validators.required, Validators.email],
    ],
    complemento_direccion: [
      this.data.sucursal?.complemento_direccion ?? '',
      Validators.required,
    ],
    departamento_id: [
      this.data.sucursal?.departamento_id ?? 1,
      [Validators.required, Validators.min(1)],
    ],
    municipio_id: [
      this.data.sucursal?.municipio_id ?? 1,
      [Validators.required, Validators.min(1)],
    ],
    tipo_establecimiento: this.fb.control<number | null>(
      this.data.sucursal?.tipo_establecimiento ?? null,
    ),
    manager_id: this.fb.control<number | null>(
      this.data.sucursal?.manager_id ?? null,
    ),
    branch_code: this.fb.control(this.data.sucursal?.branch_code ?? ''),
    cod_estable_mh: this.fb.control(this.data.sucursal?.cod_estable_mh ?? ''),
    cod_estable: this.fb.control(this.data.sucursal?.cod_estable ?? ''),
    cod_pventa_mh: this.fb.control(this.data.sucursal?.cod_pventa_mh ?? ''),
    cod_pventa: this.fb.control(this.data.sucursal?.cod_pventa ?? ''),
    printer_uuid: this.fb.control(this.data.sucursal?.printer_uuid ?? ''),
    is_active: [this.data.sucursal?.is_active ?? true],
  });

  protected readonly submit = (): SubmitResult => {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const body = {
      name: raw.name,
      phone: raw.phone,
      email: raw.email,
      complemento_direccion: raw.complemento_direccion,
      departamento_id: raw.departamento_id,
      municipio_id: raw.municipio_id,
      tipo_establecimiento: raw.tipo_establecimiento,
      manager_id: raw.manager_id,
      branch_code: raw.branch_code || null,
      cod_estable_mh: raw.cod_estable_mh || null,
      cod_estable: raw.cod_estable || null,
      cod_pventa_mh: raw.cod_pventa_mh || null,
      cod_pventa: raw.cod_pventa || null,
      printer_uuid: raw.printer_uuid || null,
    };
    const request = this.isEdit
      ? this.sucursalService.update(this.data.sucursal!.id, {
          ...body,
          is_active: raw.is_active,
        })
      : this.sucursalService.create(body);

    return request.pipe(
      tap((sucursal) => this.dialogRef.close(sucursal)),
      catchError((error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        return EMPTY;
      }),
    );
  };
}
