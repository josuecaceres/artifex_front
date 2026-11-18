import { Component, OnInit, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppUser, Sucursal } from '@interfaces';
import { SucursalService, apiErrorMessage, UserService } from '@services';
import {
  FaIconComponent,
  MaterialModule,
  SubmitLock,
  SubmitResult,
  faTriangleExclamation,
} from '@shared';
import { EMPTY, catchError, tap } from 'rxjs';

/** Datos del diálogo: sin `user`, crea; con `user`, edita ese usuario. */
export interface UsuarioDialogData {
  user?: AppUser;
}

/**
 * Crear o editar un usuario (`POST /api/crear-usuario`,
 * `PATCH /api/editar-usuario/{id}`). `branch_id` se elige del catálogo de
 * sucursales (`GET /api/branches`), cargado al abrir el diálogo.
 */
@Component({
  selector: 'app-usuario-dialog',
  imports: [ReactiveFormsModule, MaterialModule, FaIconComponent, SubmitLock],
  templateUrl: './usuario-dialog.html',
  styleUrl: './usuario-dialog.scss',
})
export class UsuarioDialog implements OnInit {
  private readonly dialogRef =
    inject<MatDialogRef<UsuarioDialog, AppUser | undefined>>(MatDialogRef);
  private readonly userService = inject(UserService);
  private readonly sucursalService = inject(SucursalService);

  protected readonly data = inject<UsuarioDialogData>(MAT_DIALOG_DATA);
  protected readonly isEdit = !!this.data.user;
  protected readonly icons = { warning: faTriangleExclamation };
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly sucursales = signal<Sucursal[]>([]);
  protected readonly loadingSucursales = signal(true);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [this.data.user?.name ?? '', Validators.required],
    acronym: [this.data.user?.acronym ?? '', Validators.required],
    email: [
      this.data.user?.email ?? '',
      [Validators.required, Validators.email],
    ],
    branch_id: [
      this.data.user?.branch_id ?? 1,
      [Validators.required, Validators.min(1)],
    ],
    authorized: [this.data.user?.authorized ?? false],
    is_active: [this.data.user?.is_active ?? true],
  });

  ngOnInit(): void {
    this.sucursalService.list().subscribe({
      next: (sucursales) => {
        this.sucursales.set(sucursales);
        this.loadingSucursales.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        this.loadingSucursales.set(false);
      },
    });
  }

  protected readonly submit = (): SubmitResult => {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, acronym, email, branch_id, authorized, is_active } =
      this.form.getRawValue();
    const request = this.isEdit
      ? this.userService.update(this.data.user!.id, {
          name,
          acronym,
          email,
          branch_id,
          authorized,
          is_active,
        })
      : this.userService.create({ name, acronym, email, branch_id });

    return request.pipe(
      tap((user) => this.dialogRef.close(user)),
      catchError((error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        return EMPTY;
      }),
    );
  };
}
