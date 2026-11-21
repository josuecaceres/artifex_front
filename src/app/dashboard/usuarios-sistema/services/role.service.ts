import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Permission,
  Role,
  RolePermissionsEntry,
  RoleWithPermissions,
  SaveRoleRequest,
} from '@usuarios-sistema/interfaces';
import { SaveResult } from '@shared';
import { Observable, map } from 'rxjs';
import { apiUrl } from '@shared/utils/api';

/**
 * Roles y permisos. Cuerpos y respuestas comprobados contra la API real (ver
 * `@usuarios-sistema/interfaces`).
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);

  /** `GET /api/lista-roles`: roles sin permisos (para selectores). */
  list(): Observable<Role[]> {
    return this.http.get<Role[]>(apiUrl('api/lista-roles'));
  }

  /** `GET /api/roles-permisos`: cada rol con los permisos que tiene. */
  listWithPermissions(): Observable<RoleWithPermissions[]> {
    return this.http.get<RoleWithPermissions[]>(apiUrl('api/roles-permisos'));
  }

  /** `GET /api/lista-permisos`: catálogo completo de permisos. */
  listPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(apiUrl('api/lista-permisos'));
  }

  /**
   * `GET /api/permisos-del-rol/{id}`: la API devuelve todo el catálogo con
   * `granted`; aquí se reduce a los permisos concedidos al rol (vacío si el
   * rol no existe).
   */
  rolePermissions(roleId: number): Observable<Permission[]> {
    return this.http
      .get<RolePermissionsEntry[]>(apiUrl(`api/permisos-del-rol/${roleId}`))
      .pipe(
        map((entries) =>
          (entries[0]?.permissions ?? [])
            .filter((permission) => permission.granted)
            .map(({ id, name }) => ({ id, name })),
        ),
      );
  }

  /** `POST /api/crear-roles`. */
  create(body: SaveRoleRequest): Observable<SaveResult> {
    return this.http.post<SaveResult>(apiUrl('api/crear-roles'), body);
  }

  /** `PATCH /api/actualizar-roles/{id}`. */
  update(id: number, body: SaveRoleRequest): Observable<SaveResult> {
    return this.http.patch<SaveResult>(
      apiUrl(`api/actualizar-roles/${id}`),
      body,
    );
  }
}
