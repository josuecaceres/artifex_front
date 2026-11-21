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

  it('muestra el usuario con avatar, nombre y rol en el pie del riel', () => {
    const footer = element.querySelector('.app-rail__footer')!;

    expect(footer.querySelector('.app-rail__avatar svg')).not.toBeNull();
    expect(footer.querySelector('.app-rail__user-name')?.textContent).toBe(
      'M. Rojas',
    );
    expect(footer.querySelector('.app-rail__user-role')?.textContent).toBe(
      'System Admin',
    );
  });

  it('abre la confirmación global desde "Pedir confirmación"', async () => {
    const button = Array.from(
      element.querySelectorAll<HTMLButtonElement>('#superpuestos button'),
    ).find((b) => b.textContent?.includes('Pedir confirmación'))!;

    button.click();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector('app-confirm-dialog')).not.toBeNull();

    document
      .querySelector<HTMLButtonElement>('app-confirm-dialog button')!
      .click();
    // La respuesta llega como promesa (al terminar la animación de cierre) y
    // abre un aviso: se espera a que aparezca para que no ocurra con el
    // inyector ya destruido.
    for (
      let i = 0;
      i < 80 && !document.querySelector('mat-snack-bar-container');
      i++
    ) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    expect(
      document.querySelector('mat-snack-bar-container')?.textContent,
    ).toContain('Respondiste «No».');
  });

  it('la tabla del kit tiene la barra con buscador y la columna de acciones primero', () => {
    expect(element.querySelector('#tabla app-table-toolbar')).not.toBeNull();
    expect(element.querySelector('#tabla th')?.textContent?.trim()).toBe(
      'Acciones',
    );
  });

  it('el botón "Mostrar toast de éxito" abre el aviso global', async () => {
    const button = Array.from(
      element.querySelectorAll<HTMLButtonElement>('#superpuestos button'),
    ).find((b) => b.textContent?.includes('Mostrar toast de éxito'))!;

    button.click();
    for (let i = 0; i < 40 && !document.querySelector('.app-toast'); i++) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    expect(document.querySelector('.app-toast')?.textContent).toContain(
      'Category created successfully',
    );
  });

  it('el botón "Diálogo de formulario" abre uno de dos columnas con los interruptores al final', async () => {
    const button = Array.from(
      element.querySelectorAll<HTMLButtonElement>('#superpuestos button'),
    ).find((b) => b.textContent?.includes('Diálogo de formulario'))!;

    button.click();
    for (
      let i = 0;
      i < 40 && !document.querySelector('app-kit-form-dialog');
      i++
    ) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    const content = document.querySelector(
      'app-kit-form-dialog mat-dialog-content',
    )!;
    expect(content.classList).toContain('app-form--2');
    expect(document.querySelector('.app-form-dialog')).not.toBeNull();
    expect(content.lastElementChild?.classList).toContain('app-form__switches');
    document
      .querySelectorAll('.cdk-overlay-container')
      .forEach((container) => (container.innerHTML = ''));
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
    element.querySelector<HTMLButtonElement>('.kit__theme')!.click();
    await fixture.whenStable();
    const options = document.querySelectorAll<HTMLButtonElement>(
      '[role="menuitemradio"]',
    );

    options[2].click();
    await fixture.whenStable();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
