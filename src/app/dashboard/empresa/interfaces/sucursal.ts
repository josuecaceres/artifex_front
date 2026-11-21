/**
 * Sucursal o establecimiento (`GET /api/branches`). Forma comprobada contra
 * la API real: además de los ids trae los nombres resueltos (`*_name`,
 * `manager`) y **no devuelve `printer_uuid`**, así que el front no puede
 * precargarlo al editar (ver `UpdateSucursalRequest`).
 */
export interface Sucursal {
  id: number;
  name: string;
  phone: string;
  email: string;
  tipo_establecimiento: number | null;
  tipo_establecimiento_name: string | null;
  departamento_id: number;
  departamento_name: string;
  municipio_id: number;
  municipio_name: string;
  complemento_direccion: string;
  manager: string | null;
  manager_id: number | null;
  branch_code: string | null;
  cod_estable_mh: string | null;
  cod_estable: string | null;
  cod_pventa_mh: string | null;
  cod_pventa: string | null;
  is_active: boolean;
}

/**
 * Cuerpo de `POST /api/crear-sucursal`. Obligatorios: `name`, `phone`,
 * `email`, `departamento_id`, `municipio_id` y `complemento_direccion`; el
 * resto acepta `null` u omitirse. Los ids se validan contra su catálogo (un
 * id inexistente da 500 por llave foránea), pero no que el municipio
 * pertenezca al departamento. `manager_id` es un id de usuario.
 * `printer_uuid` no se valida como UUID.
 */
export interface CreateSucursalRequest {
  name: string;
  phone: string;
  email: string;
  tipo_establecimiento: number | null;
  departamento_id: number;
  municipio_id: number;
  complemento_direccion: string;
  manager_id: number | null;
  branch_code: string | null;
  cod_estable_mh: string | null;
  cod_estable: string | null;
  cod_pventa_mh: string | null;
  cod_pventa: string | null;
  printer_uuid?: string | null;
}

/**
 * Cuerpo de `PUT /api/actualizar-sucursal/{id}`. Comprobado: `is_active` y
 * `tipo_establecimiento` (no nulo) son obligatorios al editar, aunque al
 * crear sean opcionales; `printer_uuid` **omitido se conserva** y `null` lo
 * borra, y como el listado no lo devuelve el front solo lo envía si el
 * usuario escribe uno nuevo.
 */
export interface UpdateSucursalRequest extends Omit<
  CreateSucursalRequest,
  'tipo_establecimiento'
> {
  tipo_establecimiento: number;
  is_active: boolean;
}
