import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    document
      .querySelectorAll('.cdk-overlay-container')
      .forEach((container) => (container.innerHTML = ''));
  });

  async function nextFrame(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const toast = () => document.querySelector('.app-toast');

  it('muestra el mensaje tal cual, con un icono, y como aviso cortés (aria-live polite)', async () => {
    service.success('Category created successfully');
    await nextFrame();

    expect(toast()).not.toBeNull();
    expect(toast()!.textContent).toContain('Category created successfully');
    expect(toast()!.querySelector('fa-icon svg')).not.toBeNull();
    expect(
      toast()!.querySelector('[aria-live]')?.getAttribute('aria-live'),
    ).toBe('polite');
  });

  it('sin mensaje usa un texto genérico', async () => {
    service.success(undefined);
    await nextFrame();

    expect(toast()!.textContent).toContain('Cambios guardados.');
  });

  it('se cierra con su botón', async () => {
    service.success('Hecho');
    await nextFrame();

    toast()!
      .querySelector<HTMLButtonElement>('[aria-label="Cerrar aviso"]')!
      .click();
    for (let i = 0; i < 40 && toast(); i++) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    expect(toast()).toBeNull();
  });

  it('un aviso nuevo reemplaza al anterior', async () => {
    service.success('Primero');
    await nextFrame();
    service.success('Segundo');
    for (
      let i = 0;
      i < 40 && document.querySelectorAll('.app-toast').length > 1;
      i++
    ) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    expect(document.querySelectorAll('.app-toast').length).toBe(1);
    expect(toast()!.textContent).toContain('Segundo');
  });
});
