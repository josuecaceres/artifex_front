import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CreateSucursalRequest,
  Sucursal,
  UpdateSucursalRequest,
} from '@empresa/interfaces';
import { SaveResult } from '@shared';
import { Observable } from 'rxjs';
import { apiUrl } from '@shared/utils/api';

/**
 * Sucursales o establecimientos. Cuerpos y respuestas comprobados contra la
 * API real (ver `@empresa/interfaces`).
 */
@Injectable({ providedIn: 'root' })
export class SucursalService {
  private readonly http = inject(HttpClient);

  /** `GET /api/branches`. */
  list(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(apiUrl('api/branches'));
  }

  /** `POST /api/crear-sucursal`. */
  create(body: CreateSucursalRequest): Observable<SaveResult> {
    return this.http.post<SaveResult>(apiUrl('api/crear-sucursal'), body);
  }

  /** `PUT /api/actualizar-sucursal/{id}`. */
  update(id: number, body: UpdateSucursalRequest): Observable<SaveResult> {
    return this.http.put<SaveResult>(
      apiUrl(`api/actualizar-sucursal/${id}`),
      body,
    );
  }
}
