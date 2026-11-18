/**
 * Sucursal o establecimiento (`GET /api/branches`). Los campos y sus reglas
 * de validación los confirmó el backend directamente (no solo el ejemplo
 * guardado en Postman, que traía `tipo_establecimiento` como texto: aquí es
 * entero). La forma de la respuesta no está confirmada todavía contra la API
 * real.
 */
export interface Sucursal {
  id: number;
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
  printer_uuid: string | null;
  is_active: boolean;
}

/** Cuerpo de `POST /api/crear-sucursal`. */
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
  printer_uuid: string | null;
}

/** Cuerpo de `PUT /api/actualizar-sucursal/{id}`. */
export interface UpdateSucursalRequest extends CreateSucursalRequest {
  is_active: boolean;
}
