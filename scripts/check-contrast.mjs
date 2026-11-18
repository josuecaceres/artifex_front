#!/usr/bin/env node
/**
 * Verifica los contrastes de la paleta (src/styles/theme/_palette.scss) en los
 * temas claro y oscuro. Falla (código 1) si algún par baja del mínimo WCAG AA:
 * 4,5:1 para texto y 3:1 para elementos de interfaz (bordes, foco).
 *
 * Uso: npm run check:contrast
 *
 * Los colores de estado (ok, warn) se usan solo sobre superficies y tarjetas, no
 * directamente sobre el fondo de página, por eso solo se verifican contra ellas.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const file = join(import.meta.dirname, '..', 'src', 'styles', 'theme', '_palette.scss');
const source = readFileSync(file, 'utf8');

function parseMap(name) {
  const block = source.match(new RegExp(`\\$${name}:\\s*\\(([\\s\\S]*?)\\);`));
  if (!block) {
    throw new Error(`No se encontró el mapa $${name} en ${file}`);
  }
  const colors = {};
  for (const line of block[1].split('\n')) {
    const entry = line.match(/^\s*([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*,?\s*(\/\/.*)?$/);
    if (entry) {
      colors[entry[1]] = entry[2];
    }
  }
  return colors;
}

function luminance(hex) {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function ratio(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

const TEXT = 4.5;
const UI = 3;

// [primer plano, fondo, mínimo, descripción]
const PAIRS = [
  ['ink', 'bg', TEXT, 'texto sobre fondo'],
  ['ink', 'surface', TEXT, 'texto sobre superficie'],
  ['ink', 'surface-2', TEXT, 'texto sobre superficie secundaria'],
  ['muted', 'bg', TEXT, 'texto atenuado sobre fondo'],
  ['muted', 'surface', TEXT, 'texto atenuado sobre superficie'],
  ['muted', 'surface-2', TEXT, 'texto atenuado sobre superficie secundaria'],
  ['on-action', 'action', TEXT, 'texto del botón primario'],
  ['link', 'bg', TEXT, 'enlace sobre fondo'],
  ['link', 'surface', TEXT, 'enlace sobre superficie'],
  ['ok', 'surface', TEXT, 'estado completado'],
  ['warn', 'surface', TEXT, 'estado de atención'],
  ['crit', 'surface', TEXT, 'estado crítico sobre superficie'],
  ['crit', 'bg', TEXT, 'error sobre fondo'],
  ['on-crit', 'crit', TEXT, 'texto sobre fondo crítico'],
  ['ink', 'selected', TEXT, 'texto del elemento activo de menús y listas'],
  ['link', 'selected', TEXT, 'enlace sobre el elemento activo'],
  ['rail-ink', 'rail', TEXT, 'texto del riel'],
  ['rail-ink', 'rail-selected', TEXT, 'texto del enlace activo del riel'],
  ['inverse-link', 'ink', TEXT, 'acción del aviso (superficie inversa)'],
  ['border-strong', 'surface', UI, 'borde de campo sobre superficie'],
  ['border-strong', 'bg', UI, 'borde de campo sobre fondo'],
  ['action', 'surface', UI, 'foco y selección sobre superficie'],
  ['action', 'bg', UI, 'foco y selección sobre fondo'],
];

const themes = { claro: parseMap('light'), oscuro: parseMap('dark') };
let failures = 0;

const lightKeys = Object.keys(themes.claro).sort().join(',');
const darkKeys = Object.keys(themes.oscuro).sort().join(',');
if (lightKeys !== darkKeys) {
  console.error('Los mapas $light y $dark no tienen las mismas claves.');
  console.error(`  $light: ${lightKeys}`);
  console.error(`  $dark:  ${darkKeys}`);
  process.exit(1);
}

for (const [theme, colors] of Object.entries(themes)) {
  console.log(`\nTema ${theme}`);
  for (const [fg, bg, min, label] of PAIRS) {
    if (!colors[fg] || !colors[bg]) {
      console.error(`  FALTA  ${fg} o ${bg} no existe en la paleta`);
      failures++;
      continue;
    }
    const value = ratio(colors[fg], colors[bg]);
    const ok = value >= min;
    if (!ok) failures++;
    console.log(
      `  ${ok ? 'ok   ' : 'FALLA'} ${value.toFixed(2).padStart(5)}:1 (mín. ${min})  ${label}  [${fg} ${colors[fg]} / ${bg} ${colors[bg]}]`,
    );
  }
}

if (failures > 0) {
  console.error(`\n${failures} par(es) no cumplen el contraste mínimo.`);
  process.exit(1);
}
console.log('\nTodos los pares cumplen el contraste mínimo.');
