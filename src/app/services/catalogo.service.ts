import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Departamento, Municipio, TipoEstablecimiento } from '@interfaces';
import { Observable, shareReplay } from 'rxjs';
import { apiUrl } from './api';

/**
 * Catálogos de solo lectura que alimentan selectores (formas comprobadas
 * contra la API real). Departamentos y tipos de establecimiento no cambian
 * durante la sesión, así que se piden una sola vez; los municipios dependen
 * del departamento y se piden cada vez.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);

  private readonly departamentos$ = this.http
    .get<Departamento[]>(apiUrl('api/departamentos'))
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  private readonly tipos$ = this.http
    .get<TipoEstablecimiento[]>(apiUrl('api/tipo-establecimiento'))
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  /** `GET /api/departamentos`. */
  departamentos(): Observable<Departamento[]> {
    return this.departamentos$;
  }

  /** `GET /api/departamentos/{id}/municipios`: solo los de ese departamento. */
  municipios(departamentoId: number): Observable<Municipio[]> {
    return this.http.get<Municipio[]>(
      apiUrl(`api/departamentos/${departamentoId}/municipios`),
    );
  }

  /** `GET /api/tipo-establecimiento`: Sucursal, Casa Matriz, Bodega, Patio. */
  tiposEstablecimiento(): Observable<TipoEstablecimiento[]> {
    return this.tipos$;
  }
}
