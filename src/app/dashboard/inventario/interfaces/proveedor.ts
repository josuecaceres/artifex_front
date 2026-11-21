/**
 * Proveedor (`GET /api/lista-proveedores`). `departmento_id` está escrito
 * así (sin la segunda "a") porque es el nombre exacto que espera la API,
 * confirmado en la colección de Postman: no es un error de este archivo.
 * La forma de la respuesta no está confirmada todavía contra la API real.
 */
export interface Proveedor {
  id: number;
  name: string;
  nit: string;
  nrc: string;
  has_withholding: boolean;
  withholding_percent: number;
  payment_name: string;
  departmento_id: number;
  municipio_id: number;
  address_complement: string;
  phone: string;
  email: string;
  contact_person: string;
  is_active: boolean;
}

/** Cuerpo de `POST /api/crear-proveedor`. */
export interface CreateProveedorRequest {
  name: string;
  nit: string;
  nrc: string;
  has_withholding: boolean;
  withholding_percent: number;
  payment_name: string;
  departmento_id: number;
  municipio_id: number;
  address_complement: string;
  phone: string;
  email: string;
  contact_person: string;
}

/** Cuerpo de `PATCH /api/actualizar-proveedor/{id}`. */
export interface UpdateProveedorRequest extends CreateProveedorRequest {
  is_active: boolean;
}
