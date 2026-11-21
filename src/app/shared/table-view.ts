import { computed, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

/** Id de la columna de acciones: siempre es la primera, fija y no se puede ocultar. */
export const ACTIONS_COLUMN = 'actions';

/** Columna de datos de una tabla: su id (`matColumnDef`), su encabezado y su texto. */
export interface TableColumn<T> {
  id: string;
  /** Encabezado; también es el nombre en el menú "Columnas". */
  label: string;
  /** Texto que muestra la celda: es lo que recorre el buscador. */
  text: (row: T) => string;
}

/** Lo que `TableToolbar` necesita de una tabla (lo cumple `TableView`). */
export interface TableViewControls {
  readonly options: readonly { id: string; label: string }[];
  readonly query: () => string;
  isVisible(id: string): boolean;
  canToggle(id: string): boolean;
  toggle(id: string): void;
  setQuery(value: string): void;
}

/** Texto sin tildes ni mayúsculas, para comparar al buscar. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * Estado de una tabla de las pantallas del dashboard: qué columnas se ven y
 * qué se está buscando. Se crea con el `MatTableDataSource` y las columnas de
 * datos de la pantalla, y se pasa a `TableToolbar` (`[view]="view"`):
 *
 *   protected readonly view = new TableView(this.dataSource, [
 *     { id: 'name', label: 'Nombre', text: (row) => row.name },
 *   ]);
 *
 * - `displayedColumns()` va a `matHeaderRowDef` y `matRowDef`: la columna de
 *   acciones primero y luego las columnas de datos visibles.
 * - El buscador filtra **en el navegador** (las listas llegan completas) por
 *   el texto de las columnas visibles, sin distinguir mayúsculas ni tildes.
 * - Las columnas visibles NO se guardan: cada visita empieza con todas.
 */
export class TableView<T> implements TableViewControls {
  private readonly hidden = signal<ReadonlySet<string>>(new Set());
  private readonly querySignal = signal('');

  readonly options: readonly { id: string; label: string }[];
  readonly query = this.querySignal.asReadonly();

  /** Columnas para `matHeaderRowDef` / `matRowDef`: acciones y las visibles. */
  readonly displayedColumns = computed(() => [
    ACTIONS_COLUMN,
    ...this.columns.map((c) => c.id).filter((id) => !this.hidden().has(id)),
  ]);

  constructor(
    private readonly dataSource: MatTableDataSource<T>,
    private readonly columns: readonly TableColumn<T>[],
  ) {
    this.options = columns.map(({ id, label }) => ({ id, label }));
    dataSource.filterPredicate = (row, filter) =>
      this.columns
        .filter((column) => !this.hidden().has(column.id))
        .some((column) => normalizeText(column.text(row)).includes(filter));
  }

  isVisible(id: string): boolean {
    return !this.hidden().has(id);
  }

  /** Siempre debe quedar al menos una columna de datos visible. */
  canToggle(id: string): boolean {
    return !this.isVisible(id) || this.columns.length - this.hidden().size > 1;
  }

  toggle(id: string): void {
    if (!this.canToggle(id)) {
      return;
    }
    this.hidden.update((hidden) => {
      const next = new Set(hidden);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });
    this.applyFilter();
  }

  setQuery(value: string): void {
    this.querySignal.set(value);
    this.applyFilter();
    this.dataSource.paginator?.firstPage();
  }

  /** Hay datos pero la búsqueda no encontró ninguno. */
  noResults(): boolean {
    return (
      this.query().trim() !== '' &&
      this.dataSource.data.length > 0 &&
      this.dataSource.filteredData.length === 0
    );
  }

  private applyFilter(): void {
    // Se reasigna siempre: la visibilidad de las columnas también cambia qué coincide.
    this.dataSource.filter = normalizeText(this.query().trim());
  }
}
