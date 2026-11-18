# CLAUDE.md

Guía de contexto para Claude Code en este repositorio. Mantener actualizado a medida que se definan funcionalidades y reglas.

## Proyecto

- El nombre "artifex" es solo el nombre del repositorio; **no describe el dominio** de la aplicación. No inferir funcionalidad a partir del nombre.
- Aplicación **frontend** en Angular. El backend lo desarrolla otra persona: este proyecto **solo consume servicios** (APIs). No implementar lógica de servidor.
- Estado actual: base de Angular CLI con entornos, herramientas de formato y tests, Playwright e2e y la base visual de Angular Material con tema claro/oscuro ya implementadas. Login y logout probados contra el backend de desarrollo. Layout del dashboard (riel + barra superior) y los módulos de Usuarios, Roles y permisos, Empresas, Sucursales, Proveedores, Marcas, Impuestos, Categorías y Unidades de medida ya tienen pantalla, servicio y pruebas unitarias, construidos contra el contrato documentado en Postman (ver más abajo): **sin probar todavía contra la API real** (bloqueo de IP del equipo al escribir esto). Además existe la galería `/kit` (desarrollo).
- **Colección de Postman como contrato cuando la API no es accesible**: el equipo tiene acceso de solo lectura al workspace de Postman "Artifex Pos" (compartido por el backend), con una colección por módulo (Login, Empresas, Inventarios, Productos, Roles, Sucursales). La CLI de Postman (`postman`, instalada en el equipo) puede leer esas colecciones sin necesitar permiso de "enviar petición" ni de exportar desde la UI: `postman login`, luego `postman workspace list --filter "Artifex"` para el id del workspace, y `postman collection list --workspace <id>` / `postman collection get <id> --json` para ver cada petición guardada (método, headers, body de ejemplo). **Ninguna colección trae un ejemplo de respuesta guardado**: solo da la forma del *request*, nunca la de la respuesta real. Además, la colección documenta lo que el compañero de backend fue probando, no siempre el contrato vigente (cuerpos viejos, hosts de prueba): ante cualquier duda, confirmar con él en vez de asumir lo que dice Postman — **confirmado por el usuario**: su compañero programa a su propio ritmo y la documentación de Postman va a otro ritmo, así que puede quedar desactualizada o incompleta sin que eso signifique que el contrato cambió. Las peticiones guardadas pueden traer tokens u otros datos reales capturados: tratarlos como sensibles y no repetirlos. **El host a usar siempre es `environment.apiUrl`** (confirmado por el usuario): los hosts distintos que a veces aparecen en las colecciones (`127.0.0.1:8000`, etc.) son del entorno local del backend, no hay que replicarlos ni preocuparse por ellos.
- **Estado de las colecciones de Postman** (confirmado por el usuario): Login, Roles, Empresas, Sucursales e Inventarios ya se usaron para construir sus módulos. **Productos** es la única que el backend todavía está armando activamente, por eso está incompleta — no asumir que lo que trae hoy es la forma final; confirmar con el backend antes de construir ese módulo.
- **Otra fuente de contrato: documentos sueltos del backend**. Además de Postman, el backend (Adolfo) a veces pasa un documento (`.docx`) con ejemplos de body y validaciones más precisas que las de Postman (p. ej. tipos exactos, campos obligatorios). Cuando el usuario mencione uno, leerlo con `pandoc` si está disponible o, si no, descomprimiendo el `.docx` (es un zip) y extrayendo el texto de `word/document.xml`. Esa fuente es más confiable que el ejemplo de Postman cuando ambos no coinciden (ver nota de `tipo_establecimiento` en `Sucursal`, `@interfaces`). Estos documentos también pueden traer credenciales reales sueltas: mismo criterio que con Postman, no repetirlas y confirmar con el usuario qué hacer con ellas antes de usarlas en cualquier archivo.
- El backend usa "empresa" de forma ambigua: la colección de Postman "Artifex Empresas" es el registro legal (NIT, NRC, nombre comercial), pero en conversación o documentos sueltos "empresa"/"establecimiento" puede referirse en realidad a una **sucursal** (los campos lo delatan: `departamento_id`, `tipo_establecimiento`, `cod_estable_mh`, etc., son de la colección "Artifex Sucursales"). Confirmar por los campos, no por el nombre que use el documento.
- API: se llama directamente a `environment.apiUrl` (URL absoluta, sin proxy de desarrollo). El backend responde con `access-control-allow-origin: *`, pero en la prueba de preflight `access-control-allow-headers` vino vacío: si una petición con `Authorization` o `Content-Type: application/json` falla por CORS, avisar al desarrollador del backend.
- **API multi-tenant**: todas las peticiones llevan el header `X-TENANT` (valor en `environment.tenant`, hoy `empresa001`; sin él la API responde 401 "Tenant requerido"). El token va en `Authorization: Bearer`. El backend también restringe por **IP**: una IP no autorizada recibe 403 `{"message":"Su IP no está autorizada.","ip":"..."}`; si el login falla así, hay que pedir que autoricen la IP del equipo (la de este equipo ya está autorizada). El CORS permite desde el navegador los headers `content-type`, `x-tenant` y `authorization`.
- **Contrato de auth** (comprobado): `POST /api/login` con `{ user_name, password }` → 200 `{ token, user: { id, name, email }, roles, permissions, tenant }` (`roles` es un texto y `permissions` una lista de nombres como `"ver usuarios"`); con credenciales malas → 401 `{ "message": "Credenciales inválidas" }`. `POST /api/logout` va **sin cuerpo** (solo el token) → 200 `{ "message": "Sesión cerrada correctamente" }`; el token queda invalidado (401 "The token has been blacklisted"). El token es un JWT. Hoy la app solo guarda `token`; `roles` y `permissions` se usarán en los guards de permisos.
- Todo acceso a la API pasa por `apiUrl('api/...')` (`@services`) y por `HttpClient` con `apiInterceptor` (ver Rutas y guards → Sesión y API).
- Por ahora solo existe el entorno de desarrollo del backend; `environment.ts` y `environment.prod.ts` apuntan a la misma URL. Actualizar `environment.prod.ts` cuando exista la API de producción.

