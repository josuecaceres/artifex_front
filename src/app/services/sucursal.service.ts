import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CreateSucursalRequest,
  Sucursal,
  UpdateSucursalRequest,
} from '@interfaces';
import { Observable } from 'rxjs';
import { apiUrl } from './api';

/**
 * Sucursales o establecimientos. Los cuerpos de petición y sus validaciones
 * los confirmó el backend directamente; la forma de la respuesta no está
 * confirmada todavía contra la API real.
 */
@Injectable({ providedIn: 'root' })
export class SucursalService {
  private readonly http = inject(HttpClient);

  /** `GET /api/branches`. */
  list(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(apiUrl('api/branches'));
  }

  /** `POST /api/crear-sucursal`. */
  create(body: CreateSucursalRequest): Observable<Sucursal> {
    return this.http.post<Sucursal>(apiUrl('api/crear-sucursal'), body);
  }

  /** `PUT /api/actualizar-sucursal/{id}`. */
  update(id: number, body: UpdateSucursalRequest): Observable<Sucursal> {
    return this.http.put<Sucursal>(
      apiUrl(`api/actualizar-sucursal/${id}`),
      body,
    );
  }
}
