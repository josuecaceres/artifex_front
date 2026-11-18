import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';

/** Preferencia de tema: `system` sigue al sistema operativo. */
export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'app-theme';
const MODES: readonly ThemeMode[] = ['system', 'light', 'dark'];

/**
 * Administra el tema claro/oscuro. La elección se guarda en `localStorage` y se
 * aplica con el atributo `data-theme` de `<html>`; en modo `system` el atributo
 * se quita y la hoja de estilos usa `prefers-color-scheme`.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly systemQuery = this.document.defaultView?.matchMedia?.(
    '(prefers-color-scheme: dark)',
  );

  private readonly modeState = signal<ThemeMode>(this.readStoredMode());
  private readonly systemDark = signal(this.systemQuery?.matches ?? false);

  /** Preferencia elegida por la persona usuaria. */
  readonly mode = this.modeState.asReadonly();

  /** Tema que se está mostrando realmente. */
  readonly resolved = computed<'light' | 'dark'>(() => {
    const mode = this.modeState();
    if (mode === 'system') {
      return this.systemDark() ? 'dark' : 'light';
    }
    return mode;
  });

  constructor() {
    this.apply(this.modeState());
    this.systemQuery?.addEventListener('change', (event) =>
      this.systemDark.set(event.matches),
    );
  }

  setMode(mode: ThemeMode): void {
    this.modeState.set(mode);
    this.apply(mode);
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // El almacenamiento puede estar bloqueado: el tema sigue funcionando en la sesión.
    }
  }

  private apply(mode: ThemeMode): void {
    const root = this.document.documentElement;
    if (mode === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', mode);
    }
  }

  private readStoredMode(): ThemeMode {
    try {
      const stored =
        this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return MODES.find((mode) => mode === stored) ?? 'system';
    } catch {
      return 'system';
    }
  }
}
