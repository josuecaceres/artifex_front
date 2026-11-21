import { MENU_ITEMS, MenuGroup, MenuLink, isMenuGroup } from './menu-items';

describe('menu-items', () => {
  it('distingue un grupo de un enlace simple', () => {
    const link: MenuLink = { label: 'Inicio', path: '/dashboard' };
    const group: MenuGroup = {
      label: 'Usuarios del sistema',
      children: [link],
    };

    expect(isMenuGroup(link)).toBe(false);
    expect(isMenuGroup(group)).toBe(true);
  });

  it('agrupa Usuarios y Roles y permisos bajo "Usuarios del sistema"', () => {
    const group = MENU_ITEMS.find(
      (item) => isMenuGroup(item) && item.label === 'Usuarios del sistema',
    ) as MenuGroup | undefined;

    expect(group).toBeTruthy();
    expect(group?.children.map((child) => child.label)).toEqual([
      'Usuarios',
      'Roles y permisos',
    ]);
  });

  it('agrupa Empresas y Sucursales bajo "Empresa"', () => {
    const group = MENU_ITEMS.find(
      (item) => isMenuGroup(item) && item.label === 'Empresa',
    ) as MenuGroup | undefined;

    expect(group).toBeTruthy();
    expect(group?.children.map((child) => child.label)).toEqual([
      'Empresas',
      'Sucursales',
    ]);
  });

  it('agrupa los catálogos de inventario bajo "Inventario"', () => {
    const group = MENU_ITEMS.find(
      (item) => isMenuGroup(item) && item.label === 'Inventario',
    ) as MenuGroup | undefined;

    expect(group).toBeTruthy();
    expect(group?.children.map((child) => child.label)).toEqual([
      'Proveedores',
      'Marcas',
      'Impuestos',
      'Categorías',
      'Unidades de medida',
    ]);
  });
});
