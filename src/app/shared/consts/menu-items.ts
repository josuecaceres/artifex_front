/** Un enlace sencillo del menú lateral (riel). */
export interface MenuLink {
  readonly label: string;
  readonly path: string;
}

/**
 * Un grupo de enlaces del menú lateral, mostrado como acordeón: al abrir uno,
 * se cierra el que estuviera abierto (ver `Layout`).
 */
export interface MenuGroup {
  readonly label: string;
  readonly children: readonly MenuLink[];
}

export type MenuEntry = MenuLink | MenuGroup;

/** Distingue un grupo de un enlace simple. */
export function isMenuGroup(entry: MenuEntry): entry is MenuGroup {
  return 'children' in entry;
}

/**
 * Estructura del menú lateral del dashboard. Al agregar una pantalla nueva
 * con enlace propio, agregarla aquí (no hace falta tocar `Layout`).
 */
export const MENU_ITEMS: readonly MenuEntry[] = [
  { label: 'Inicio', path: '/dashboard' },
  {
    label: 'Usuarios del sistema',
    children: [
      { label: 'Usuarios', path: '/dashboard/usuarios' },
      { label: 'Roles y permisos', path: '/dashboard/roles' },
    ],
  },
  {
    label: 'Empresa',
    children: [
      { label: 'Empresas', path: '/dashboard/empresas' },
      { label: 'Sucursales', path: '/dashboard/sucursales' },
    ],
  },
  {
    label: 'Inventario',
    children: [
      { label: 'Proveedores', path: '/dashboard/proveedores' },
      { label: 'Marcas', path: '/dashboard/marcas' },
      { label: 'Impuestos', path: '/dashboard/impuestos' },
      { label: 'Categorías', path: '/dashboard/categorias' },
      { label: 'Unidades de medida', path: '/dashboard/unidades' },
    ],
  },
];
