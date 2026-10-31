# Cubrí Seguros · Flujo de contratación (TP 5)

Checkout responsive de seguro para celular realizado para la materia Diseño UX-UI

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
npm test
npm run build
npm run preview
```

## Estilos

Tailwind CSS v4 y Basecoat se integran mediante Vite. Los estilos propios están separados en `src/styles/`: tokens, base, componentes, layout y páginas.

## Flujo y reglas

- Los datos del equipo, plan y titular se comparten entre pantallas y sobreviven a una recarga mediante `localStorage`.
- Las cuotas se calculan desde `public/data/planes.json` con la tasa anual del plan y el factor por antigüedad definidos en el PDF.
- Los formularios muestran errores al salir del campo, bloquean el avance con datos inválidos y enfocan el primer error al intentar continuar.
- El pago es una simulación local: `4000 0000 0000 0002` genera el rechazo; cualquier otro número válido de 16 dígitos se aprueba. No se envían ni guardan datos de tarjeta o CVV.
- La pantalla de éxito genera un número de póliza de prueba y permite descargar una constancia de simulación sin validez legal.

## Prueba en Netlify

Si se desea probar el proyecto puede hacerlo en el siguiente enlace:
https://seguros-ux-ui.netlify.app/