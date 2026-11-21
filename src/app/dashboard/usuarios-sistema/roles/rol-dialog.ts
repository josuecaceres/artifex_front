import { TitleCasePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Permission, Role } from '@usuarios-sistema/interfaces';
import {
  SaveResult,
  apiErrorMessage,
  FIXED_SUBSCRIPT_PROVIDER,
  FaIconComponent,
  MaterialModule,
  SubmitLock,
  SubmitResult,
  faMagnifyingGlass,
  faTriangleExclamation,
  faXmark,
  normalizeText,
} from '@shared';
import { RoleService } from '@usuarios-sistema/services';
import { EMPTY, catchError, forkJoin, of, tap } from 'rxjs';

/** Ancho del diálogo: tres columnas de permisos (ver `_dialogs.scss`). */
export const ROL_DIALOG_WIDTH = '800px';

/** Datos del diálogo: sin `role`, crea; con `role`, edita ese rol. */
export interface RolDialogData {
  role?: Role;
}

/**
 * Crear o editar un rol (`POST /api/crear-roles`, `PATCH
 * /api/actualizar-roles/{id}`). El catálogo de permisos (`GET
 * /api/lista-permisos`) y, en edición, los ya asignados (`GET
 * /api/permisos-del-rol/{id}`) se cargan al abrir.
 *
 * Los permisos son muchos y crecen: van como tarjetas con un interruptor, en
 * tres columnas, en una lista de alto fijo que es lo único que hace scroll, con
 * un buscador y los totales debajo. Un clic en cualquier parte de la tarjeta
 * activa o desactiva el permiso.
 */
@Component({
  selector: 'app-rol-dialog',
  imports: [
    ReactiveFormsModule,
    MaterialModule,
    FaIconComponent,
    SubmitLock,
    TitleCasePipe,
  ],
  providers: [FIXED_SUBSCRIPT_PROVIDER],
  templateUrl: './rol-dialog.html',
  styleUrl: './rol-dialog.scss',
})
export class RolDialog implements OnInit {
  private readonly dialogRef =
    inject<MatDialogRef<RolDialog, SaveResult | undefined>>(MatDialogRef);
  private readonly roleService = inject(RoleService);

  protected readonly data = inject<RolDialogData>(MAT_DIALOG_DATA);
  protected readonly isEdit = !!this.data.role;
  protected readonly icons = {
    warning: faTriangleExclamation,
    search: faMagnifyingGlass,
    clear: faXmark,
  };

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [this.data.role?.name ?? '', Validators.required],
  });

  protected readonly permissions = signal<Permission[]>([]);
  protected readonly selectedIds = signal<ReadonlySet<number>>(new Set());
  protected readonly query = signal('');
  protected readonly loadingPermissions = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  /** Permisos que coinciden con la búsqueda (sin distinguir tildes ni mayúsculas). */
  protected readonly visiblePermissions = computed(() => {
    const filter = normalizeText(this.query().trim());
    return this.permissions().filter((permission) =>
      normalizeText(permission.name).includes(filter),
    );
  });

  ngOnInit(): void {
    const assigned$ = this.data.role
      ? this.roleService.rolePermissions(this.data.role.id)
      : of<Permission[]>([]);

    forkJoin({
      catalog: this.roleService.listPermissions(),
      assigned: assigned$,
    }).subscribe({
      next: ({ catalog, assigned }) => {
        this.permissions.set(catalog);
        this.selectedIds.set(
          new Set(assigned.map((permission) => permission.id)),
        );
        this.loadingPermissions.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        this.loadingPermissions.set(false);
      },
    });
  }

  protected isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  /** Un clic en la tarjeta (fuera del interruptor, que ya lo maneja) alterna el permiso. */
  protected onCardClick(event: Event, id: number): void {
    if ((event.target as HTMLElement).closest('mat-slide-toggle')) {
      return;
    }
    this.toggle(id, !this.isSelected(id));
  }

  protected toggle(id: number, checked: boolean): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  protected readonly submit = (): SubmitResult => {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name } = this.form.getRawValue();
    const permissions = Array.from(this.selectedIds()).map((permission_id) => ({
      permission_id,
    }));
    const request = this.isEdit
      ? this.roleService.update(this.data.role!.id, { name, permissions })
      : this.roleService.create({ name, permissions });

    return request.pipe(
      tap((role) => this.dialogRef.close(role)),
      catchError((error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        return EMPTY;
      }),
    );
  };
}
