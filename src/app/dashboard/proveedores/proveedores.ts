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
import { Proveedor } from '@interfaces';
import { ProveedorService, apiErrorMessage } from '@services';
import {
  FaIconComponent,
  MaterialModule,
  faPen,
  faPlus,
  faTriangleExclamation,
} from '@shared';
import { ProveedorDialog, ProveedorDialogData } from './proveedor-dialog';

/** Administración de proveedores (`/dashboard/proveedores`). */
@Component({
  selector: 'app-proveedores',
  imports: [MaterialModule, FaIconComponent],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.scss',
})
export class Proveedores implements AfterViewInit {
  private readonly proveedorService = inject(ProveedorService);
  private readonly dialog = inject(MatDialog);
  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly columns = [
    'name',
    'nit',
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
  protected readonly dataSource = new MatTableDataSource<Proveedor>([]);
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

  protected openEdit(proveedor: Proveedor): void {
    this.openDialog({ proveedor });
  }

  private openDialog(data: ProveedorDialogData): void {
    this.dialog
      .open(ProveedorDialog, { data, width: '560px' })
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
    this.proveedorService.list().subscribe({
      next: (proveedores) => {
        this.dataSource.data = proveedores;
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
