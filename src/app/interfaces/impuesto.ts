/**
 * Impuesto (`GET /api/lista-impuestos`). Comprobado contra la API real:
 * `rate` llega como **texto** con cuatro decimales (`"13.0000"`). Los
 * impuestos precargados son los del catálogo fiscal (IVA, FOVIAL…).
 */
export interface Impuesto {
  id: number;
  name: string;
  code: string;
  rate: string;
  is_percentage: boolean;
  is_active: boolean;
}

/**
 * Cuerpo de `POST /api/crear-impuesto` (singular: la `crear-impuestos` de
 * Postman da 404). `code` es único (el duplicado llega como 500).
 */
export interface CreateImpuestoRequest {
  name: string;
  code: string;
  rate: number;
  is_percentage: boolean;
}

/**
 * Cuerpo de `PATCH /api/actualizar-impuesto/{id}`. Comprobado: a diferencia de
 * lo que sugería Postman, **sí lleva `code`** (obligatorio y editable, único).
 */
export interface UpdateImpuestoRequest extends CreateImpuestoRequest {
  is_active: boolean;
}
