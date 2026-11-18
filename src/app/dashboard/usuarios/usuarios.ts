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
import { AppUser } from '@interfaces';
import { apiErrorMessage, UserService } from '@services';
import {
  FaIconComponent,
  MaterialModule,
  faPen,
  faPlus,
  faTriangleExclamation,
} from '@shared';
import { UsuarioDialog, UsuarioDialogData } from './usuario-dialog';

/** Administración de usuarios (`/dashboard/usuarios`). */
@Component({
  selector: 'app-usuarios',
  imports: [MaterialModule, FaIconComponent],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements AfterViewInit {
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly columns = [
    'name',
    'acronym',
    'email',
    'authorized',
    'is_active',
    'actions',
  ];
  protected readonly icons = {
    add: faPlus,
    edit: faPen,
    warning: faTriangleExclamation,
  };
  protected readonly dataSource = new MatTableDataSource<AppUser>([]);
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

  protected openEdit(user: AppUser): void {
    this.openDialog({ user });
  }

  private openDialog(data: UsuarioDialogData): void {
    this.dialog
      .open(UsuarioDialog, { data, width: '480px' })
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
