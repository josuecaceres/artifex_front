/**
 * Referencia a un permiso dentro del cuerpo de crear o editar un rol
 * (`{ "permissions": [{ "permission_id": 1 }] }`, comprobado en la colección
 * de Postman). Puede enviarse como lista vacía.
 */
export interface PermissionRef {
  permission_id: number;
}

/**
 * Rol administrado desde el panel (`GET /api/lista-roles`). La colección de
 * Postman no trae un ejemplo de respuesta guardado: los campos se infieren
 * del cuerpo de creación y edición, pendiente de confirmar contra la API real.
 */
export interface Role {
  id: number;
  name: string;
  permissions: PermissionRef[];
}

/**
 * Permiso del catálogo (`GET /api/lista-permisos`) o de los permisos de un rol
 * (`GET /api/permisos-del-rol/{id}`). Forma estimada (sin ejemplo de
 * respuesta en Postman): se asume un id numérico y un nombre, como los que ya
 * llegan en `LoginResponse.permissions` (`@interfaces`), por ejemplo
 * "ver usuarios".
 */
export interface Permission {
  id: number;
  name: string;
}

/** Cuerpo de `POST /api/crear-roles` y `PATCH /api/actualizar-roles/{id}`. */
export interface SaveRoleRequest {
  name: string;
  permissions: PermissionRef[];
}
