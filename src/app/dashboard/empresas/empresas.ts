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
import { Empresa, SaveResult } from '@interfaces';
import { apiErrorMessage, EmpresaService } from '@services';
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
import { EmpresaDialog, EmpresaDialogData } from './empresa-dialog';

/** Administración de empresas (`/dashboard/empresas`). */
@Component({
  selector: 'app-empresas',
  imports: [MaterialModule, FaIconComponent, TableToolbar],
  templateUrl: './empresas.html',
  styleUrl: './empresas.scss',
})
export class Empresas implements AfterViewInit {
  private readonly empresaService = inject(EmpresaService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly sort = viewChild.required(MatSort);
  private readonly paginator = viewChild.required(MatPaginator);

  protected readonly icons = {
    add: faPlus,
    edit: faPen,
    warning: faTriangleExclamation,
  };
  protected readonly dataSource = new MatTableDataSource<Empresa>([]);
  protected readonly view = new TableView(this.dataSource, [
    {
      id: 'comercial_name',
      label: 'Nombre comercial',
      text: (row) => row.comercial_name,
    },
    { id: 'nit', label: 'NIT', text: (row) => row.nit },
    { id: 'nrc', label: 'NRC', text: (row) => row.nrc },
    { id: 'email', label: 'Correo', text: (row) => row.email },
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

  protected openEdit(empresa: Empresa): void {
    this.openDialog({ empresa });
  }

  private openDialog(data: EmpresaDialogData): void {
    this.dialog
      .open(EmpresaDialog, {
        ...FORM_DIALOG_CONFIG,
        data,
        width: formDialogWidth(2),
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
