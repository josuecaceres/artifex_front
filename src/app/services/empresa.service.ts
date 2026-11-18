import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CreateEmpresaRequest,
  Empresa,
  UpdateEmpresaRequest,
} from '@interfaces';
import { Observable } from 'rxjs';
import { apiUrl } from './api';

/**
 * Empresas. `list()` usa `GET /api/info-empresa`: a pesar del nombre
 * singular, se asume que devuelve el arreglo de empresas (sin confirmar
 * todavía contra la API real ni con el backend; ver `Empresa` en
 * `@interfaces`).
 */
@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly http = inject(HttpClient);

  list(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(apiUrl('api/info-empresa'));
  }

  create(body: CreateEmpresaRequest): Observable<Empresa> {
    return this.http.post<Empresa>(apiUrl('api/crear-empresa'), body);
  }

  update(id: number, body: UpdateEmpresaRequest): Observable<Empresa> {
    return this.http.put<Empresa>(apiUrl(`api/actualizar-empresa/${id}`), body);
  }
}
