/**
 * Usuario administrado desde el panel (`GET /api/users`). Forma comprobada
 * contra la API real. Los usuarios de sistema (administradores) pueden venir
 * sin sucursal (`branch_id` y `branch` en `null`). `roles` trae los nombres de
 * rol, no sus ids: para editar el rol hay que cruzarlo con `GET
 * /api/lista-roles`.
 */
export interface AppUser {
  id: number;
  name: string;
  acronym: string;
  email: string;
  roles: string[];
  branch: string | null;
  branch_id: number | null;
  authorized: boolean;
  is_active: boolean;
}

/**
 * Cuerpo de `POST /api/crear-usuario`. `rol_id` (id de un rol existente) y
 * `authorized` son obligatorios aunque la colección de Postman no los traiga
 * (comprobado). El backend **ignora** `authorized` al crear: el usuario nace
 * sin autorizar y sin contraseña.
 */
export interface CreateUserRequest {
  name: string;
  acronym: string;
  email: string;
  branch_id: number;
  rol_id: number;
  authorized: boolean;
}

/**
 * Cuerpo de `PATCH /api/editar-usuario/{id}`. Todos los campos, incluido
 * `rol_id`, son obligatorios (comprobado). `name` debe ser único.
 */
export interface UpdateUserRequest {
  name: string;
  acronym: string;
  email: string;
  branch_id: number;
  rol_id: number;
  authorized: boolean;
  is_active: boolean;
}

/**
 * Cuerpo de `POST /api/change-password` (pública, sin token). Comprobado: la
 * contraseña mínima es de 8 caracteres y el backend responde 200 aunque los
 * datos no coincidan con ningún usuario (no revela si existe). Es también el
 * paso con el que un usuario recién creado fija su primera contraseña, tras lo
 * cual queda pendiente de autorización.
 */
export interface ChangePasswordRequest {
  name: string;
  acronym: string;
  email: string;
  password: string;
}
