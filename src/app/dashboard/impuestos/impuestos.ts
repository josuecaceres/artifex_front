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
import { Impuesto, SaveResult } from '@interfaces';
import { ImpuestoService, apiErrorMessage } from '@services';
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
import { ImpuestoDialog, ImpuestoDialogData } from './impuesto-dialog';

/** Administración de impuestos (`/dashboard/impuestos`). */
@Component({
  selector: 'app-impuestos',
  imports: [MaterialModule, FaIconComponent, TableToolbar],
  templateUrl: './impuestos.html',
  styleUrl: './impuestos.scss',
})
export class Impuestos implements AfterViewInit {
  private readonly impuestoService = inject(ImpuestoService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly icons = {
    add: faPlus,
    edit: faPen,
    warning: faTriangleExclamation,
  };
  protected readonly dataSource = new MatTableDataSource<Impuesto>([]);
  protected readonly view = new TableView(this.dataSource, [
    { id: 'name', label: 'Nombre', text: (row) => row.name },
    { id: 'code', label: 'Código', text: (row) => row.code },
    {
      id: 'rate',
      label: 'Tasa',
      text: (row) => `${Number(row.rate)}${row.is_percentage ? '%' : ''}`,
    },
    {
      id: 'is_active',
      label: 'Activo',
      text: (row) => (row.is_active ? 'Sí' : 'No'),
    },
  ]);

  /** `rate` llega como texto (`"13.0000"`): se muestra y ordena como número. */
  protected rate(impuesto: Impuesto): number {
    return Number(impuesto.rate);
  }
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngAfterViewInit(): void {
    this.dataSource.sortingDataAccessor = (impuesto, column) =>
      column === 'rate'
        ? Number(impuesto.rate)
        : String(impuesto[column as keyof Impuesto]);
    this.dataSource.sort = this.sort();
    this.dataSource.paginator = this.paginator();
    this.load();
  }

  protected openCreate(): void {
    this.openDialog({});
  }

  protected openEdit(impuesto: Impuesto): void {
    this.openDialog({ impuesto });
  }

  private openDialog(data: ImpuestoDialogData): void {
    this.dialog
      .open(ImpuestoDialog, {
        ...FORM_DIALOG_CONFIG,
        data,
        width: formDialogWidth(1, '420px'),
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
    this.impuestoService.list().subscribe({
      next: (impuestos) => {
        this.dataSource.data = impuestos;
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
