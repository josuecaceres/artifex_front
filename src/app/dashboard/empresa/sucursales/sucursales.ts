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
import { Sucursal } from '@empresa/interfaces';
import {
  SaveResult,
  apiErrorMessage,
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
import { SucursalService } from '@empresa/services';
import { SucursalDialog, SucursalDialogData } from './sucursal-dialog';

/** Administración de sucursales y establecimientos (`/dashboard/sucursales`). */
@Component({
  selector: 'app-sucursales',
  imports: [MaterialModule, FaIconComponent, TableToolbar],
  templateUrl: './sucursales.html',
  styleUrl: './sucursales.scss',
})
export class Sucursales implements AfterViewInit {
  private readonly sucursalService = inject(SucursalService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly icons = {
    add: faPlus,
    edit: faPen,
    warning: faTriangleExclamation,
  };
  protected readonly dataSource = new MatTableDataSource<Sucursal>([]);
  protected readonly view = new TableView(this.dataSource, [
    { id: 'name', label: 'Nombre', text: (row) => row.name },
    {
      id: 'tipo_establecimiento_name',
      label: 'Tipo',
      text: (row) => row.tipo_establecimiento_name ?? '',
    },
    {
      id: 'departamento_name',
      label: 'Departamento',
      text: (row) => row.departamento_name ?? '',
    },
    {
      id: 'municipio_name',
      label: 'Municipio',
      text: (row) => row.municipio_name ?? '',
    },
    { id: 'phone', label: 'Teléfono', text: (row) => row.phone },
    { id: 'email', label: 'Correo', text: (row) => row.email },
    {
      id: 'is_active',
      label: 'Activa',
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

  protected openEdit(sucursal: Sucursal): void {
    this.openDialog({ sucursal });
  }

  private openDialog(data: SucursalDialogData): void {
    this.dialog
      .open(SucursalDialog, {
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
