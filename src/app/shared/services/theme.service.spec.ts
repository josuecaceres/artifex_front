import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  const root = document.documentElement;

  function createService(): ThemeService {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    return TestBed.inject(ThemeService);
  }

  beforeEach(() => {
    localStorage.removeItem('app-theme');
    root.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.removeItem('app-theme');
    root.removeAttribute('data-theme');
  });

  it('empieza en modo sistema y no fija data-theme', () => {
    const service = createService();

    expect(service.mode()).toBe('system');
    expect(root.hasAttribute('data-theme')).toBeFalse();
  });

  it('aplica y guarda el tema oscuro', () => {
    const service = createService();

    service.setMode('dark');

    expect(service.mode()).toBe('dark');
    expect(service.resolved()).toBe('dark');
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('app-theme')).toBe('dark');
  });

  it('aplica el tema claro aunque el sistema sea oscuro', () => {
    const service = createService();

    service.setMode('light');

    expect(service.resolved()).toBe('light');
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('quita data-theme al volver al modo sistema', () => {
    const service = createService();
    service.setMode('dark');

    service.setMode('system');

    expect(root.hasAttribute('data-theme')).toBeFalse();
    expect(localStorage.getItem('app-theme')).toBe('system');
  });

  it('restaura la elección guardada al iniciar', () => {
    localStorage.setItem('app-theme', 'dark');

    const service = createService();

    expect(service.mode()).toBe('dark');
    expect(root.getAttribute('data-theme')).toBe('dark');
  });

  it('ignora un valor guardado que no es válido', () => {
    localStorage.setItem('app-theme', 'sepia');

    const service = createService();

    expect(service.mode()).toBe('system');
    expect(root.hasAttribute('data-theme')).toBeFalse();
  });
});
