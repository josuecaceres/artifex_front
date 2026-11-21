import { BRAND, copyrightText } from './brand';
import { version } from '../../../../package.json';

describe('brand', () => {
  it('toma la versión de package.json con el prefijo V', () => {
    expect(BRAND.version).toBe(`V${version}`);
    expect(BRAND.version).toMatch(/^V\d+\.\d+\.\d+/);
  });

  it('apunta el logo a public/images/thumbnail.png', () => {
    expect(BRAND.imageUrl).toBe('images/thumbnail.png');
  });

  it('arma el aviso de derechos con el año recibido y por defecto el actual', () => {
    expect(copyrightText(new Date(2031, 5, 1))).toBe('© 2031 Artifex');
    expect(copyrightText()).toBe(`© ${new Date().getFullYear()} Artifex`);
  });
});
