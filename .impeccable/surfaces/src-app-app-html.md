---
version: 1
slug: "src-app-app-html"
primary_target: "src/app/app.html"
related_targets: []
---

# App shell: login, panel y formularios

Modo: Operate. Usuarios con roles mixtos, jornada de escritorio completa, densidad equilibrada. Librería: Angular Material personalizado con tokens (`--mat-sys-*`). Primera pantalla: login. Dominio aún sin definir; los datos de ejemplo son sintéticos.

## Direction contract

THESIS: Cada registro viaja por una línea de metro; sus etapas son estaciones y su estado es el color de la línea. Rechaza el panel administrativo azul con tarjetas iguales y el look Material por defecto.

OWN-WORLD: Marino acero profundo (#050F1B, riel #041223; neutros de ambos temas en el tono ≈213°) con porcelana blanca; paneles de contorno fino, etiquetas en versalitas condensadas con tracking. Cuatro tintas de línea con un solo significado cada una: cobalto = acción, selección y en curso, verde = completado, ámbar = demora o atención, escarlata = crítico o vencido. Tema claro "porcelana" con el mismo riel marino que el oscuro.

STORY: Quien entra sabe en segundos dónde está cada registro y qué requiere atención, y confía en que el color nunca decora, solo informa.

FIRST VIEWPORT: Riel de navegación a la izquierda (230 px) con la sección activa subrayada en cobalto; arriba título, filtros y botón primario cobalto; fila de cuatro KPI con historial; abajo, gráfico de barras y tabla de registros con la columna Etapa dibujada como línea con estaciones.

FORM: Diagrama de metro nocturno (posición 2 de la segunda mano atrevida), seed: seed:7c29bc03ff1f0ea9. Controles estándar de Angular Material, sin disfraz de plano de metro.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisiones abiertas

- Paleta y tokens claro/oscuro: propuesta en el canvas "Metro nocturno", pendiente de aprobación.
- Roles, entidades y navegación real: pendientes del backend.
