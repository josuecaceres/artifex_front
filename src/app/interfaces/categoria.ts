/**
 * Categoría (`GET /api/lista-categorias`). La forma de la respuesta no está
 * confirmada todavía contra la API real.
 */
export interface Categoria {
  id: number;
  name: string;
  is_active: boolean;
}

/** Cuerpo de `POST /api/crear-categoria`. */
export interface CreateCategoriaRequest {
  name: string;
}

/** Cuerpo de `PATCH /api/actualizar-categoria/{id}`. */
export interface UpdateCategoriaRequest extends CreateCategoriaRequest {
  is_active: boolean;
}
