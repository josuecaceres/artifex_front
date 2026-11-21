/**
 * Respuesta de los endpoints que crean o editan (comprobado contra la API
 * real en Empresas, Sucursales, Usuarios, Roles, Impuestos y Unidades): un
 * `message` y el registro guardado bajo `data` (en Roles, bajo `role`). Solo
 * se tipa lo que el front usa: las pantallas recargan el listado en vez de
 * leer el registro devuelto.
 */
export interface SaveResult {
  message: string;
}
