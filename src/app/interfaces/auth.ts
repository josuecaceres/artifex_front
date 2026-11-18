/**
 * Cuerpo de `POST /api/login`. El backend confirmó que `user_name` acepta el
 * correo o el acrónimo (sin distinguir mayúsculas) y que `password` es
 * nullable (se puede omitir o enviar `null`); aquí sigue como obligatorio
 * porque el formulario de login todavía no ofrece ese acceso sin contraseña
 * (pendiente de decidir con el usuario, ver CLAUDE.md).
 */
export interface LoginRequest {
  user_name: string;
  password: string;
}

/** Usuario que devuelve el login. */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

/** Empresa (tenant) a la que pertenece la sesión. */
export interface AuthTenant {
  name: string;
  codigo: string;
  country: string;
  tenant_features: unknown;
}

/**
 * Respuesta de `POST /api/login` (200), comprobada contra el backend de
 * desarrollo. `roles` llega como texto (un solo rol) y `permissions` como lista
 * de nombres, por ejemplo "ver usuarios". Hoy la app solo guarda el `token`; el
 * resto se usará con los guards de roles y permisos.
 */
export interface LoginResponse {
  token: string;
  user: AuthUser;
  roles: string;
  permissions: string[];
  tenant: AuthTenant;
}
