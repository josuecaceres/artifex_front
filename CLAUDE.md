# CLAUDE.md

Guía de contexto para Claude Code en este repositorio. Mantener actualizado a medida que se definan funcionalidades y reglas.

## Proyecto

- El nombre "artifex" es solo el nombre del repositorio; **no describe el dominio** de la aplicación. No inferir funcionalidad a partir del nombre.
- Aplicación **frontend** en Angular. El backend lo desarrolla otra persona: este proyecto **solo consume servicios** (APIs). No implementar lógica de servidor.
- Estado actual: base de Angular CLI con el placeholder eliminado, entornos configurados y herramientas de formato y tests listas. Aún sin funcionalidades ni rutas.
- API: se llama directamente a `environment.apiUrl` (URL absoluta, sin proxy de desarrollo). El backend responde con `access-control-allow-origin: *`, pero en la prueba de preflight `access-control-allow-headers` vino vacío: si una petición con `Authorization` o `Content-Type: application/json` falla por CORS, avisar al desarrollador del backend.
- Por ahora solo existe el entorno de desarrollo del backend; `environment.ts` y `environment.prod.ts` apuntan a la misma URL. Actualizar `environment.prod.ts` cuando exista la API de producción.

## Stack

- Angular 20 (CLI 20.1.x), TypeScript 5.8 en modo `strict`.
- Componentes **standalone** (sin NgModules).
- Detección de cambios **zoneless** (`provideZonelessChangeDetection`), por lo que el estado reactivo debe usar **signals** (o `async` pipe / `toSignal`).
- SCSS para estilos. Prefijo de selectores: `app`.
- Tests unitarios: Karma + Jasmine. Formato: Prettier.
- Sin librerías de UI, de estado ni SSR por ahora. No agregar dependencias sin consultarlo antes.
- Pruebas e2e con Playwright: **plan pendiente de aprobación**. Playwright aún no está instalado.

## Comandos

- `npm start` (`ng serve`): servidor de desarrollo en http://localhost:4200
- `npm run build`: build de producción en `dist/` (usa `environment.prod.ts`)
- `npm run watch`: build de desarrollo en modo watch
- `npm test` (`ng test`): tests unitarios en modo watch
- `npm run test:ci`: tests una sola vez, con Chrome headless sin sandbox (`karma.ci.conf.js`)
- `npm run format` / `npm run format:check`: aplica o verifica Prettier sobre `src/**/*.{ts,html,scss}`
- `npm run visual-check`: capturas de las rutas en `tmp/visual-checks/` (ignorada por git). Requiere la app corriendo y Playwright instalado; las rutas se agregan en `scripts/visual-check.mjs` a medida que existan pantallas.
- `ng generate component <nombre>`: scaffolding

## Estructura del código

- `src/main.ts`: bootstrap.
- `src/app/app.config.ts`: providers globales (router, zoneless, etc.).
- `src/app/app.routes.ts`: rutas (vacío por ahora).
- `src/app/app.ts` / `app.html`: componente raíz, solo contiene `<router-outlet />`.
- `src/environments/`: `environment.ts` (desarrollo) y `environment.prod.ts` (producción), ambos con `production` y `apiUrl`. El build `production` reemplaza uno por otro vía `fileReplacements` en `angular.json`.
- `scripts/`: utilidades de desarrollo (por ahora `visual-check.mjs`).

### Alias de rutas (`tsconfig.json`)

`@shared`, `@interfaces`, `@services` y `@guards` apuntan a `src/app/shared`, `src/app/interfaces`, `src/app/services` y `src/app/guards`. Esas carpetas **aún no existen**: se crearán después. Cada alias sin `/*` necesita un `index.ts` en su carpeta.

## Convenciones

Derivadas de la configuración del repo (`.editorconfig`, `tsconfig.json`):

