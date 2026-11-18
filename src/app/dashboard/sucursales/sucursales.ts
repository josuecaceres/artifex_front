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
import { Sucursal } from '@interfaces';
import { apiErrorMessage, SucursalService } from '@services';
import {
  FaIconComponent,
  MaterialModule,
  faPen,
  faPlus,
  faTriangleExclamation,
} from '@shared';
import { SucursalDialog, SucursalDialogData } from './sucursal-dialog';

/** Administración de sucursales y establecimientos (`/dashboard/sucursales`). */
@Component({
  selector: 'app-sucursales',
  imports: [MaterialModule, FaIconComponent],
  templateUrl: './sucursales.html',
  styleUrl: './sucursales.scss',
})
export class Sucursales implements AfterViewInit {
  private readonly sucursalService = inject(SucursalService);
  private readonly dialog = inject(MatDialog);
  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly columns = [
    'name',
    'phone',
    'email',
    'is_active',
    'actions',
  ];
  protected readonly icons = {
    add: faPlus,
    edit: faPen,
    warning: faTriangleExclamation,
  };
  protected readonly dataSource = new MatTableDataSource<Sucursal>([]);
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

  protected openEdit(sucursal: Sucursal): void {
    this.openDialog({ sucursal });
  }

  private openDialog(data: SucursalDialogData): void {
    this.dialog
      .open(SucursalDialog, { data, width: '560px' })
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
    this.sucursalService.list().subscribe({
      next: (sucursales) => {
        this.dataSource.data = sucursales;
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
