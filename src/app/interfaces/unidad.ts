/**
 * Unidad de medida (`GET /api/lista-unidades`). La forma de la respuesta no
 * está confirmada todavía contra la API real.
 */
export interface Unidad {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

/** Cuerpo de `POST /api/crear-unidades`. */
export interface CreateUnidadRequest {
  name: string;
  code: string;
}

/** Cuerpo de `PATCH /api/actualizar-unidad/{id}`. */
export interface UpdateUnidadRequest extends CreateUnidadRequest {
  is_active: boolean;
}
