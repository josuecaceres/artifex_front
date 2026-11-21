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
import { Categoria, SaveResult } from '@interfaces';
import { CategoriaService, apiErrorMessage } from '@services';
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
import { CategoriaDialog, CategoriaDialogData } from './categoria-dialog';

/** Administración de categorías (`/dashboard/categorias`). */
@Component({
  selector: 'app-categorias',
  imports: [MaterialModule, FaIconComponent, TableToolbar],
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss',
})
export class Categorias implements AfterViewInit {
  private readonly categoriaService = inject(CategoriaService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly icons = {
    add: faPlus,
    edit: faPen,
    warning: faTriangleExclamation,
  };
  protected readonly dataSource = new MatTableDataSource<Categoria>([]);
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

  protected openEdit(categoria: Categoria): void {
    this.openDialog({ categoria });
  }

  private openDialog(data: CategoriaDialogData): void {
    this.dialog
      .open(CategoriaDialog, { data, width: '420px' })
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
    this.categoriaService.list().subscribe({
      next: (categorias) => {
        this.dataSource.data = categorias;
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
