import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CreateImpuestoRequest,
  Impuesto,
  UpdateImpuestoRequest,
} from '@interfaces';
import { Observable } from 'rxjs';
import { apiUrl } from './api';

/**
 * Impuestos. Los cuerpos de petición vienen de la colección de Postman; la
 * forma de la respuesta no está confirmada todavía contra la API real.
 */
@Injectable({ providedIn: 'root' })
export class ImpuestoService {
  private readonly http = inject(HttpClient);

  /** `GET /api/lista-impuestos`. */
  list(): Observable<Impuesto[]> {
    return this.http.get<Impuesto[]>(apiUrl('api/lista-impuestos'));
  }

  /** `POST /api/crear-impuestos`. */
  create(body: CreateImpuestoRequest): Observable<Impuesto> {
    return this.http.post<Impuesto>(apiUrl('api/crear-impuestos'), body);
  }

  /** `PATCH /api/actualizar-impuesto/{id}`. */
  update(id: number, body: UpdateImpuestoRequest): Observable<Impuesto> {
    return this.http.patch<Impuesto>(
      apiUrl(`api/actualizar-impuesto/${id}`),
      body,
    );
  }
}
