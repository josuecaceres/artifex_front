import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CreateMarcaRequest,
  Marca,
  UpdateMarcaRequest,
  SaveResult,
} from '@interfaces';
import { Observable } from 'rxjs';
import { apiUrl } from './api';

/**
 * Marcas. Los cuerpos de petición vienen de la colección de Postman; la
 * forma de la respuesta no está confirmada todavía contra la API real.
 */
@Injectable({ providedIn: 'root' })
export class MarcaService {
  private readonly http = inject(HttpClient);

  /** `GET /api/lista-marcas`. */
  list(): Observable<Marca[]> {
    return this.http.get<Marca[]>(apiUrl('api/lista-marcas'));
  }

  /** `POST /api/crear-marca`. */
  create(body: CreateMarcaRequest): Observable<SaveResult> {
    return this.http.post<SaveResult>(apiUrl('api/crear-marca'), body);
  }

  /** `PATCH /api/actualizar-marca/{id}`. */
  update(id: number, body: UpdateMarcaRequest): Observable<SaveResult> {
    return this.http.patch<SaveResult>(
      apiUrl(`api/actualizar-marca/${id}`),
      body,
    );
  }
}
