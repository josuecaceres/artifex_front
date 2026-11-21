import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableDataSource } from '@angular/material/table';
import { TableToolbar } from './table-toolbar';
import { TableView } from '@shared/utils/table-view';

interface Row {
  name: string;
  city: string;
}

@Component({
  imports: [TableToolbar],
  template: `
    <app-table-toolbar [view]="view">
      <button type="button" class="create">Nuevo registro</button>
    </app-table-toolbar>
  `,
})
class Host {
  readonly dataSource = new MatTableDataSource<Row>([
    { name: 'María', city: 'Tegucigalpa' },
    { name: 'Carlos', city: 'Comayagua' },
  ]);
  readonly view = new TableView(this.dataSource, [
    { id: 'name', label: 'Nombre', text: (row) => row.name },
    { id: 'city', label: 'Ciudad', text: (row) => row.city },
  ]);
}

describe('TableToolbar', () => {
  let fixture: ComponentFixture<Host>;
  let element: HTMLElement;
  let host: Host;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    document
      .querySelectorAll('.cdk-overlay-container')
      .forEach((container) => (container.innerHTML = ''));
  });

  const input = () =>
    element.querySelector<HTMLInputElement>('.app-toolbar__search input')!;

  async function type(value: string): Promise<void> {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function openColumns(): Promise<HTMLButtonElement[]> {
    element.querySelector<HTMLButtonElement>('.app-toolbar__columns')!.click();
    await fixture.whenStable();
    return Array.from(
      document.querySelectorAll<HTMLButtonElement>('[role="menuitemcheckbox"]'),
    );
  }

  it('pone lo proyectado (el botón de crear) a la izquierda, antes del buscador', () => {
    const start = element.querySelector('.app-toolbar__start')!;
    const children = Array.from(start.children);

    expect(children[0].classList).toContain('create');
    expect(children[1].classList).toContain('app-toolbar__search');
  });

  it('pone "Columnas" y "Exportar" a la derecha, en ese orden', () => {
    const end = element.querySelector('.app-toolbar__end')!;
    const labels = Array.from(end.querySelectorAll('button')).map((b) =>
      b.textContent?.trim(),
    );

    expect(labels).toEqual(['Columnas', 'Exportar']);
  });

  it('"Exportar" está situado pero no hace nada (ni está deshabilitado)', () => {
    const button = element.querySelector<HTMLButtonElement>(
      '.app-toolbar__export',
    )!;

    expect(button.disabled).toBeFalse();
    expect(() => button.click()).not.toThrow();
  });

  it('escribir en el buscador filtra la tabla', async () => {
    await type('mar');

    expect(host.view.query()).toBe('mar');
    expect(host.dataSource.filteredData.map((r) => r.name)).toEqual(['María']);
  });

  it('el botón de limpiar aparece al escribir y vacía la búsqueda', async () => {
    expect(element.querySelector('[aria-label="Limpiar búsqueda"]')).toBeNull();

    await type('car');
    const clear = element.querySelector<HTMLButtonElement>(
      '[aria-label="Limpiar búsqueda"]',
    )!;
    clear.click();
    await fixture.whenStable();

    expect(host.view.query()).toBe('');
    expect(input().value).toBe('');
    expect(host.dataSource.filteredData.length).toBe(2);
  });

  it('el menú "Columnas" lista cada columna con su casilla marcada', async () => {
    const items = await openColumns();

    expect(items.map((item) => item.textContent?.trim())).toEqual([
      'Nombre',
      'Ciudad',
    ]);
    expect(items.map((i) => i.getAttribute('aria-checked'))).toEqual([
      'true',
      'true',
    ]);
  });

  it('desmarcar una columna la oculta y deja el menú abierto', async () => {
    const items = await openColumns();

    items[1].click();
    await fixture.whenStable();

    expect(host.view.displayedColumns()).toEqual(['actions', 'name']);
    expect(items[1].getAttribute('aria-checked')).toBe('false');
    expect(document.querySelector('[role="menuitemcheckbox"]')).not.toBeNull();
  });

  it('no deja desmarcar la última columna visible', async () => {
    const items = await openColumns();

    items[0].click();
    await fixture.whenStable();

    expect(items[1].disabled).toBeTrue();
    items[1].click();
    await fixture.whenStable();

    expect(host.view.displayedColumns()).toEqual(['actions', 'city']);
  });
});
