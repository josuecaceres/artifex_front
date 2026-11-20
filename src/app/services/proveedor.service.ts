import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CreateProveedorRequest,
  Proveedor,
  UpdateProveedorRequest,
  SaveResult,
} from '@interfaces';
import { Observable } from 'rxjs';
import { apiUrl } from './api';

/**
 * Proveedores. Los cuerpos de petición vienen de la colección de Postman; la
 * forma de la respuesta no está confirmada todavía contra la API real.
 */
@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private readonly http = inject(HttpClient);

  /** `GET /api/lista-proveedores`. */
  list(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(apiUrl('api/lista-proveedores'));
  }

  /** `POST /api/crear-proveedor`. */
  create(body: CreateProveedorRequest): Observable<SaveResult> {
    return this.http.post<SaveResult>(apiUrl('api/crear-proveedor'), body);
  }

  /** `PATCH /api/actualizar-proveedor/{id}`. */
  update(id: number, body: UpdateProveedorRequest): Observable<SaveResult> {
    return this.http.patch<SaveResult>(
      apiUrl(`api/actualizar-proveedor/${id}`),
      body,
    );
  }
}
