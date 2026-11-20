import { Component, OnInit, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AppUser,
  CreateSucursalRequest,
  SaveResult,
  Sucursal,
  TipoEstablecimiento,
} from '@interfaces';
import {
  CatalogoService,
  SucursalService,
  UserService,
  apiErrorMessage,
} from '@services';
import {
  FaIconComponent,
  MaterialModule,
  SubmitLock,
  SubmitResult,
  UbicacionFields,
  faTriangleExclamation,
} from '@shared';
import { EMPTY, catchError, tap } from 'rxjs';

/** Datos del diálogo: sin `sucursal`, crea; con `sucursal`, edita esa sucursal. */
export interface SucursalDialogData {
  sucursal?: Sucursal;
}

/**
 * Crear o editar una sucursal (`POST /api/crear-sucursal`,
 * `PUT /api/actualizar-sucursal/{id}`). Departamento y municipio salen de los
 * catálogos de la API (`UbicacionFields`), el tipo de establecimiento de
 * `GET /api/tipo-establecimiento` y el gerente de la lista de usuarios.
 *
 * Dos particularidades comprobadas contra la API real: al editar el tipo de
 * establecimiento es obligatorio (al crear no), y el listado no devuelve
 * `printer_uuid`, así que al editar solo se envía si el usuario escribe uno
 * nuevo (omitirlo conserva el que ya tenía).
 */
@Component({
  selector: 'app-sucursal-dialog',
  imports: [
    ReactiveFormsModule,
    MaterialModule,
    FaIconComponent,
    SubmitLock,
    UbicacionFields,
  ],
  templateUrl: './sucursal-dialog.html',
  styleUrl: './sucursal-dialog.scss',
})
export class SucursalDialog implements OnInit {
  private readonly dialogRef =
    inject<MatDialogRef<SucursalDialog, SaveResult | undefined>>(MatDialogRef);
  private readonly sucursalService = inject(SucursalService);
  private readonly catalogo = inject(CatalogoService);
  private readonly userService = inject(UserService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly data = inject<SucursalDialogData>(MAT_DIALOG_DATA);
  protected readonly isEdit = !!this.data.sucursal;
  protected readonly icons = { warning: faTriangleExclamation };
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly tipos = signal<TipoEstablecimiento[]>([]);
  protected readonly usuarios = signal<AppUser[]>([]);

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
    departamento_id: this.fb.control<number | null>(
      this.data.sucursal?.departamento_id ?? null,
      Validators.required,
    ),
    municipio_id: this.fb.control<number | null>(
      this.data.sucursal?.municipio_id ?? null,
      Validators.required,
    ),
    tipo_establecimiento: this.fb.control<number | null>(
      this.data.sucursal?.tipo_establecimiento ?? null,
      this.data.sucursal ? Validators.required : [],
    ),
    manager_id: this.fb.control<number | null>(
      this.data.sucursal?.manager_id ?? null,
    ),
    branch_code: this.fb.control(this.data.sucursal?.branch_code ?? ''),
    cod_estable_mh: this.fb.control(this.data.sucursal?.cod_estable_mh ?? ''),
    cod_estable: this.fb.control(this.data.sucursal?.cod_estable ?? ''),
    cod_pventa_mh: this.fb.control(this.data.sucursal?.cod_pventa_mh ?? ''),
    cod_pventa: this.fb.control(this.data.sucursal?.cod_pventa ?? ''),
    printer_uuid: this.fb.control(''),
    is_active: [this.data.sucursal?.is_active ?? true],
  });

  ngOnInit(): void {
    this.catalogo.tiposEstablecimiento().subscribe({
      next: (tipos) => this.tipos.set(tipos),
      error: (error: unknown) => this.errorMessage.set(apiErrorMessage(error)),
    });
    this.userService.list().subscribe({
      next: (usuarios) => this.usuarios.set(usuarios),
      error: (error: unknown) => this.errorMessage.set(apiErrorMessage(error)),
    });
  }

  protected readonly submit = (): SubmitResult => {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const body: CreateSucursalRequest = {
      name: raw.name,
      phone: raw.phone,
      email: raw.email,
      complemento_direccion: raw.complemento_direccion,
      departamento_id: raw.departamento_id!,
      municipio_id: raw.municipio_id!,
      tipo_establecimiento: raw.tipo_establecimiento,
      manager_id: raw.manager_id,
      branch_code: raw.branch_code || null,
      cod_estable_mh: raw.cod_estable_mh || null,
      cod_estable: raw.cod_estable || null,
      cod_pventa_mh: raw.cod_pventa_mh || null,
      cod_pventa: raw.cod_pventa || null,
    };
    const request = this.isEdit
      ? this.sucursalService.update(this.data.sucursal!.id, {
          ...body,
          tipo_establecimiento: raw.tipo_establecimiento!,
          ...(raw.printer_uuid ? { printer_uuid: raw.printer_uuid } : {}),
          is_active: raw.is_active,
        })
      : this.sucursalService.create({
          ...body,
          printer_uuid: raw.printer_uuid || null,
        });

    return request.pipe(
      tap((result) => this.dialogRef.close(result)),
      catchError((error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        return EMPTY;
      }),
    );
  };
}
