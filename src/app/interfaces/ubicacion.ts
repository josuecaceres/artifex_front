/** Departamento (`GET /api/departamentos`). Comprobado contra la API real. */
export interface Departamento {
  id: number;
  code: string;
  name: string;
}

/**
 * Municipio (`GET /api/municipios`, todos, o `GET
 * /api/departamentos/{id}/municipios`, solo los del departamento, esta última
 * sin `code`). Comprobado contra la API real. El backend no valida que el
 * municipio pertenezca al departamento enviado: el front debe encadenar los
 * selectores.
 */
export interface Municipio {
  id: number;
  code?: string;
  name: string;
}

/** Tipo de establecimiento (`GET /api/tipo-establecimiento`). Comprobado. */
export interface TipoEstablecimiento {
  id: number;
  name: string;
}
