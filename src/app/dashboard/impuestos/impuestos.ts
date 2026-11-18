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
import { Impuesto } from '@interfaces';
import { ImpuestoService, apiErrorMessage } from '@services';
import {
  FaIconComponent,
  MaterialModule,
  faPen,
  faPlus,
  faTriangleExclamation,
} from '@shared';
import { ImpuestoDialog, ImpuestoDialogData } from './impuesto-dialog';

/** Administración de impuestos (`/dashboard/impuestos`). */
@Component({
  selector: 'app-impuestos',
  imports: [MaterialModule, FaIconComponent],
  templateUrl: './impuestos.html',
  styleUrl: './impuestos.scss',
})
export class Impuestos implements AfterViewInit {
  private readonly impuestoService = inject(ImpuestoService);
  private readonly dialog = inject(MatDialog);
  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly columns = ['name', 'code', 'rate', 'is_active', 'actions'];
  protected readonly icons = {
    add: faPlus,
    edit: faPen,
    warning: faTriangleExclamation,
  };
  protected readonly dataSource = new MatTableDataSource<Impuesto>([]);
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

  protected openEdit(impuesto: Impuesto): void {
    this.openDialog({ impuesto });
  }

  private openDialog(data: ImpuestoDialogData): void {
    this.dialog
      .open(ImpuestoDialog, { data, width: '420px' })
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
