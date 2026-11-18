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
import { Unidad } from '@interfaces';
import { UnidadService, apiErrorMessage } from '@services';
import {
  FaIconComponent,
  MaterialModule,
  faPen,
  faPlus,
  faTriangleExclamation,
} from '@shared';
import { UnidadDialog, UnidadDialogData } from './unidad-dialog';

/** Administración de unidades de medida (`/dashboard/unidades`). */
@Component({
  selector: 'app-unidades',
  imports: [MaterialModule, FaIconComponent],
  templateUrl: './unidades.html',
  styleUrl: './unidades.scss',
})
export class Unidades implements AfterViewInit {
  private readonly unidadService = inject(UnidadService);
  private readonly dialog = inject(MatDialog);
  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly columns = ['name', 'code', 'is_active', 'actions'];
  protected readonly icons = {
    add: faPlus,
    edit: faPen,
    warning: faTriangleExclamation,
  };
  protected readonly dataSource = new MatTableDataSource<Unidad>([]);
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

  protected openEdit(unidad: Unidad): void {
    this.openDialog({ unidad });
  }

  private openDialog(data: UnidadDialogData): void {
    this.dialog
      .open(UnidadDialog, { data, width: '420px' })
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
    this.unidadService.list().subscribe({
      next: (unidades) => {
        this.dataSource.data = unidades;
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
