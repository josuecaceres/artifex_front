# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mezcla de roles que usan la aplicación con vistas distintas. Los roles concretos (cuáles son, qué ve cada uno, internos o externos) **no están definidos todavía**.

Contenido de las vistas confirmado: dashboards y formularios de datos.

## Product Purpose

Gestión operativa: registrar y dar seguimiento a datos del día a día en el backend. El dominio específico (qué entidades se gestionan) **no está definido todavía**; el nombre "artifex" es solo el nombre del repositorio y no lo describe.

## Capabilities and Constraints

- Aplicación frontend en Angular 20 (standalone, zoneless, signals) que solo consume APIs; el backend lo construye otra persona y lo libera por etapas.
- Librería de componentes decidida: Angular Material, personalizado con estilos propios mediante tokens (`mat.theme()` y variables `--mat-sys-*`), sin look Material por defecto.
- Tema claro y oscuro requerido.
- Interfaz en español. No hay internacionalización por ahora.
- Primera funcionalidad: login. Los endpoints y el body ya existen; se confirman con el usuario antes de implementar.
- Indefinido: roles, entidades de dominio, permisos, uso en móvil o tablet.

## Brand Commitments

Ninguno por ahora: no hay logo, nombre comercial ni colores de marca vinculantes. La paleta y la identidad visual quedan abiertas a propuesta.

## Evidence on Hand

No hay contenido real, datos de ejemplo ni assets. No inventar clientes, métricas ni textos de marca.

## Product Principles

- Es una herramienta de trabajo diario: la velocidad de escaneo y la consistencia pesan más que la expresión.
- El diseño parte de lo que el backend libera; no se diseña sobre contratos o entidades que aún no existen.
- La personalidad vive en detalles precisos (color, tipografía, forma, espaciado), no en decoración.
