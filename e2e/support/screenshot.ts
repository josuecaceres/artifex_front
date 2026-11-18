import type { Page, TestInfo } from '@playwright/test';

/**
 * Guarda una captura de página completa en `tmp/screenshots/<project>/<name>.png`.
 * `tmp/` está ignorada por git. Las capturas de producción pueden mostrar datos
 * reales: no deben copiarse fuera del equipo.
 */
export async function takeScreenshot(page: Page, testInfo: TestInfo, name: string): Promise<string> {
  const path = `tmp/screenshots/${testInfo.project.name}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}
