/**
 * Usuario administrado desde el panel (`GET /api/users`). La colección de
 * Postman no trae un ejemplo de respuesta guardado para esta ruta: los campos
 * se infieren de los cuerpos de `crear-usuario` y `editar-usuario`, pendiente
 * de confirmar contra la API real.
 */
export interface AppUser {
  id: number;
  name: string;
  acronym: string;
  email: string;
  branch_id: number;
  authorized: boolean;
  is_active: boolean;
}

/** Cuerpo de `POST /api/crear-usuario`. */
export interface CreateUserRequest {
  name: string;
  acronym: string;
  email: string;
  branch_id: number;
}

/** Cuerpo de `PATCH /api/editar-usuario/{id}`. */
export interface UpdateUserRequest {
  name: string;
  acronym: string;
  email: string;
  branch_id: number;
  authorized: boolean;
  is_active: boolean;
}

/**
 * Cuerpo de `POST /api/change-password` (pública, sin token). Tomado tal cual
 * de la colección de Postman: pide nombre, siglas y correo además de la
 * contraseña nueva, una forma atípica para un flujo sin sesión (no pide la
 * contraseña actual ni un código de verificación). Sin confirmar todavía
 * contra la API real ni contra el equipo de backend.
 */
export interface ChangePasswordRequest {
  name: string;
  acronym: string;
  email: string;
  password: string;
}
