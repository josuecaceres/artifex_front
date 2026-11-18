import { HttpClient } from '@angular/common/http';
import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { AuthUser, LoginRequest, LoginResponse } from '@interfaces';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';
import { apiUrl } from './api';

const TOKEN_KEY = 'app-token';
const USER_KEY = 'app-user';

/**
 * Sesión del usuario. El token (y, si llega, el usuario) se guardan en
 * `localStorage` para sobrevivir a recargas; el interceptor de la API envía
 * el token como `Authorization: Bearer`.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly tokenState = signal<string | null>(this.readToken());
  private readonly userState = signal<AuthUser | null>(this.readUser());

  readonly token = this.tokenState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenState() !== null);

  /** `POST /api/login`. Si responde bien, deja la sesión iniciada. */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(apiUrl('api/login'), credentials).pipe(
      tap((response) => {
        if (!response?.token) {
          throw new Error('La respuesta de login no incluye el token.');
        }
        this.setToken(response.token);
        if (response.user) {
          this.setUser(response.user);
        }
      }),
    );
  }

  /**
   * `POST /api/logout`. La sesión local se cierra siempre, aunque la llamada
   * falle (sin red, token vencido): el usuario no debe quedar atrapado. Va sin
   * cuerpo: el backend identifica la sesión por el token y lo invalida.
   */
  logout(): Observable<void> {
    return this.http.post<unknown>(apiUrl('api/logout'), {}).pipe(
      map(() => undefined),
      catchError(() => of(undefined)),
      finalize(() => this.clearSession()),
    );
  }

  setToken(token: string): void {
    this.tokenState.set(token);
    this.write((storage) => storage.setItem(TOKEN_KEY, token));
  }

  setUser(user: AuthUser): void {
    this.userState.set(user);
    this.write((storage) => storage.setItem(USER_KEY, JSON.stringify(user)));
  }

  /** Cierra la sesión solo en este navegador, sin avisar al backend. */
  clearSession(): void {
    this.tokenState.set(null);
    this.userState.set(null);
    this.write((storage) => {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(USER_KEY);
    });
  }

  private readToken(): string | null {
    try {
      return this.document.defaultView?.localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  }

  private readUser(): AuthUser | null {
    try {
      const raw = this.document.defaultView?.localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private write(action: (storage: Storage) => void): void {
    try {
      const storage = this.document.defaultView?.localStorage;
      if (storage) {
        action(storage);
      }
    } catch {
      // El almacenamiento puede estar bloqueado: la sesión sigue en memoria.
    }
  }
}
