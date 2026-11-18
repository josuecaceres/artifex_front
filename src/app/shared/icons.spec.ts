import * as shared from './icons';

describe('icons', () => {
  const icons = Object.entries(shared).filter(
    ([name]) => name.startsWith('fa') && name !== 'FaIconComponent',
  );

  it('exporta los iconos del proyecto', () => {
    expect(icons.length).toBeGreaterThan(0);
  });

  it('cada exportación es un icono de Font Awesome válido', () => {
    for (const [name, icon] of icons) {
      const definition = icon as {
        prefix?: string;
        iconName?: string;
        icon?: unknown[];
      };
      expect(definition.prefix).withContext(name).toBe('fas');
      expect(definition.iconName).withContext(name).toBeTruthy();
      expect(Array.isArray(definition.icon)).withContext(name).toBeTrue();
    }
  });

  it('exporta el componente fa-icon', () => {
    expect(shared.FaIconComponent).toBeDefined();
  });
});
