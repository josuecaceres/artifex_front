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
import { Empresa } from '@interfaces';
import { apiErrorMessage, EmpresaService } from '@services';
import {
  FaIconComponent,
  MaterialModule,
  faPen,
  faPlus,
  faTriangleExclamation,
} from '@shared';
import { EmpresaDialog, EmpresaDialogData } from './empresa-dialog';

/** Administración de empresas (`/dashboard/empresas`). */
@Component({
  selector: 'app-empresas',
  imports: [MaterialModule, FaIconComponent],
  templateUrl: './empresas.html',
  styleUrl: './empresas.scss',
})
export class Empresas implements AfterViewInit {
  private readonly empresaService = inject(EmpresaService);
  private readonly dialog = inject(MatDialog);
  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly columns = [
    'comercial_name',
    'nit',
    'nrc',
    'email',
    'actions',
  ];
  protected readonly icons = {
    add: faPlus,
    edit: faPen,
    warning: faTriangleExclamation,
  };
  protected readonly dataSource = new MatTableDataSource<Empresa>([]);
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

  protected openEdit(empresa: Empresa): void {
    this.openDialog({ empresa });
  }

  private openDialog(data: EmpresaDialogData): void {
    this.dialog
      .open(EmpresaDialog, { data, width: '480px' })
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
    this.empresaService.list().subscribe({
      next: (empresas) => {
        this.dataSource.data = empresas;
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(apiErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
