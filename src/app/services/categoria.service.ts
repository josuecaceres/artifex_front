import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Categoria,
  CreateCategoriaRequest,
  UpdateCategoriaRequest,
} from '@interfaces';
import { Observable } from 'rxjs';
import { apiUrl } from './api';

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

  /** `POST /api/crear-categorias`. */
  create(body: CreateCategoriaRequest): Observable<Categoria> {
    return this.http.post<Categoria>(apiUrl('api/crear-categorias'), body);
  }

  /** `PATCH /api/actualizar-categoria/{id}`. */
  update(id: number, body: UpdateCategoriaRequest): Observable<Categoria> {
    return this.http.patch<Categoria>(
      apiUrl(`api/actualizar-categoria/${id}`),
      body,
    );
  }
}
