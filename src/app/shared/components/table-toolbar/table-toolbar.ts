import { Component, input } from '@angular/core';
import { MatPseudoCheckbox } from '@angular/material/core';
import {
  FaIconComponent,
  faChevronDown,
  faDownload,
  faMagnifyingGlass,
  faXmark,
} from '@shared/consts/icons';
import { MaterialModule } from '@shared/material.module';
import { TableViewControls } from '@shared/utils/table-view';

/**
 * Barra de una tabla del dashboard: a la izquierda lo que se proyecte (el
 * botón "Nuevo …") y el buscador; a la derecha el menú "Columnas" y
 * "Exportar" (por ahora sin función, solo está situado). El estado vive en un
 * `TableView` (`[view]`).
 *
 *   <app-table-toolbar [view]="view">
 *     <button mat-flat-button (click)="openCreate()">Nuevo …</button>
 *   </app-table-toolbar>
 */
@Component({
  selector: 'app-table-toolbar',
  imports: [MaterialModule, FaIconComponent, MatPseudoCheckbox],
  templateUrl: './table-toolbar.html',
  styleUrl: './table-toolbar.scss',
})
export class TableToolbar {
  readonly view = input.required<TableViewControls>();

  protected readonly icons = {
    search: faMagnifyingGlass,
    clear: faXmark,
    chevron: faChevronDown,
    download: faDownload,
  };

  protected onSearch(event: Event): void {
    this.view().setQuery((event.target as HTMLInputElement).value);
  }

  protected clear(): void {
    this.view().setQuery('');
  }

  /** Alterna la columna sin cerrar el menú (se puede marcar varias seguidas). */
  protected toggle(event: Event, id: string): void {
    event.stopPropagation();
    this.view().toggle(id);
  }
}
