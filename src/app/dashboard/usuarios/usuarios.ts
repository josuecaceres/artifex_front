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
import { AppUser, SaveResult } from '@interfaces';
import { apiErrorMessage, UserService } from '@services';
import {
  FaIconComponent,
  MaterialModule,
  TableToolbar,
  TableView,
  ToastService,
  faPen,
  faPlus,
  faTriangleExclamation,
} from '@shared';
import { UsuarioDialog, UsuarioDialogData } from './usuario-dialog';

/** Administración de usuarios (`/dashboard/usuarios`). */
@Component({
  selector: 'app-usuarios',
  imports: [MaterialModule, FaIconComponent, TableToolbar],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements AfterViewInit {
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly icons = {
    add: faPlus,
    edit: faPen,
    warning: faTriangleExclamation,
  };
  protected readonly dataSource = new MatTableDataSource<AppUser>([]);
  protected readonly view = new TableView(this.dataSource, [
    { id: 'name', label: 'Nombre', text: (row) => row.name },
    { id: 'acronym', label: 'Siglas', text: (row) => row.acronym },
    { id: 'email', label: 'Correo', text: (row) => row.email },
    { id: 'roles', label: 'Rol', text: (row) => row.roles.join(', ') },
    { id: 'branch', label: 'Sucursal', text: (row) => row.branch ?? '' },
    {
      id: 'authorized',
      label: 'Autorizado',
      text: (row) => (row.authorized ? 'Sí' : 'Pendiente'),
    },
    {
      id: 'is_active',
      label: 'Activo',
      text: (row) => (row.is_active ? 'Sí' : 'No'),
    },
  ]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngAfterViewInit(): void {
    this.dataSource.sortingDataAccessor = (user, column) =>
      column === 'roles'
        ? user.roles.join(', ')
        : String(user[column as keyof AppUser] ?? '');
    this.dataSource.sort = this.sort();
    this.dataSource.paginator = this.paginator();
    this.load();
  }

  protected openCreate(): void {
    this.openDialog({});
  }

  protected openEdit(user: AppUser): void {
    this.openDialog({ user });
  }

  private openDialog(data: UsuarioDialogData): void {
    this.dialog
      .open(UsuarioDialog, { data, width: '480px' })
      .afterClosed()
      .subscribe((result: SaveResult | undefined) => {
        if (result) {
          this.toast.success(result.message);
          this.load();
        }
      });
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.userService.list().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
