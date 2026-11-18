import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CreateProveedorRequest,
  Proveedor,
  UpdateProveedorRequest,
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
  create(body: CreateProveedorRequest): Observable<Proveedor> {
    return this.http.post<Proveedor>(apiUrl('api/crear-proveedor'), body);
  }

  /** `PATCH /api/actualizar-proveedor/{id}`. */
  update(id: number, body: UpdateProveedorRequest): Observable<Proveedor> {
    return this.http.patch<Proveedor>(
      apiUrl(`api/actualizar-proveedor/${id}`),
      body,
    );
  }
}
