/**
 * Empresa (`GET /api/info-empresa`). Comprobado contra la API real: a pesar
 * del nombre singular devuelve el arreglo de empresas. Ojo: el backend
 * devuelve `api_key` y `private_password` **en claro** en este listado (ver
 * Tareas pendientes en CLAUDE.md); el front no debe mostrarlos ni precargarlos.
 */
export interface Empresa {
  id: number;
  name: string;
  nit: string;
  nrc: string;
  activity_code: string;
  activity_description: string;
  comercial_name: string;
  email: string;
  phone: string;
  api_key: string | null;
  private_password: string | null;
}

/**
 * Cuerpo de `POST /api/crear-empresa`. Todos los campos son obligatorios y
 * texto (un número da error); no hay validación de formato en `nit` ni
 * `phone`. Si la empresa ya existe responde 409 "Company already exists".
 */
export interface CreateEmpresaRequest {
  name: string;
  nit: string;
  nrc: string;
  activity_code: string;
  activity_description: string;
  comercial_name: string;
  email: string;
  phone: string;
}

/**
 * Cuerpo de `PUT /api/actualizar-empresa/{id}`. `api_key` y
 * `private_password` son credenciales del certificado de facturación
 * electrónica: opcionales, y **omitirlas las conserva** (comprobado).
 */
export interface UpdateEmpresaRequest extends CreateEmpresaRequest {
  api_key?: string;
  private_password?: string;
}