## Stack

- Angular 20 (CLI 20.1.x), TypeScript 5.8 en modo `strict`.
- Componentes **standalone** (sin NgModules propios; la única excepción es `MaterialModule`, ver Stack → Angular Material, que solo agrega módulos de terceros).
- Detección de cambios **zoneless** (`provideZonelessChangeDetection`), por lo que el estado reactivo debe usar **signals** (o `async` pipe / `toSignal`).
- SCSS para estilos. Prefijo de selectores: `app`.
- Tests unitarios: Karma + Jasmine. Formato: Prettier.
- **Angular Material 20** (`@angular/material` y `@angular/cdk` `^20.2`) como base de componentes, **siempre con estilo propio** (dirección "Metro nocturno", ver sección Diseño). Tipografías autoalojadas con `@fontsource/barlow-condensed` y `@fontsource-variable/source-sans-3`. Los componentes importan `MaterialModule` (`@shared/material.module.ts`) en vez de cada `Mat*Module` por separado: es un `@NgModule` real que agrega todos los módulos de Material usados en el proyecto vía `imports`/`exports`, y un componente standalone puede ponerlo directo en su propio `imports`. **Esto sí funciona** (a diferencia de los iconos, no es un archivo barril con reexportaciones de TypeScript): reexportar los `Mat*Module` con `export { X } from '@angular/material/...'` desde un archivo intermedio rompe NG3004 (el compilador no resuelve ahí las directivas que cada módulo declara, como `MatTable` o `MatDialogClose`), y usar `export *` para esquivar eso rompe la resolución de esbuild (genera una ruta rota hacia el paquete); un `@NgModule` que agrega esos módulos vía `imports`/`exports` evita ambos problemas porque Angular los resuelve por su propio sistema de módulos, no por reexportación de TS. Al usar un módulo de Material nuevo, agregarlo también a `MAT_MODULES` en `material.module.ts`. Las clases/tokens que no son `NgModule` (`MatDialog`, `MatDialogRef`, `MAT_DIALOG_DATA`, `MatSort`, `MatPaginator`, `MatTableDataSource`, `MatSnackBar`, etc.) se siguen importando directo de `@angular/material/*`, no desde `MaterialModule`.
- **Font Awesome** para los iconos: `@fortawesome/angular-fontawesome` `^3.0.0` (la línea de Angular 20; la 4.x y 5.x son para Angular 21 y 22) y `@fortawesome/free-solid-svg-icons` `^7`. Solo el set gratuito *solid*; otros sets se consultan antes.
- Sin librerías de estado ni SSR por ahora. No agregar dependencias sin consultarlo antes.
- Pruebas e2e con Playwright (`@playwright/test`, solo Chromium headless), contra la **API real**. Ver sección Pruebas e2e.

## Comandos

- `npm start` (`ng serve`): servidor de desarrollo en http://localhost:4200
- `npm run build`: build de producción en `dist/` (usa `environment.prod.ts`)
- `npm run watch`: build de desarrollo en modo watch
- `npm test` (`ng test`): tests unitarios en modo watch
- `npm run test:ci`: tests una sola vez, con Chrome headless sin sandbox (`karma.ci.conf.js`)
- `npm run format` / `npm run format:check`: aplica o verifica Prettier sobre `src/**/*.{ts,html,scss}`
- `npm run check:contrast`: verifica los contrastes WCAG AA de la paleta (`src/styles/theme/_palette.scss`) en tema claro y oscuro. Ejecutarlo tras cambiar cualquier color.
- `npm run e2e`: pruebas e2e del project `test` (ver sección Pruebas e2e).
- `npm run e2e:prod`: pruebas e2e del project `prod`, solo lectura.
- `npm run e2e:install`: descarga Chromium para Playwright (una vez por equipo).
- `npm run visual-check`: capturas de las rutas en `tmp/visual-checks/` (ignorada por git). Requiere la app corriendo; las rutas se agregan en `scripts/visual-check.mjs` a medida que existan pantallas.
- `ng generate component <nombre>`: scaffolding

## Estructura del código

