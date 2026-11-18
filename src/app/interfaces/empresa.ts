/**
 * Empresa (`GET /api/info-empresa`). La colección de Postman no trae un
 * endpoint de listado: se asume que esta ruta, a pesar del nombre singular,
 * devuelve el arreglo de empresas; sin confirmar todavía contra la API real
 * ni con el backend.
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
}

/** Cuerpo de `POST /api/crear-empresa`. */
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
 * electrónica: opcionales, vacío significa no cambiarlas.
 */
export interface UpdateEmpresaRequest extends CreateEmpresaRequest {
  api_key?: string;
  private_password?: string;
}
