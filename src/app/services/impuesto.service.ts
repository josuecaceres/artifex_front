import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CreateImpuestoRequest,
  Impuesto,
  UpdateImpuestoRequest,
  SaveResult,
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

  /** `POST /api/crear-impuesto`. */
  create(body: CreateImpuestoRequest): Observable<SaveResult> {
    return this.http.post<SaveResult>(apiUrl('api/crear-impuesto'), body);
  }

  /** `PATCH /api/actualizar-impuesto/{id}`. */
  update(id: number, body: UpdateImpuestoRequest): Observable<SaveResult> {
    return this.http.patch<SaveResult>(
      apiUrl(`api/actualizar-impuesto/${id}`),
      body,
    );
  }
}
