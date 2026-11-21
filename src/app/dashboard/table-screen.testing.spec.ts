import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Type, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { ToastService } from '@shared';
import { of } from 'rxjs';

/**
 * Pruebas comunes de las pantallas con tabla del dashboard (barra de la tabla,
 * columna de acciones primero, aviso de éxito, estilo del diálogo y barra oculta
 * si el listado falla). Cada pantalla las incluye con `describeTableScreen(...)`
 * en su spec; lo propio de cada una (datos, columnas, errores) sigue en su spec.
 */
export function describeTableScreen(
  label: string,
  screen: Type<unknown>,
  createLabel: string,
): void {
  describe(`${label}: tabla`, () => {
    let fixture: ComponentFixture<unknown>;
    let http: HttpTestingController;
    let element: HTMLElement;

    /** Responde con listas vacías a lo que la pantalla pida (algunas piden en cadena). */
    async function flushAll(): Promise<void> {
      for (let round = 0; round < 5; round++) {
        const pending = http.match(() => true);
        if (pending.length === 0) {
          break;
        }
        pending.forEach((request) => request.flush([]));
        fixture.detectChanges();
        await fixture.whenStable();
      }
    }

    /** El `MatDialog` de la pantalla (lo provee su `MaterialModule`, no la raíz). */
    const screenDialog = () => fixture.debugElement.injector.get(MatDialog);

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [screen],
        providers: [
          provideZonelessChangeDetection(),
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      }).compileComponents();

      http = TestBed.inject(HttpTestingController);
      fixture = TestBed.createComponent(screen);
      fixture.detectChanges();
      await fixture.whenStable();
      await flushAll();
      element = fixture.nativeElement as HTMLElement;
    });

    afterEach(() => http.verify());

    it('pone el botón de crear en la barra de la tabla, junto al buscador', () => {
      const start = element.querySelector(
        'app-table-toolbar .app-toolbar__start',
      )!;
      const children = Array.from(start.children);

      expect(children[0].textContent?.trim()).toBe(createLabel);
      expect(children[1].classList).toContain('app-toolbar__search');
    });

    it('el título queda solo en la cabecera, sin el botón de crear', () => {
      const head = element.querySelector('.page__head')!;

      expect(head.querySelector('h1')).not.toBeNull();
      expect(head.querySelector('button')).toBeNull();
    });

    it('tiene "Columnas" y "Exportar" a la derecha', () => {
      const labels = Array.from(
        element.querySelectorAll('.app-toolbar__end button'),
      ).map((button) => button.textContent?.trim());

      expect(labels).toEqual(['Columnas', 'Exportar']);
    });

    it('la columna de acciones es la primera, se llama "Acciones" y está fija', () => {
      const headers = Array.from(element.querySelectorAll('th'));

      expect(headers[0].textContent?.trim()).toBe('Acciones');
      expect(headers[0].classList).toContain('mat-column-actions');
      expect(headers[0].classList).toContain('mat-mdc-table-sticky');
      expect(headers.slice(1).every((th) => th.textContent?.trim())).toBeTrue();
    });

    it('al guardar muestra el message de la API en un aviso y recarga la lista', async () => {
      const toast = spyOn(TestBed.inject(ToastService), 'success');
      spyOn(screenDialog(), 'open').and.returnValue({
        afterClosed: () => of({ message: 'Saved by the API' }),
      } as unknown as MatDialogRef<unknown, unknown>);

      element
        .querySelector<HTMLButtonElement>(
          'app-table-toolbar .app-toolbar__start button',
        )!
        .click();
      await fixture.whenStable();

      expect(toast).toHaveBeenCalledOnceWith('Saved by the API');
      expect(http.match(() => true).length).toBeGreaterThan(0);
    });

    it('abre el diálogo con el estilo de formulario (opt-in)', () => {
      const open = spyOn(screenDialog(), 'open').and.returnValue({
        afterClosed: () => of(undefined),
      } as unknown as MatDialogRef<unknown, unknown>);

      element
        .querySelector<HTMLButtonElement>(
          'app-table-toolbar .app-toolbar__start button',
        )!
        .click();

      const config = open.calls.mostRecent().args[1]!;
      expect(config.panelClass).toBe('app-form-dialog');
      expect(config.maxWidth).toBe('92vw');
    });

    it('si el diálogo se cierra sin guardar no muestra aviso ni recarga', async () => {
      const toast = spyOn(TestBed.inject(ToastService), 'success');
      spyOn(screenDialog(), 'open').and.returnValue({
        afterClosed: () => of(undefined),
      } as unknown as MatDialogRef<unknown, unknown>);

      element
        .querySelector<HTMLButtonElement>(
          'app-table-toolbar .app-toolbar__start button',
        )!
        .click();
      await fixture.whenStable();

      expect(toast).not.toHaveBeenCalled();
      http.expectNone(() => true);
    });
  });

  describe(`${label}: listado en error`, () => {
    let fixture: ComponentFixture<unknown>;
    let http: HttpTestingController;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [screen],
        providers: [
          provideZonelessChangeDetection(),
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      }).compileComponents();

      http = TestBed.inject(HttpTestingController);
      fixture = TestBed.createComponent(screen);
      fixture.detectChanges();
      await fixture.whenStable();
      http
        .match(() => true)
        .forEach((request) =>
          request.flush(
            { message: 'Tu plan no incluye módulo de inventario.' },
            { status: 403, statusText: '' },
          ),
        );
      fixture.detectChanges();
      await fixture.whenStable();
    });

    afterEach(() => http.verify());

    it('sin tabla no hay barra (ni botón de crear): solo el aviso', () => {
      const element = fixture.nativeElement as HTMLElement;

      expect(element.querySelector('[role="alert"]')?.textContent).toContain(
        'Tu plan no incluye módulo de inventario.',
      );
      expect(element.querySelector('app-table-toolbar')).toBeNull();
      expect(element.querySelector('.page__head h1')).not.toBeNull();
    });
  });
}
