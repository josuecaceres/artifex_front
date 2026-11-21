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
import { Marca, SaveResult } from '@interfaces';
import { MarcaService, apiErrorMessage } from '@services';
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
import { MarcaDialog, MarcaDialogData } from './marca-dialog';

/** Administración de marcas (`/dashboard/marcas`). */
@Component({
  selector: 'app-marcas',
  imports: [MaterialModule, FaIconComponent, TableToolbar],
  templateUrl: './marcas.html',
  styleUrl: './marcas.scss',
})
export class Marcas implements AfterViewInit {
  private readonly marcaService = inject(MarcaService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly icons = {
    add: faPlus,
    edit: faPen,
    warning: faTriangleExclamation,
  };
  protected readonly dataSource = new MatTableDataSource<Marca>([]);
  protected readonly view = new TableView(this.dataSource, [
    { id: 'name', label: 'Nombre', text: (row) => row.name },
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

  protected openEdit(marca: Marca): void {
    this.openDialog({ marca });
  }

  private openDialog(data: MarcaDialogData): void {
    this.dialog
      .open(MarcaDialog, {
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
    this.marcaService.list().subscribe({
      next: (marcas) => {
        this.dataSource.data = marcas;
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
