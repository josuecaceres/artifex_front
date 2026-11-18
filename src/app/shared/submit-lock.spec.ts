import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, config } from 'rxjs';
import { SubmitLock, SubmitResult } from './submit-lock';

@Component({
  imports: [SubmitLock],
  template: `
    <form [appSubmitLock]="action" #lock="appSubmitLock">
      <button type="submit" [disabled]="lock.pending()">Guardar</button>
    </form>
  `,
})
class Host {
  calls = 0;
  result: SubmitResult = undefined;
  readonly action = (): SubmitResult => {
    this.calls++;
    return this.result;
  };
}

describe('SubmitLock', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let form: HTMLFormElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
    form = (fixture.nativeElement as HTMLElement).querySelector('form')!;
  });

  function submit(): void {
    form.dispatchEvent(new Event('submit', { cancelable: true }));
  }

  it('ignora los envíos repetidos mientras la acción está en curso', async () => {
    const request = new Subject<void>();
    host.result = request;

    submit();
    submit();
    submit();
    await fixture.whenStable();

    expect(host.calls).toBe(1);
    expect(form.getAttribute('aria-busy')).toBe('true');
    expect(form.querySelector('button')?.disabled).toBeTrue();
  });

  it('se libera al terminar la acción y permite enviar de nuevo', async () => {
    const request = new Subject<void>();
    host.result = request;

    submit();
    request.next();
    request.complete();
    await fixture.whenStable();

    expect(form.getAttribute('aria-busy')).toBe('false');
    expect(form.querySelector('button')?.disabled).toBeFalse();

    host.result = new Subject<void>();
    submit();
    expect(host.calls).toBe(2);
  });

  it('se libera también cuando la acción falla', async () => {
    const request = new Subject<void>();
    host.result = request;
    // El error de la acción no se maneja aquí: RxJS lo reporta como no capturado.
    const unhandled = jasmine.createSpy('onUnhandledError');
    config.onUnhandledError = unhandled;

    try {
      submit();
      request.error(new Error('falló'));
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve)); // RxJS reporta en un timeout

      expect(form.getAttribute('aria-busy')).toBe('false');
      expect(unhandled).toHaveBeenCalled();
    } finally {
      config.onUnhandledError = null;
    }
  });

  it('no bloquea si la acción no envió nada (formulario inválido)', async () => {
    host.result = undefined;

    submit();
    submit();
    await fixture.whenStable();

    expect(host.calls).toBe(2);
    expect(form.getAttribute('aria-busy')).toBe('false');
  });

  it('acepta una Promise como resultado', async () => {
    let resolve!: () => void;
    host.result = new Promise<void>((r) => (resolve = r));

    submit();
    submit();
    expect(host.calls).toBe(1);

    resolve();
    await fixture.whenStable();
    await Promise.resolve();
    await fixture.whenStable();

    expect(form.getAttribute('aria-busy')).toBe('false');
  });

  it('evita el envío nativo del formulario', () => {
    const event = new Event('submit', { cancelable: true });

    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBeTrue();
  });
});
