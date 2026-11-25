/**
 * Proveedor (`GET /api/lista-proveedores`). El campo `departamento_id` antes
 * se llamaba `departmento_id` (sin la segunda "a") en la API; el backend lo
 * corrigió. La forma de la respuesta no está confirmada todavía contra la
 * API real.
 */
export interface Proveedor {
  id: number;
  name: string;
  nit: string;
  nrc: string;
  has_withholding: boolean;
  withholding_percent: number;
  payment_name: string;
  departamento_id: number;
  municipio_id: number;
  complemento_direccion: string;
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
  departamento_id: number;
  municipio_id: number;
  complemento_direccion: string;
  phone: string;
  email: string;
  contact_person: string;
}

/** Cuerpo de `PATCH /api/actualizar-proveedor/{id}`. */
export interface UpdateProveedorRequest extends CreateProveedorRequest {
  is_active: boolean;
}