- `src/main.ts`: bootstrap.
- `src/app/app.config.ts`: providers globales (router, zoneless, y los de Angular Material: adaptador de fechas y textos en español, campos de contorno por defecto, selector y switch sin iconos). Idioma de la interfaz: `es` (decidido: sin región específica para fechas y números; los montos usan `LempiraPipe`).
- `src/app/app.routes.ts`: rutas base (ver sección Rutas y guards).
- `src/app/auth/`: rutas públicas de `/auth` (`auth.routes.ts`, `login/`, `forgot-password/`). `src/app/dashboard/`: rutas privadas de `/dashboard` (`dashboard.routes.ts`, `layout/` con el riel y la barra superior, `home/`, `usuarios/`, `roles/`). `src/app/not-found/` y `src/app/not-authorized/`: páginas de error en la raíz. Cada carpeta es una funcionalidad con sus propias páginas.
- `src/app/guards/` (`@guards`): guards de rutas. Hoy `authGuard`.
- `src/app/dev.routes.ts`: rutas solo de desarrollo (`/kit`). El build `production` lo reemplaza por `dev.routes.prod.ts` (vacío) con `fileReplacements`, así que la galería no entra al bundle final.
- `src/app/kit/`: galería de componentes (`/kit`) para ver el estilo en tema claro y oscuro. Todo componente nuevo con estilo propio debe agregarse aquí.
- `src/app/services/` (`@services`): servicios. Hoy `ThemeService` (modos `system`, `light`, `dark`; guarda en `localStorage`, aplica `data-theme` en `<html>`), `AuthService` (sesión: token y, si llega, el usuario del login, ambos en `localStorage`), `UserService` (usuarios: listar, crear, editar, `change-password`), `RoleService` (roles y catálogo de permisos), `EmpresaService` (empresas: listar, crear, editar), `SucursalService` (sucursales: listar, crear, editar), `ProveedorService`, `MarcaService`, `ImpuestoService`, `CategoriaService` y `UnidadService` (catálogos de inventario: listar, crear, editar), `apiInterceptor` (tenant, token y 401), `apiUrl` / `apiErrorMessage` (dirección de endpoints y texto de errores de la API) y `devLoginInitializer` (acceso automático solo en desarrollo).
- `src/app/interfaces/` (`@interfaces`): tipos de las peticiones y respuestas de la API. Hoy `LoginRequest`, `LoginResponse`, `AuthUser`, `AuthTenant`, `AppUser`, `CreateUserRequest`, `UpdateUserRequest`, `ChangePasswordRequest`, `Role`, `Permission`, `PermissionRef`, `SaveRoleRequest`, `Empresa`, `CreateEmpresaRequest`, `UpdateEmpresaRequest`, `Sucursal`, `CreateSucursalRequest`, `UpdateSucursalRequest`, `Proveedor`, `Marca`, `Impuesto`, `Categoria`, `Unidad` y sus respectivos `Create*Request`/`Update*Request`. Los que vienen del contrato de Postman (sin ejemplo de respuesta) lo dicen en su comentario.
- `src/app/shared/` (`@shared`): piezas compartidas. Hoy `icons.ts` (registro central de iconos de Font Awesome), `material.module.ts` (`MaterialModule`: agrega los `Mat*Module` usados en el proyecto; ver Stack → Angular Material), `menu-items.ts` (`MENU_ITEMS`: estructura del menú del riel, enlaces simples y grupos; ver `Layout` en Rutas y guards), `SpanishPaginatorIntl`, `LempiraPipe`, `StatusPage` y la directiva `SubmitLock` (`appSubmitLock`, ver Convenciones).
- `src/styles.scss` y `src/styles/`: estilos globales. `theme/_palette.scss` (colores), `theme/_index.scss` (variables `--app-*`), `theme/_material.scss` (enlace con `--mat-sys-*`), `_base.scss` y `components/` (un parcial por familia de componentes).
- `src/app/app.ts` / `app.html`: componente raíz, solo contiene `<router-outlet />`.
- `src/environments/`: `environment.ts` (desarrollo) y `environment.prod.ts` (producción), ambos con `production` y `apiUrl`. El build `production` reemplaza uno por otro vía `fileReplacements` en `angular.json`.
- `scripts/`: utilidades de desarrollo: `visual-check.mjs`, `check-contrast.mjs` y `ensure-dev-login.mjs` (crea `src/environments/dev-login.ts` desde la plantilla si falta; se ejecuta solo en los scripts `pre*` de `start`, `build`, `watch`, `test` y `test:ci`).
- `e2e/`: pruebas Playwright (`*.spec.ts`), con `support/screenshot.ts` (helper de capturas) y su propio `tsconfig.json`, fuera de la compilación de Angular.
- `playwright.config.ts`: configuración de Playwright.

### Alias de rutas (`tsconfig.json`)

`@shared`, `@interfaces`, `@services` y `@guards` apuntan a `src/app/shared`, `src/app/interfaces`, `src/app/services` y `src/app/guards`. Las cuatro carpetas ya existen. Cada alias sin `/*` necesita un `index.ts` en su carpeta.

## Diseño

