import { MatTableDataSource } from '@angular/material/table';
import { TableView } from './table-view';

interface Row {
  name: string;
  city: string;
  active: boolean;
}

describe('TableView', () => {
  const rows: Row[] = [
    { name: 'María Rojas', city: 'Tegucigalpa', active: true },
    { name: 'Carlos Mena', city: 'San Pedro Sula', active: false },
    { name: 'Lucía Fuentes', city: 'Tegucigalpa', active: true },
  ];

  let dataSource: MatTableDataSource<Row>;
  let view: TableView<Row>;

  beforeEach(() => {
    dataSource = new MatTableDataSource<Row>(rows);
    view = new TableView(dataSource, [
      { id: 'name', label: 'Nombre', text: (row) => row.name },
      { id: 'city', label: 'Ciudad', text: (row) => row.city },
      {
        id: 'active',
        label: 'Activo',
        text: (row) => (row.active ? 'Sí' : 'No'),
      },
    ]);
  });

  const names = () => dataSource.filteredData.map((row) => row.name);

  it('muestra primero las acciones y luego todas las columnas', () => {
    expect(view.displayedColumns()).toEqual([
      'actions',
      'name',
      'city',
      'active',
    ]);
    expect(view.options.map((o) => o.label)).toEqual([
      'Nombre',
      'Ciudad',
      'Activo',
    ]);
  });

  it('oculta y vuelve a mostrar una columna, dejando las acciones primero', () => {
    view.toggle('city');
    expect(view.isVisible('city')).toBeFalse();
    expect(view.displayedColumns()).toEqual(['actions', 'name', 'active']);

    view.toggle('city');
    expect(view.displayedColumns()).toEqual([
      'actions',
      'name',
      'city',
      'active',
    ]);
  });

  it('no deja ocultar la última columna de datos', () => {
    view.toggle('name');
    view.toggle('city');

    expect(view.canToggle('active')).toBeFalse();
    view.toggle('active');

    expect(view.displayedColumns()).toEqual(['actions', 'active']);
    // Las ocultas siempre se pueden volver a mostrar.
    expect(view.canToggle('name')).toBeTrue();
  });

  it('sin búsqueda muestra todas las filas', () => {
    expect(names()).toEqual(['María Rojas', 'Carlos Mena', 'Lucía Fuentes']);
  });

  it('busca sin distinguir mayúsculas ni tildes', () => {
    view.setQuery('MARIA');
    expect(names()).toEqual(['María Rojas']);

    view.setQuery('lucia');
    expect(names()).toEqual(['Lucía Fuentes']);

    view.setQuery('  tegucigalpa ');
    expect(names()).toEqual(['María Rojas', 'Lucía Fuentes']);
  });

  it('busca en el texto que muestra la celda, no en el dato crudo', () => {
    view.setQuery('sí');
    expect(names()).toEqual(['María Rojas', 'Lucía Fuentes']);

    view.setQuery('true');
    expect(names()).toEqual([]);
  });

  it('solo busca en las columnas visibles', () => {
    view.setQuery('pedro');
    expect(names()).toEqual(['Carlos Mena']);

    view.toggle('city');
    expect(names()).toEqual([]);

    view.toggle('city');
    expect(names()).toEqual(['Carlos Mena']);
  });

  it('indica cuándo la búsqueda no encontró nada', () => {
    expect(view.noResults()).toBeFalse();

    view.setQuery('zzz');
    expect(view.noResults()).toBeTrue();

    view.setQuery('');
    expect(view.noResults()).toBeFalse();
  });

  it('una lista vacía no es "sin resultados"', () => {
    dataSource.data = [];
    view.setQuery('algo');

    expect(view.noResults()).toBeFalse();
  });

  it('empieza con todas las columnas visibles y sin guardar la elección', () => {
    view.toggle('city');

    const fresh = new TableView(new MatTableDataSource<Row>(rows), [
      { id: 'name', label: 'Nombre', text: (row) => row.name },
      { id: 'city', label: 'Ciudad', text: (row) => row.city },
    ]);
    expect(fresh.displayedColumns()).toEqual(['actions', 'name', 'city']);
  });
});
