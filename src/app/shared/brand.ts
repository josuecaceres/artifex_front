// El número de versión sale de `package.json` (única fuente: se sube ahí). Es
// el único import relativo fuera de `src` que se permite, porque no hay alias
// para la raíz del proyecto.
import { version } from '../../../package.json';

/**
 * Marca de la aplicación, en un solo lugar (como la paleta de colores).
 * Artifex es una plataforma que se entrega a varias empresas, y la marca puede
 * cambiar por cliente: el logo es el archivo `public/images/thumbnail.png`
 * (se reemplaza por otro con el mismo nombre, sin tocar código) y su ruta,
 * relativa a `<base href>`, se declara aquí.
 */
export const BRAND = {
  /** Nombre que acompaña al logo y al aviso de derechos. */
  name: 'Artifex',
  /** Logo: `public/images/thumbnail.png`. */
  imageUrl: 'images/thumbnail.png',
  /** Versión visible, tomada de `package.json` (p. ej. `V1.0.0`). */
  version: `V${version}`,
} as const;

/** Aviso de derechos con el año actual, p. ej. `© 2026 Artifex`. */
export function copyrightText(now: Date = new Date()): string {
  return `© ${now.getFullYear()} ${BRAND.name}`;
}
