# Cubrí Seguros · Hito 1

Maquetado estático y responsive del checkout de seguro para celular. Cada pantalla tiene su propio HTML; el alcance de este hito no incluye navegación dinámica, validaciones ni lógica de pago.

## Requisitos

- Node.js 20.19 o superior
- npm

## Desarrollo

```bash
npm install
npm run dev
```

Vite muestra la URL local al iniciar. La portada está en `index.html`; las demás pantallas viven en `views/`.

## Pantallas

| Vista | HTML | Captura mobile | Captura desktop |
|---|---|---|---|
| Catálogo | `index.html` | [Ver](./screenshots/mobile/catalogo.png) | [Ver](./screenshots/desktop/catalogo.png) |
| Cotización | `views/cotizar.html` | [Ver](./screenshots/mobile/cotizar.png) | [Ver](./screenshots/desktop/cotizar.png) |
| Planes | `views/planes.html` | [Ver](./screenshots/mobile/planes.png) | [Ver](./screenshots/desktop/planes.png) |
| Datos personales | `views/datos.html` | [Ver](./screenshots/mobile/datos.png) | [Ver](./screenshots/desktop/datos.png) |
| Pago | `views/pago.html` | [Ver](./screenshots/mobile/pago.png) | [Ver](./screenshots/desktop/pago.png) |
| Éxito | `views/exito.html` | [Ver](./screenshots/mobile/exito.png) | [Ver](./screenshots/desktop/exito.png) |
| Error de pago | `views/error-pago.html` | [Ver](./screenshots/mobile/error-pago.png) | [Ver](./screenshots/desktop/error-pago.png) |

## Verificación de producción

```bash
npm run build
npm run preview
```

## Estilos

Tailwind CSS v4 y Basecoat se integran mediante Vite. Los estilos propios están separados en `src/styles/`: tokens, base, componentes, layout y páginas.
