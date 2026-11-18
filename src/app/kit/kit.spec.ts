import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { Kit } from './kit';

describe('Kit', () => {
  let fixture: ComponentFixture<Kit>;
  let element: HTMLElement;

  beforeEach(async () => {
    localStorage.removeItem('app-theme');
    await TestBed.configureTestingModule({
      imports: [Kit],
      providers: [
        provideZonelessChangeDetection(),
        provideNativeDateAdapter(),
        { provide: MAT_DATE_LOCALE, useValue: 'es' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Kit);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    localStorage.removeItem('app-theme');
    document.documentElement.removeAttribute('data-theme');
  });

  it('muestra las secciones del kit en el riel', () => {
    const items = element.querySelectorAll('.app-rail__nav button');

    expect(items.length).toBe(9);
    expect(items[0].textContent).toContain('Estados');
  });

  it('muestra los cuatro estados con su símbolo y texto', () => {
    const statuses = Array.from(
      element.querySelectorAll('#estados .app-status'),
    ).map((node) => node.textContent?.trim());

    expect(statuses).toEqual([
      'En curso',
      'Completado',
      'En revisión',
      'Vencido',
    ]);
  });

  it('muestra el error del correo incompleto', () => {
    expect(element.querySelector('mat-error')?.textContent).toContain(
      'correo válido',
    );
  });

  it('muestra los montos de la tabla en lempiras', () => {
    const amounts = Array.from(
      element.querySelectorAll('td.mat-column-amount'),
    ).map((cell) => cell.textContent?.trim());

    expect(amounts[0]).toBe('L 1,240.50');
  });

  it('muestra el catálogo de íconos con su nombre', () => {
    const names = element.querySelectorAll('#iconos .kit__icon .app-label');

    expect(names.length).toBe(12);
    expect(
      element.querySelectorAll('#iconos fa-icon svg').length,
    ).toBeGreaterThan(12);
  });

  it('cambia el tema desde el selector', async () => {
    const buttons = element.querySelectorAll<HTMLButtonElement>(
      'mat-button-toggle button',
    );

    buttons[2].click();
    await fixture.whenStable();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
