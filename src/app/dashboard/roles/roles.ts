import {
  AfterViewInit,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RoleWithPermissions } from '@interfaces';
import { apiErrorMessage, RoleService } from '@services';
import {
  FaIconComponent,
  MaterialModule,
  faPen,
  faPlus,
  faTriangleExclamation,
} from '@shared';
import { RolDialog, RolDialogData } from './rol-dialog';

/** Administración de roles y permisos (`/dashboard/roles`). */
@Component({
  selector: 'app-roles',
  imports: [MaterialModule, FaIconComponent],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class Roles implements AfterViewInit {
  private readonly roleService = inject(RoleService);
  private readonly dialog = inject(MatDialog);
  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly columns = ['name', 'permissions', 'actions'];
  protected readonly icons = {
    add: faPlus,
    edit: faPen,
    warning: faTriangleExclamation,
  };
  protected readonly dataSource = new MatTableDataSource<RoleWithPermissions>(
    [],
  );
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort();
    this.dataSource.paginator = this.paginator();
    this.load();
  }

  protected openCreate(): void {
    this.openDialog({});
  }

  protected openEdit(role: RoleWithPermissions): void {
    this.openDialog({ role });
  }

  private openDialog(data: RolDialogData): void {
    this.dialog
      .open(RolDialog, { data, width: '480px' })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.load();
        }
      });
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.roleService.listWithPermissions().subscribe({
      next: (roles) => {
        this.dataSource.data = roles;
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
