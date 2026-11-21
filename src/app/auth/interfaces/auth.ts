/**
 * Cuerpo de `POST /api/login`. El backend confirmó que `user_name` acepta el
 * correo o el acrónimo (el acrónimo, comprobado, distingue mayúsculas) y que
 * `password` es nullable (se puede omitir o enviar `null`); pero sin
 * contraseña (o con una cualquiera) a un usuario que aún no la ha creado el
 * login le responde `PasswordSetupRequired`. Aquí `password` sigue como
 * obligatorio porque el formulario de login no ofrece acceso sin contraseña.
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
  tenant_features: unknown[];
}

/**
 * Login correcto (200 con token), comprobado contra el backend de desarrollo.
 * `roles` y `permissions` llegan como listas de nombres (por ejemplo
 * `["System Admin"]` y `["ver usuarios"]`). Hoy la app solo guarda el
 * `token` y el usuario; el resto se usará con los guards de permisos.
 */
export interface LoginSuccess {
  token: string;
  user: AuthUser;
  roles: string[];
  permissions: string[];
  tenant: AuthTenant;
}

/**
 * Login de un usuario que todavía no ha creado su contraseña: el backend
 * responde **200 sin token** (comprobado). El usuario debe crearla desde
 * `/auth/forgot-password` (`POST /api/change-password`) y luego esperar a que
 * un administrador lo autorice.
 */
export interface PasswordSetupRequired {
  require_password_setup: true;
  user_id: number;
  message: string;
}

/** Respuesta de `POST /api/login`. */
export type LoginResponse = LoginSuccess | PasswordSetupRequired;

/** Distingue el login correcto del que pide crear la contraseña. */
export function isLoginSuccess(
  response: LoginResponse,
): response is LoginSuccess {
  return 'token' in response && !!response.token;
}
