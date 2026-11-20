/**
 * Marca (`GET /api/lista-marcas`). La forma de la respuesta no está
 * confirmada todavía contra la API real.
 */
export interface Marca {
  id: number;
  name: string;
  is_active: boolean;
}

/** Cuerpo de `POST /api/crear-marca`. */
export interface CreateMarcaRequest {
  name: string;
}

/** Cuerpo de `PATCH /api/actualizar-marca/{id}`. */
export interface UpdateMarcaRequest extends CreateMarcaRequest {
  is_active: boolean;
}
