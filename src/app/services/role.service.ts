import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Permission, Role, SaveRoleRequest } from '@interfaces';
import { Observable } from 'rxjs';
import { apiUrl } from './api';

/**
 * Roles y permisos. Los cuerpos de creación y edición están comprobados
 * contra la colección de Postman del backend; la forma de las respuestas no
 * está documentada ahí (sin ejemplos guardados) y queda pendiente de
 * confirmar contra la API real.
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);

  /** `GET /api/lista-roles`. */
  list(): Observable<Role[]> {
    return this.http.get<Role[]>(apiUrl('api/lista-roles'));
  }

  /** `GET /api/lista-permisos`: catálogo completo de permisos. */
  listPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(apiUrl('api/lista-permisos'));
  }

  /** `GET /api/permisos-del-rol/{id}`: permisos ya asignados a un rol. */
  rolePermissions(roleId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(
      apiUrl(`api/permisos-del-rol/${roleId}`),
    );
  }

  /** `POST /api/crear-roles`. */
  create(body: SaveRoleRequest): Observable<Role> {
    return this.http.post<Role>(apiUrl('api/crear-roles'), body);
  }

  /** `PATCH /api/actualizar-roles/{id}`. */
  update(id: number, body: SaveRoleRequest): Observable<Role> {
    return this.http.patch<Role>(apiUrl(`api/actualizar-roles/${id}`), body);
  }
}
