import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Categoria,
  CreateCategoriaRequest,
  UpdateCategoriaRequest,
} from '@inventario/interfaces';
import { SaveResult } from '@shared';
import { Observable } from 'rxjs';
import { apiUrl } from '@shared/utils/api';

/**
 * Categorías. Los cuerpos de petición vienen de la colección de Postman; la
 * forma de la respuesta no está confirmada todavía contra la API real.
 */
@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);

  /** `GET /api/lista-categorias`. */
  list(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(apiUrl('api/lista-categorias'));
  }

  /** `POST /api/crear-categoria`. */
  create(body: CreateCategoriaRequest): Observable<SaveResult> {
    return this.http.post<SaveResult>(apiUrl('api/crear-categoria'), body);
  }

  /** `PATCH /api/actualizar-categoria/{id}`. */
  update(id: number, body: UpdateCategoriaRequest): Observable<SaveResult> {
    return this.http.patch<SaveResult>(
      apiUrl(`api/actualizar-categoria/${id}`),
      body,
    );
  }
}
