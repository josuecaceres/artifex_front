import { Component, OnInit, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppUser, Role, SaveResult, Sucursal } from '@interfaces';
import {
  RoleService,
  SucursalService,
  UserService,
  apiErrorMessage,
} from '@services';
import {
  FaIconComponent,
  MaterialModule,
  SubmitLock,
  SubmitResult,
  faTriangleExclamation,
} from '@shared';
import { EMPTY, catchError, forkJoin, tap } from 'rxjs';

/** Datos del diálogo: sin `user`, crea; con `user`, edita ese usuario. */
export interface UsuarioDialogData {
  user?: AppUser;
}

/**
 * Crear o editar un usuario (`POST /api/crear-usuario`,
 * `PATCH /api/editar-usuario/{id}`). Comprobado contra la API real: ambos
 * exigen `rol_id` y `branch_id`. `GET /api/users` solo trae el nombre del rol,
 * así que al editar el rol actual se busca por nombre en `GET
 * /api/lista-roles`. Al crear, el backend ignora `authorized`: el usuario nace
 * sin contraseña y sin autorizar (ver `CreateUserRequest`).
 */
@Component({
  selector: 'app-usuario-dialog',
  imports: [ReactiveFormsModule, MaterialModule, FaIconComponent, SubmitLock],
  templateUrl: './usuario-dialog.html',
  styleUrl: './usuario-dialog.scss',
})
export class UsuarioDialog implements OnInit {
  private readonly dialogRef =
    inject<MatDialogRef<UsuarioDialog, SaveResult | undefined>>(MatDialogRef);
  private readonly userService = inject(UserService);
  private readonly sucursalService = inject(SucursalService);
  private readonly roleService = inject(RoleService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly data = inject<UsuarioDialogData>(MAT_DIALOG_DATA);
  protected readonly isEdit = !!this.data.user;
  protected readonly icons = { warning: faTriangleExclamation };
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly sucursales = signal<Sucursal[]>([]);
  protected readonly roles = signal<Role[]>([]);
  protected readonly loadingCatalogs = signal(true);

  protected readonly form = this.fb.group({
    name: [this.data.user?.name ?? '', Validators.required],
    acronym: [this.data.user?.acronym ?? '', Validators.required],
    email: [
      this.data.user?.email ?? '',
      [Validators.required, Validators.email],
    ],
    branch_id: this.fb.control<number | null>(
      this.data.user?.branch_id ?? null,
      Validators.required,
    ),
    rol_id: this.fb.control<number | null>(null, Validators.required),
    authorized: [this.data.user?.authorized ?? false],
    is_active: [this.data.user?.is_active ?? true],
  });

  ngOnInit(): void {
    forkJoin({
      sucursales: this.sucursalService.list(),
      roles: this.roleService.list(),
    }).subscribe({
      next: ({ sucursales, roles }) => {
        this.sucursales.set(sucursales);
        this.roles.set(roles);
        const current = this.data.user?.roles[0];
        const match = roles.find((role) => role.name === current);
        if (match) {
          this.form.controls.rol_id.setValue(match.id);
        }
        this.loadingCatalogs.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        this.loadingCatalogs.set(false);
      },
    });
  }

  protected readonly submit = (): SubmitResult => {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, acronym, email, branch_id, rol_id, authorized, is_active } =
      this.form.getRawValue();
    const request = this.isEdit
      ? this.userService.update(this.data.user!.id, {
          name,
          acronym,
          email,
          branch_id: branch_id!,
          rol_id: rol_id!,
          authorized,
          is_active,
        })
      : this.userService.create({
          name,
          acronym,
          email,
          branch_id: branch_id!,
          rol_id: rol_id!,
          authorized: false,
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