Dirección elegida: **Metro nocturno**. Los diseños aprobados están en el canvas de artifact "Metro nocturno" (https://claude.ai/artifact/L5GVvfWgwMwApYpx6R35Wo, requiere la cuenta del usuario) y el contexto de producto en `PRODUCT.md`; el contrato de diseño está en `.impeccable/surfaces/`.

- **Paleta parametrizada**: `src/styles/theme/_palette.scss` es el único archivo que hay que tocar para cambiar colores (dos mapas, `$light` y `$dark`, con las mismas claves). De ahí salen las variables `--app-*` y se enlazan a `--mat-sys-*` de Material. Tras cualquier cambio: `npm run check:contrast`. No usar colores literales en componentes: usar `var(--app-*)`.
- **Tema**: claro (porcelana, fondo gris `#e5e9ef` con tarjetas blancas) y oscuro (marino profundo: fondo `#050f1b` casi negro, tarjetas, diálogos y menús apenas más claros con contorno fino; tomado de un video de referencia del cliente). Los neutros de los dos temas comparten el tono marino acero (≈213°): al ajustar uno, mantener el otro en esa familia. `ThemeService` lo cambia; en modo `system` sigue `prefers-color-scheme`. El riel de navegación (y el panel del dibujo del login) usa el mismo marino `#041223` en ambos temas; la barra superior (`mat-toolbar`) lleva ese mismo marino y se lee como una sola pieza con el riel, también en ambos temas (`mat.toolbar-overrides` en `_surfaces.scss`). En el tema claro, `action` (botón primario, foco, casillas, switches, pestañas) es ese mismo marino del riel, y `link` (enlaces y "en curso") es `#1f5596`, un tono más claro de la misma familia para distinguirse del texto; en el oscuro, `action` es el cobalto `#2f6fd8`.
- **Elemento activo**: el enlace activo del riel (y la cabecera del grupo mientras está abierto) lleva solo un relleno redondeado (`rail-selected`) y texto blanco — **sin ningún símbolo adicional**: se probó un punto tipo "estación" antes de cada enlace, pero se veía como un radio button y se quitó (decisión del usuario, viendo el canvas, para que se pareciera al video de referencia: solo el enlace y su tonalidad). No reintroducir ese punto ni nada similar (el token `rail-accent` que le daba color ya no existe en la paleta). En menús y listas desplegables el elemento señalado se rellena con `selected` (la opción ya elegida, con un relleno más suave y su marca) — ese patrón si sigue vigente, es un caso distinto del riel. El velo detrás de los diálogos es más denso en oscuro (`--app-backdrop-opacity` en `theme/_index.scss`). El selector de tema de la barra superior (`mat-button-toggle-group`) usa ese mismo tratamiento del riel (`rail-selected`, texto blanco): sus tokens están en `_data.scss`, no duplicarlos en otro archivo.
- **Grupos del menú del riel**: un grupo de `MENU_ITEMS` (`@shared/menu-items.ts`) se muestra como acordeón (`mat-accordion` + `mat-expansion-panel` en `Layout`), no como submenú flotante: al abrir uno se cierra el que estuviera abierto, porque todos los grupos viven dentro de un único `mat-accordion` (su comportamiento de abrir-uno-cierra-otro es el que trae Material por defecto, sin pasarle `multi`). El grupo se abre solo si la ruta activa es uno de sus enlaces (`Layout.isGroupActive`). Los tokens de la cabecera del grupo están en `_rail.scss`, junto a los de la lista.
- **Un color, un significado**: cobalto (`action`/`link`) = acción, selección y "en curso"; verde (`ok`) = completado; ámbar (`warn`) = demora o atención; escarlata (`crit`) = crítico, vencido y errores. Los estados nunca dependen solo del color: llevan símbolo dibujado y texto (clases `app-status app-status--active|ok|warn|crit`). `ok` y `warn` solo se usan sobre superficies (tarjetas), no directamente sobre el fondo de página.
- **Tipografía**: Barlow Condensed (títulos, etiquetas, cifras; mayúsculas con tracking) y Source Sans 3 (texto y formularios). Esquinas: 6 px en controles, 8 px en paneles; controles de 44 a 48 px. Paneles con contorno fino y sin sombra; sombra solo en elementos flotantes (diálogos, menús, calendario).
- **Cómo se personaliza Material**: con los tokens `mat.*-overrides` en `src/styles/components/` (un parcial por familia: botones, superficies, formularios, datos, riel) y la paleta en `_material.scss`. Evitar `::ng-deep` y estilos genéricos de Material.
- **Reglas de diseño** (skill `impeccable`): nada de bordes laterales de color mayores de 1 px en tarjetas, filas o alertas; no usar glifos Unicode como iconos (los símbolos de estado son SVG dibujados); no anidar tarjetas; tematizar también selección de texto, caret, scrollbar y foco.
- **Iconos**: Font Awesome con `<fa-icon [icon]="faX" />`. Todos los iconos del proyecto se centralizan en `src/app/shared/icons.ts`, el **único** archivo que importa de `@fortawesome/*`; los componentes importan de `@shared` (`import { FaIconComponent, faPlus } from '@shared';`). Para usar un icono nuevo, agregarlo en ese archivo (orden alfabético). No importar de `@fortawesome/*` en otros archivos, ni usar la biblioteca global ni `mat-icon`. Los iconos heredan el color del texto; un botón solo con icono lleva `aria-label`. Los símbolos de estado (`app-status`) siguen siendo SVG propios.
- **Moneda y números**: la interfaz usa el idioma `es`. Los montos se muestran en lempiras con `LempiraPipe` (`@shared`): `{{ monto | lempira }}` → `L 1,240.50` (formato `es-HN`, "L" con espacio sin salto). No usar `number` ni `currency` para montos.
- **Datos de ejemplo**: el nombre "Operaciones" y todos los datos de `/kit` son sintéticos; el dominio real sigue sin definir.

## Rutas y guards

Hay dos grupos de rutas, ambos con carga diferida (`loadChildren` / `loadComponent`):

| URL | Qué es | Acceso |
|---|---|---|
| `/` | redirige a `/dashboard` | |
| `/auth/login`, `/auth/forgot-password` | login y recuperar contraseña (`/auth` → login) | pública |
| `/not-found`, `/not-authorized` | páginas de error, **en la raíz** (no bajo `/auth`) | pública |
| `/dashboard` | panel provisional | `authGuard` |
| `/dashboard/usuarios` | administrar usuarios | `authGuard` |
| `/dashboard/roles` | administrar roles y permisos | `authGuard` |
| `/dashboard/empresas` | administrar empresas | `authGuard` |
| `/dashboard/sucursales` | administrar sucursales y establecimientos | `authGuard` |
| `/dashboard/proveedores` | administrar proveedores | `authGuard` |
| `/dashboard/marcas` | administrar marcas | `authGuard` |
| `/dashboard/impuestos` | administrar impuestos | `authGuard` |
| `/dashboard/categorias` | administrar categorías | `authGuard` |
| `/dashboard/unidades` | administrar unidades de medida | `authGuard` |
| `/kit` | galería de componentes, solo desarrollo | sin guard |
| cualquier otra URL | redirige a `/not-found` | |

- **`Layout`** (`dashboard/layout/`): componente de la ruta `''` dentro de `dashboard.routes.ts`, con el riel de navegación y la barra superior (selector de tema); sus rutas hijas (`''` → `Home`, `usuarios`, `roles`, `empresas`, `sucursales`, `proveedores`, `marcas`, `impuestos`, `categorias`, `unidades`) se renderizan en su `<router-outlet>`. Cada pantalla pone su propio `<h1>`, sin envolver en `<main>`: ese landmark ya lo pone `Layout`. El riel sale de `MENU_ITEMS` (`@shared/menu-items.ts`): hoy es Inicio (enlace suelto), el grupo "Usuarios del sistema" (Usuarios, Roles y permisos), el grupo "Empresa" (Empresas, Sucursales) y el grupo "Inventario" (Proveedores, Marcas, Impuestos, Categorías, Unidades de medida), todos como acordeón (ver Diseño → Grupos del menú del riel). Al agregar un módulo nuevo con pantalla propia, agregar su enlace (suelto o dentro de un grupo) en `MENU_ITEMS`, no en `Layout`.
- **`authGuard`**: sin sesión, redirige a `/auth/login?returnUrl=<url pedida>`. La sesión la da `AuthService` (`@services`): signal `isAuthenticated`, token en `localStorage` (clave `app-token`). `login()` (`POST /api/login`) guarda el token; `logout()` (`POST /api/logout`) cierra la sesión local aunque la llamada falle; `clearSession()` solo la cierra en el navegador.
- **Guards de roles y permisos**: la plataforma administra roles y permisos, así que se irán agregando en `src/app/guards/`. Se escriben como fábricas (`permissionGuard('usuarios.ver')`), se exportan desde `@guards` y se ponen en las rutas de `dashboard` junto a `authGuard`. Cuando el acceso se niega, redirigir a `/not-authorized`. El modelo de roles y permisos se define con el backend: no inventarlo. Hoy `/dashboard/usuarios`, `/dashboard/roles`, `/dashboard/empresas` y `/dashboard/sucursales` solo llevan `authGuard`, sin `permissionGuard` todavía (ver Tareas pendientes).
- **Sesión y API**: `provideHttpClient(withInterceptors([apiInterceptor]))` está en `app.config.ts`. El interceptor actúa solo sobre URLs de `environment.apiUrl`: añade `X-TENANT` a todas, `Authorization: Bearer` a todas menos las públicas (`PUBLIC_API_PATHS` en `services/api.ts`: `/api/login`, `/api/change-password`), y ante un 401 en una ruta privada cierra la sesión y lleva a `/auth/login?returnUrl=…`. Un 403 no cierra la sesión (IP o permisos): lo muestra quien hizo la llamada. Para mostrar errores al usuario usar `apiErrorMessage(error)`, que prefiere el `message` del backend. Una ruta pública nueva de la API se agrega a `PUBLIC_API_PATHS`.
- **Acceso automático en desarrollo** (`dev-login`): para no simular el login al trabajar en `/dashboard`, en desarrollo la app inicia sesión de verdad al arrancar (`devLoginInitializer`, con `provideAppInitializer`) si no hay sesión. Las credenciales viven en `src/environments/dev-login.ts`, **ignorado por git**; la plantilla versionada es `dev-login.example.ts` (con `null`) y el build `production` lo reemplaza por `dev-login.prod.ts` (`null`), así que nunca llegan al bundle. En un equipo nuevo el archivo se crea solo, sin credenciales: pedirlas y escribirlas ahí. Si el login falla (por ejemplo IP no autorizada) la app arranca igual y avisa con `console.warn`. Para desactivarlo: `localStorage.setItem('app-dev-login', 'off')` (útil para ver la pantalla de login tras cerrar sesión). Las pruebas e2e lo desactivan solas (`e2e/support/test.ts`).
- Las páginas de error usan el componente `StatusPage` (`@shared`). Los títulos de pestaña están en español en cada ruta (`title`).
- **Rutas nuevas privadas**: agregarlas a `dashboard.routes.ts` (no a `app.routes.ts`). Una URL dentro de `/dashboard` que no existe llega a `/not-found`.
- `package.json` declara `"sideEffects": false`: permite al empaquetador descartar lo que no se usa de los barrels (`@shared`, `@services`). Si se agrega un archivo que deba ejecutarse solo por importarse (sin usar sus exportaciones), hay que declararlo en `sideEffects`.

## Convenciones

Derivadas de la configuración del repo (`.editorconfig`, `tsconfig.json`):

- Indentación de 2 espacios, UTF-8, salto de línea final, sin espacios al final de línea.
- Comillas simples en TypeScript.
- Formato con Prettier (config en `package.json`, además de `.editorconfig`; usa `endOfLine: auto` porque en Windows `core.autocrlf` convierte los saltos de línea). Ejecutar `npm run format` antes de entregar cambios.
- **Formularios que crean o editan datos**: usar la directiva `appSubmitLock` (`@shared`) en el `<form>` para impedir el doble envío (clic repetido o Enter) y mostrar el estado de carga: `<form [formGroup]="form" [appSubmitLock]="guardar" #lock="appSubmitLock">` con `guardar = (): SubmitResult => ...` que valida y devuelve la llamada a la API (o nada si el formulario es inválido), y el botón `mat-flat-button disabledInteractive [disabled]="lock.pending()"`. La acción maneja sus propios errores. Es una defensa del cliente: la idempotencia real depende del backend.
- Respetar `strict`, `strictTemplates` y `noImplicitReturns`; evitar `any`.
- Usar el control flow moderno de plantillas (`@if`, `@for`, `@switch`) en vez de `*ngIf`/`*ngFor`.
- **Importaciones**: lo que viva en `shared`, `interfaces`, `services` o `guards` se importa siempre con su alias (`@shared`, `@interfaces`, `@services`, `@guards`, definidos en `tsconfig.json`), nunca con rutas relativas tipo `../services/...`. Las rutas relativas (`./`) solo para archivos de la misma carpeta. Si se crea otra carpeta compartida, agregar su alias al `tsconfig.json`.
- Usar `inject()` en lugar de inyección por constructor, e `input()` / `output()` en lugar de los decoradores.
- Todo código nuevo debe incluir su `.spec.ts` y mantener `npm test` y `npm run build` en verde.

## Proceso de trabajo

Aplica a **todo** el trabajo nuevo. No escribir código de implementación antes de que el usuario apruebe el plan.

1. **Idea:** se plantea y se discute con el usuario.
2. **Plan:** se redacta y se discute **en el chat**, no en un artifact.
3. **Diseño (solo si hace falta):** si hay interfaz o flujo que diseñar, se hace en un canvas de artifact. Los artifacts son **solo para diseños**, nunca para planes.
4. **Aprobación:** el usuario aprueba el plan en el chat (y el diseño, si lo hubo, por su enlace de artifact).
5. **Implementación:** solo después de la aprobación se escribe el código.

El backend lo construye otra persona y lo libera por etapas; el frontend avanza siguiendo lo que el backend va liberando. No asumir endpoints o contratos que aún no existan: confirmarlos con el usuario.

## Git y commits

- **Nunca** hacer `git commit` ni `git push` por cuenta propia (además está bloqueado en `.claude/settings.json`).
- Cuando el usuario pida algo como "Dame el commit sugerido": listar los cambios no commiteados en ese momento (`git status` / `git diff`) y describir cada cambio, para que el usuario lo copie y pegue.
- **No** incluir referencias a Claude en los mensajes de commit ni en PRs (nada de `Co-Authored-By: Claude`, "Generated with Claude Code", etc.).

## Pruebas e2e (Playwright)

- Dos projects: `test` y `prod`. Cada uno toma la URL **del front** de una variable de entorno: `E2E_TEST_BASE_URL` (por defecto `http://localhost:4200`) y `E2E_PROD_BASE_URL` (sin valor por defecto: sin ella, `npm run e2e:prod` falla con un mensaje claro).
- Las variables se leen de `.env.e2e` (fuera de git, se carga con `process.loadEnvFile`). La plantilla versionada es `.env.e2e.example`.
- Si `E2E_TEST_BASE_URL` apunta a `localhost`, Playwright levanta la app con `npm start` (o reutiliza el servidor ya corriendo). Si es una URL remota, no levanta nada.
- **Regla `@write`:** toda prueba que cree, edite o borre datos lleva `@write` en su título; el project `prod` las excluye (`grepInvert`). En producción solo corren pruebas de lectura y navegación. Es una convención, sin bloqueo técnico.
- **`test` de Playwright**: los specs importan `test` y `expect` de `./support/test` (no de `@playwright/test`): ese `test` desactiva el acceso automático de desarrollo para que cada prueba controle si hay sesión.
- **Etiqueta `@dev`:** las pruebas de páginas que solo existen en desarrollo (`/kit`) llevan `@dev` y el project `prod` también las excluye.
- Capturas: `takeScreenshot(page, testInfo, name)` guarda en `tmp/screenshots/<project>/<name>.png`. Trazas y videos en `tmp/playwright/results`, reporte HTML en `tmp/playwright/report`. Todo en `tmp/` (ignorada por git); las capturas de producción pueden mostrar datos reales y no deben salir del equipo.
- Validar tipos de las pruebas: `npx tsc -p e2e/tsconfig.json`.
- Las e2e de login: `login.spec.ts` (formulario, validación, ojo, enlace, tema oscuro y móvil; no llama a la API) y `login-real.spec.ts` (inicio de sesión contra la API real; usa `E2E_USER` y `E2E_PASSWORD` de `.env.e2e`, con una cuenta de desarrollo, y se omite si faltan; no lleva `@write` porque no modifica datos).
- Fuera de alcance por ahora: Firefox/WebKit y CI.

## Trabajo en varios equipos

El proyecto se avanza desde más de un equipo. Todo el contexto vive en este repositorio (`CLAUDE.md` y `.claude/settings.json`), no en la memoria local de Claude. Al empezar en un equipo nuevo:

1. `npm install`. Requiere Node 20.19 o superior (se ha usado Node 24).
2. Para `npm run test:ci` hace falta Google Chrome instalado (Karma usa ChromeHeadless). Para `npm run e2e`, ejecutar antes `npm run e2e:install`.
3. **Skill `angular-developer`** (origen `angular/skills`, registrado en `skills-lock.json`): los archivos están versionados en `.agents/skills/`, pero el enlace `.claude/skills/angular-developer` **no** se versiona porque apunta a una ruta absoluta del equipo. Hay que recrearlo en cada equipo (reinstalando la skill con la herramienta de skills, o enlazando `.claude/skills/angular-developer` a `.agents/skills/angular-developer`).
4. Claude no recuerda sesiones anteriores: leer este archivo y `git log` para ponerse al día.

## Tareas pendientes y decisiones abiertas

- **Playwright e2e:** implementado según el plan aprobado (solo hay la prueba `smoke`). Pendiente: decidir cómo se integra `scripts/visual-check.mjs` con Playwright (hoy es independiente y usa el paquete `playwright` que llega con `@playwright/test`).
- **CI:** `karma.ci.conf.js` está pensado para un pipeline (GitHub Actions), pero aún no existe ninguno.
- **Guards de roles y permisos**: por crear a medida que se definan los permisos con el backend (ver sección Rutas y guards). La colección de Roles de Postman ya trae un catálogo de permisos (`GET /api/lista-permisos`) y ahora hay pantalla para administrarlos (`/dashboard/roles`), pero falta decidir con el usuario cómo se nombran/usan esos permisos en el guard; mientras tanto `AuthService` guarda `roles`/`permissions` del login tal como llegan, sin usarlos todavía.
- **Verificar contra la API real** (apenas se levante el bloqueo de IP del equipo): el layout del dashboard y los módulos de Usuarios, Roles, Empresas, Sucursales, Proveedores, Marcas, Impuestos, Categorías y Unidades se construyeron contra el contrato de Postman (y, para Sucursales, también contra un documento de ejemplos del backend más preciso que Postman), ninguno con ejemplo de respuesta guardado. Falta confirmar, para cada uno: la forma exacta de `GET /api/users`, `GET /api/lista-roles`, `GET /api/lista-permisos`, `GET /api/permisos-del-rol/{id}`, `GET /api/info-empresa` (incluyendo si de verdad devuelve un arreglo: es la mayor suposición de las cuatro, ver `Empresa` en `@interfaces`), `GET /api/branches`, `GET /api/lista-proveedores`, `GET /api/lista-marcas`, `GET /api/lista-impuestos`, `GET /api/lista-categorias` y `GET /api/lista-unidades` (se asumieron campos razonables, documentado en cada interfaz de `@interfaces`); si las listas vienen paginadas (se asumió que no, como arreglo plano); si `code` de verdad no se puede editar en Impuestos (el body de `actualizar-impuesto` de Postman no lo trae); y el comportamiento real de `POST /api/change-password` (ver el punto siguiente).
- **Recuperar contraseña** (`/auth/forgot-password`): implementada contra `POST /api/change-password` (ruta pública, sin token) con el body documentado en Postman (`name`, `acronym`, `email`, `password`), confirmado por el usuario. Es una forma atípica para un flujo sin sesión (no pide la contraseña actual ni un código de verificación): sin probar todavía contra la API real ni contra el equipo de backend.
- **Login con contraseña nullable**: un documento del backend confirmó que `POST /api/login` acepta `user_name` (correo o acrónimo, sin distinguir mayúsculas) con `password` **nullable** (se puede omitir o enviar `null`). `LoginRequest` (`@interfaces`) y el formulario de login todavía piden `password` como obligatorio: pendiente de decidir con el usuario si se habilita el acceso sin contraseña.
- **Indicador de carga global** (barra superior con contador de peticiones): no se hizo; `appSubmitLock` cubre el bloqueo de formularios. Si el backend ofrece clave de idempotencia (`Idempotency-Key`) para crear y editar, agregarla en el interceptor.
- **`roles-permisos`** (`GET /api/roles-permisos` en la colección de Postman): no se usó en el módulo de Roles por no tener claro qué devuelve frente a `lista-roles` + `permisos-del-rol/{id}`; confirmar con el backend si hace falta.
- **Catálogos de Sucursales y Proveedores**: `departamento_id`, `municipio_id` y `manager_id` (gerente, probablemente un usuario) quedan como campos numéricos simples en los diálogos de Sucursal y Proveedor; no hay endpoints de catálogo documentados para departamentos ni municipios. Cambiarlos por selectores reales cuando el backend los confirme.
- **Rotar tokens de prueba expuestos en Postman**: las colecciones de Empresas, Sucursales, Inventarios y Productos traen JWT reales capturados en sus peticiones guardadas; pedirle al backend (Adolfo) que los rote.
- **Presupuesto del bundle inicial** (`angular.json`, `budgets`): con el layout y los módulos de Usuarios/Roles/Empresas/Sucursales, `npm run build` empezó a avisar (no falla) que el bundle inicial supera el límite de aviso de 500 kB configurado desde el inicio del proyecto. Pendiente decidir si se sube ese límite o se investiga más a fondo qué lo infla.
- **Decisiones abiertas**: si el cliente quiere cambiar la paleta (ver sección Diseño).

## Reglas de negocio y de equipo

_Pendiente de definir. Agregar aquí a medida que se acuerden._

## Funcionalidades

- **Login** (`/auth/login`): implementado según el diseño del canvas (claro, oscuro y móvil), con validación, estado de carga, mensajes de error del backend, redirección a `returnUrl` (solo direcciones internas) y protección contra doble envío. Probado contra el backend de desarrollo (login, error de credenciales, CORS y logout).
- **Layout del dashboard** (riel + barra superior, `dashboard/layout/`): implementado según el diseño aprobado en el canvas; riel con Inicio (enlace suelto), el grupo "Usuarios del sistema" (Usuarios, Roles y permisos), el grupo "Empresa" (Empresas, Sucursales) y el grupo "Inventario" (Proveedores, Marcas, Impuestos, Categorías, Unidades de medida) como acordeón, cerrar sesión, selector de tema con la misma tonalidad marina del riel. Probado con pruebas unitarias y e2e (no necesitan la API real).
- **Usuarios** (`/dashboard/usuarios`): listar, crear y editar usuarios (nombre, siglas, correo, sucursal —elegida de un `mat-select` con el catálogo de `SucursalService`—, autorizado, activo), con tabla ordenable y paginada. Construido contra el contrato de Postman; **sin probar contra la API real** (bloqueo de IP).
- **Roles y permisos** (`/dashboard/roles`): listar, crear y editar roles con su catálogo de permisos (casillas). Construido contra el contrato de Postman; **sin probar contra la API real** (bloqueo de IP). Sin guard de permisos todavía (ver Tareas pendientes).
- **Empresas** (`/dashboard/empresas`): listar, crear y editar empresas (nombre legal y comercial, NIT, NRC, código y descripción de actividad, correo, teléfono); al editar, además `api_key` y `private_password` opcionales (credenciales del certificado de facturación electrónica, vacío = no cambiarlas). Construido contra el contrato de Postman, **asumiendo que `GET /api/info-empresa` devuelve el arreglo de empresas** (a pesar del nombre singular, sin endpoint de listado documentado); **sin probar contra la API real** (bloqueo de IP).
- **Sucursales** (`/dashboard/sucursales`): listar, crear y editar sucursales/establecimientos (nombre, teléfono, correo, dirección, departamento, municipio y, en una sección aparte, los campos opcionales de facturación electrónica: tipo de establecimiento, gerente, código de sucursal, códigos MH y UUID de impresora). Construido contra el contrato de Postman y un documento de validaciones del backend más preciso que el ejemplo de Postman (`tipo_establecimiento` es entero, no texto); `departamento_id`, `municipio_id` y `manager_id` quedan como campos numéricos simples (ver Tareas pendientes); **sin probar contra la API real** (bloqueo de IP).
- **Proveedores** (`/dashboard/proveedores`): listar, crear y editar proveedores (nombre, NIT, NRC, teléfono, correo, persona de contacto, dirección, departamento/municipio, forma de pago y retención con su porcentaje). Construido contra el contrato de Postman; `departmento_id` (así, sin la segunda "a") es el nombre real del campo en la API, no un error de este proyecto; `departmento_id`/`municipio_id` quedan como campos numéricos simples (ver Tareas pendientes); **sin probar contra la API real** (bloqueo de IP).
- **Marcas** (`/dashboard/marcas`), **Categorías** (`/dashboard/categorias`): catálogos simples (nombre, activa). Construidos contra el contrato de Postman; **sin probar contra la API real** (bloqueo de IP).
- **Unidades de medida** (`/dashboard/unidades`): catálogo simple (nombre, código, activa). Construido contra el contrato de Postman; **sin probar contra la API real** (bloqueo de IP).
- **Impuestos** (`/dashboard/impuestos`): listar, crear y editar impuestos (nombre, código, tasa, si es porcentaje, activo); el código solo se puede fijar al crear (el campo se deshabilita al editar porque el body de `actualizar-impuesto` de Postman no lo trae). Construido contra el contrato de Postman; **sin probar contra la API real** (bloqueo de IP).
- **Recuperar contraseña** (`/auth/forgot-password`): formulario con nombre, siglas, correo y contraseña nueva (con confirmación), contra `POST /api/change-password`. Construido contra el contrato de Postman, confirmado por el usuario; **sin probar contra la API real** (bloqueo de IP).

_Pendiente de definir el resto. Registrar aquí cada funcionalidad con su estado._
