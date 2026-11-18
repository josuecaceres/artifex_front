#!/usr/bin/env node
/**
 * Crea `src/environments/dev-login.ts` a partir de la plantilla si no existe.
 * Ese archivo guarda las credenciales de desarrollo y no se versiona, pero el
 * código lo importa: sin él, el build y los tests fallarían en un equipo nuevo.
 * Se ejecuta solo (scripts `pre*` de package.json).
 */
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(import.meta.dirname, '..', 'src', 'environments');
const target = join(dir, 'dev-login.ts');

if (!existsSync(target)) {
  copyFileSync(join(dir, 'dev-login.example.ts'), target);
  console.log(
    'Creado src/environments/dev-login.ts (sin credenciales). Edítalo para activar el acceso automático en desarrollo.',
  );
}
