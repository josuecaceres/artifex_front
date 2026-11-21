/**
 * Referencia a un permiso dentro del cuerpo de crear o editar un rol
 * (`{ "permissions": [{ "permission_id": 1 }] }`, comprobado). Puede enviarse
 * como lista vacía o incluso omitirse.
 */
export interface PermissionRef {
  permission_id: number;
}

/**
 * Rol de `GET /api/lista-roles` (comprobado contra la API real). No trae sus
 * permisos: para el conteo de la tabla ver `RoleWithPermissions`, y para los
 * del diálogo `RolePermissionsEntry`.
 */
export interface Role {
  id: number;
  name: string;
  guard_name: string;
}

/** Permiso del catálogo (`GET /api/lista-permisos`), p. ej. "ver usuarios". */
export interface Permission {
  id: number;
  name: string;
}

/** Rol con sus permisos asignados (`GET /api/roles-permisos`). */
export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

/** Permiso de un rol con su marca de si está concedido. */
export interface GrantedPermission extends Permission {
  granted: boolean;
}

/**
 * Elemento de `GET /api/permisos-del-rol/{id}`: la respuesta es un arreglo de
 * un elemento (vacío si el rol no existe) con **todo el catálogo** de permisos
 * y `granted` indicando los concedidos al rol (comprobado).
 */
export interface RolePermissionsEntry {
  id: number;
  name: string;
  permissions: GrantedPermission[];
}

/** Cuerpo de `POST /api/crear-roles` y `PATCH /api/actualizar-roles/{id}`. */
export interface SaveRoleRequest {
  name: string;
  permissions: PermissionRef[];
}
