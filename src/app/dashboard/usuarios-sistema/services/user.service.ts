import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  AppUser,
  ChangePasswordRequest,
  CreateUserRequest,
  UpdateUserRequest,
} from '@usuarios-sistema/interfaces';
import { SaveResult } from '@shared';
import { Observable, map } from 'rxjs';
import { apiUrl } from '@shared/utils/api';

/**
 * Usuarios de la plataforma. Los cuerpos de petición están comprobados contra
 * la colección de Postman del backend; la forma de las respuestas no está
 * documentada ahí (sin ejemplos guardados) y queda pendiente de confirmar
 * contra la API real.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  /** `GET /api/users`. */
  list(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(apiUrl('api/users'));
  }

  /** `POST /api/crear-usuario`. */
  create(body: CreateUserRequest): Observable<SaveResult> {
    return this.http.post<SaveResult>(apiUrl('api/crear-usuario'), body);
  }

  /** `PATCH /api/editar-usuario/{id}`. */
  update(id: number, body: UpdateUserRequest): Observable<SaveResult> {
    return this.http.patch<SaveResult>(
      apiUrl(`api/editar-usuario/${id}`),
      body,
    );
  }

  /**
   * `POST /api/change-password` (pública: no lleva `Authorization`, ver
   * `PUBLIC_API_PATHS` en `api.ts`). El cuerpo es el que trae la colección de
   * Postman tal cual; ver la nota en `ChangePasswordRequest` (`@usuarios-sistema/interfaces`).
   */
  changePassword(body: ChangePasswordRequest): Observable<void> {
    return this.http
      .post<unknown>(apiUrl('api/change-password'), body)
      .pipe(map(() => undefined));
  }
}
