import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CreateUnidadRequest, Unidad, UpdateUnidadRequest } from '@interfaces';
import { Observable } from 'rxjs';
import { apiUrl } from './api';

/**
 * Unidades de medida. Los cuerpos de petición vienen de la colección de
 * Postman; la forma de la respuesta no está confirmada todavía contra la API
 * real.
 */
@Injectable({ providedIn: 'root' })
export class UnidadService {
  private readonly http = inject(HttpClient);

  /** `GET /api/lista-unidades`. */
  list(): Observable<Unidad[]> {
    return this.http.get<Unidad[]>(apiUrl('api/lista-unidades'));
  }

  /** `POST /api/crear-unidades`. */
  create(body: CreateUnidadRequest): Observable<Unidad> {
    return this.http.post<Unidad>(apiUrl('api/crear-unidades'), body);
  }

  /** `PATCH /api/actualizar-unidad/{id}`. */
  update(id: number, body: UpdateUnidadRequest): Observable<Unidad> {
    return this.http.patch<Unidad>(apiUrl(`api/actualizar-unidad/${id}`), body);
  }
}
