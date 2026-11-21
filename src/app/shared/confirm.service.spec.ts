import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConfirmService } from './confirm.service';

describe('ConfirmService', () => {
  let service: ConfirmService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(ConfirmService);
  });

  afterEach(() => {
    document
      .querySelectorAll('.cdk-overlay-container')
      .forEach((container) => (container.innerHTML = ''));
  });

  async function nextFrame(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  function dialogButtons(): HTMLButtonElement[] {
    return Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        'app-confirm-dialog mat-dialog-actions button',
      ),
    );
  }

  it('muestra el texto con título y botones por defecto (Confirmar, No, Sí)', async () => {
    const answer = service.ask('¿Seguro?');
    await nextFrame();

    const dialog = document.querySelector('app-confirm-dialog')!;
    expect(dialog.querySelector('h2')?.textContent?.trim()).toBe('Confirmar');
    expect(dialog.textContent).toContain('¿Seguro?');
    expect(dialogButtons().map((b) => b.textContent?.trim())).toEqual([
      'No',
      'Sí',
    ]);

    dialogButtons()[0].click();
    await answer;
  });

  it('acepta título y textos de los botones propios', async () => {
    const answer = service.ask({
      title: 'Desactivar',
      message: '¿Desactivar al usuario?',
      confirmLabel: 'Desactivar',
      cancelLabel: 'Cancelar',
    });
    await nextFrame();

    expect(
      document.querySelector('app-confirm-dialog h2')?.textContent?.trim(),
    ).toBe('Desactivar');
    expect(dialogButtons().map((b) => b.textContent?.trim())).toEqual([
      'Cancelar',
      'Desactivar',
    ]);

    dialogButtons()[0].click();
    await answer;
  });

  it('resuelve true con "Sí"', async () => {
    const answer = service.ask('¿Seguro?');
    await nextFrame();

    dialogButtons()[1].click();

    expect(await answer).toBeTrue();
  });

  it('resuelve false con "No"', async () => {
    const answer = service.ask('¿Seguro?');
    await nextFrame();

    dialogButtons()[0].click();

    expect(await answer).toBeFalse();
  });

  it('resuelve false con Esc', async () => {
    const answer = service.ask('¿Seguro?');
    await nextFrame();

    document.querySelector('mat-dialog-container')!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        bubbles: true,
      }),
    );

    expect(await answer).toBeFalse();
  });

  it('resuelve false con un clic fuera del diálogo', async () => {
    const answer = service.ask('¿Seguro?');
    await nextFrame();

    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')!.click();

    expect(await answer).toBeFalse();
  });

  it('deja el foco inicial en "No"', async () => {
    const answer = service.ask('¿Seguro?');
    // El foco inicial lo mueve el diálogo tras abrirse: se espera a que llegue.
    for (
      let i = 0;
      i < 20 && document.activeElement !== dialogButtons()[0];
      i++
    ) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    expect(document.activeElement).toBe(dialogButtons()[0]);

    dialogButtons()[0].click();
    await answer;
  });
});