- Indentación de 2 espacios, UTF-8, salto de línea final, sin espacios al final de línea.
- Comillas simples en TypeScript.
- Formato con Prettier (config en `package.json`, además de `.editorconfig`; usa `endOfLine: auto` porque en Windows `core.autocrlf` convierte los saltos de línea). Ejecutar `npm run format` antes de entregar cambios.
- Respetar `strict`, `strictTemplates` y `noImplicitReturns`; evitar `any`.
- Usar el control flow moderno de plantillas (`@if`, `@for`, `@switch`) en vez de `*ngIf`/`*ngFor`.
- Usar `inject()` en lugar de inyección por constructor, e `input()` / `output()` en lugar de los decoradores.
- Todo código nuevo debe incluir su `.spec.ts` y mantener `npm test` y `npm run build` en verde.

## Proceso de trabajo

Aplica a **todo** el trabajo nuevo. No escribir código de implementación antes de que el usuario apruebe el plan.

1. **Idea:** se plantea y se discute con el usuario.
2. **Plan:** se redacta el plan y se publica como artifact para su revisión.
3. **Diseño (solo si hace falta):** si hay interfaz o flujo que diseñar, se hace en un canvas de artifact.
4. **Aprobación:** se entrega el enlace del artifact y el usuario lo revisa y aprueba.
5. **Implementación:** solo después de la aprobación se escribe el código.

El backend lo construye otra persona y lo libera por etapas; el frontend avanza siguiendo lo que el backend va liberando. No asumir endpoints o contratos que aún no existan: confirmarlos con el usuario.

## Git y commits

- **Nunca** hacer `git commit` ni `git push` por cuenta propia (además está bloqueado en `.claude/settings.json`).
- Cuando el usuario pida algo como "Dame el commit sugerido": listar los cambios no commiteados en ese momento (`git status` / `git diff`) y describir cada cambio, para que el usuario lo copie y pegue.
- **No** incluir referencias a Claude en los mensajes de commit ni en PRs (nada de `Co-Authored-By: Claude`, "Generated with Claude Code", etc.).

## Trabajo en varios equipos

El proyecto se avanza desde más de un equipo. Todo el contexto vive en este repositorio (`CLAUDE.md` y `.claude/settings.json`), no en la memoria local de Claude. Al empezar en un equipo nuevo:

1. `npm install`. Requiere Node 20.19 o superior (se ha usado Node 24).
2. Para `npm run test:ci` hace falta Google Chrome instalado (Karma usa ChromeHeadless).
3. **Skill `angular-developer`** (origen `angular/skills`, registrado en `skills-lock.json`): los archivos están versionados en `.agents/skills/`, pero el enlace `.claude/skills/angular-developer` **no** se versiona porque apunta a una ruta absoluta del equipo. Hay que recrearlo en cada equipo (reinstalando la skill con la herramienta de skills, o enlazando `.claude/skills/angular-developer` a `.agents/skills/angular-developer`).
4. Claude no recuerda sesiones anteriores: leer este archivo y `git log` para ponerse al día.

## Tareas pendientes y decisiones abiertas

- **Playwright e2e (plan pendiente de aprobación):** propuesta publicada como artifact, https://claude.ai/artifact/UDvykaZBNncXD8DoDnoX6D (requiere la cuenta del usuario). Resumen de lo acordado:
  - `@playwright/test` como `devDependency`, Chromium headless, pruebas contra la **API real**, capturas en `tmp/` (ignorada por git).
  - Dos projects, `test` y `prod`, con URL base por variable de entorno (`E2E_TEST_BASE_URL`, `E2E_PROD_BASE_URL`) en un `.env.e2e` fuera de git (con `.env.e2e.example` versionado).
  - Propuesta de seguridad: las pruebas que escriban datos llevan la etiqueta `@write` y el project `prod` las excluye.
  - Sin CI ni login por ahora. Falta decidir cómo se integra `scripts/visual-check.mjs` con Playwright.
  - Hasta que el usuario apruebe, **no instalar Playwright ni escribir código e2e**.
- **CI:** `karma.ci.conf.js` está pensado para un pipeline (GitHub Actions), pero aún no existe ninguno.
- **Carpetas de los alias** (`shared`, `interfaces`, `services`, `guards`): por crear.

## Reglas de negocio y de equipo

_Pendiente de definir. Agregar aquí a medida que se acuerden._

## Funcionalidades

_Pendiente de definir. Registrar aquí cada funcionalidad con su estado._
