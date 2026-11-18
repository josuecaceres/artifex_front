/**
 * Impuesto (`GET /api/lista-impuestos`). La forma de la respuesta no está
 * confirmada todavía contra la API real.
 */
export interface Impuesto {
  id: number;
  name: string;
  code: string;
  rate: number;
  is_percentage: boolean;
  is_active: boolean;
}

/** Cuerpo de `POST /api/crear-impuestos`. */
export interface CreateImpuestoRequest {
  name: string;
  code: string;
  rate: number;
  is_percentage: boolean;
}

/**
 * Cuerpo de `PATCH /api/actualizar-impuesto/{id}`. A diferencia de crear, no
 * lleva `code` (la colección de Postman no lo trae en el body de editar):
 * se asume que el código no se puede cambiar después de creado.
 */
export interface UpdateImpuestoRequest {
  name: string;
  rate: number;
  is_percentage: boolean;
  is_active: boolean;
}
