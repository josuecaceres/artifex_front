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
import { Proveedor, SaveResult } from '@interfaces';
import { ProveedorService, apiErrorMessage } from '@services';
import {
  FORM_DIALOG_CONFIG,
  FaIconComponent,
  formDialogWidth,
  MaterialModule,
  TableToolbar,
  TableView,
  ToastService,
  faPen,
  faPlus,
  faTriangleExclamation,
} from '@shared';
import { ProveedorDialog, ProveedorDialogData } from './proveedor-dialog';

/** Administración de proveedores (`/dashboard/proveedores`). */
@Component({
  selector: 'app-proveedores',
  imports: [MaterialModule, FaIconComponent, TableToolbar],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.scss',
})
export class Proveedores implements AfterViewInit {
  private readonly proveedorService = inject(ProveedorService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly icons = {
    add: faPlus,
    edit: faPen,
    warning: faTriangleExclamation,
  };
  protected readonly dataSource = new MatTableDataSource<Proveedor>([]);
  protected readonly view = new TableView(this.dataSource, [
    { id: 'name', label: 'Nombre', text: (row) => row.name },
    { id: 'nit', label: 'NIT', text: (row) => row.nit },
    { id: 'phone', label: 'Teléfono', text: (row) => row.phone },
    { id: 'email', label: 'Correo', text: (row) => row.email },
    {
      id: 'is_active',
      label: 'Activo',
      text: (row) => (row.is_active ? 'Sí' : 'No'),
    },
  ]);
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
      .open(ProveedorDialog, {
        ...FORM_DIALOG_CONFIG,
        data,
        width: formDialogWidth(3),
      })
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
